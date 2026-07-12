from __future__ import annotations

import argparse
import asyncio
import json
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Any
from uuid import UUID

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.db.session import AsyncSessionLocal
from app.modules.chapters.models import Chapter
from app.modules.concepts.models import Concept  # noqa: F401
from app.modules.courses.models import Course  # noqa: F401
from app.modules.lessons.models import Lesson  # noqa: F401
from app.modules.atomic_concepts.models import AtomicConcept  # noqa: F401
from app.modules.question_bank.models import Question
from app.modules.quizzes.models import Quiz, QuizQuestion
from app.modules.session_blocks.models import SessionBlock  # noqa: F401
from app.modules.progress.models import SessionProgress  # noqa: F401
from app.modules.sessions.models import Session
from app.modules.videos.models import Video  # noqa: F401
from app.modules.materials.models import Material  # noqa: F401


@dataclass
class InferenceResult:
    mapped: bool
    question_id: str
    title: str
    actions: list[str]
    warnings: list[str]
    reasons: list[str]
    course_id: str | None
    chapter_ids: list[str]
    lesson_ids: list[str]
    concept_ids: list[str]
    atomic_concept_ids: list[str]

    def to_dict(self) -> dict[str, Any]:
        return {
            "mapped": self.mapped,
            "question_id": self.question_id,
            "title": self.title,
            "actions": self.actions,
            "warnings": self.warnings,
            "reasons": self.reasons,
            "course_id": self.course_id,
            "chapter_ids": self.chapter_ids,
            "lesson_ids": self.lesson_ids,
            "concept_ids": self.concept_ids,
            "atomic_concept_ids": self.atomic_concept_ids,
        }


async def main() -> None:
    parser = argparse.ArgumentParser(description="Safely backfill historical question course/academic links.")
    parser.add_argument(
        "--report",
        default="reports/question_backfill_report.json",
        help="Report path relative to backend/ or absolute path.",
    )
    parser.add_argument("--dry-run", action="store_true", help="Inspect only; do not persist changes.")
    args = parser.parse_args()

    report_path = Path(args.report)
    if not report_path.is_absolute():
        report_path = Path(__file__).resolve().parents[1] / report_path
    report_path.parent.mkdir(parents=True, exist_ok=True)

    async with AsyncSessionLocal() as session:
        question_result = await session.execute(
            select(Question)
            .options(
                selectinload(Question.chapters),
                selectinload(Question.lessons),
                selectinload(Question.concepts),
                selectinload(Question.atomic_concepts),
            )
            .order_by(Question.created_at.asc())
        )
        questions = list(question_result.scalars().all())

        reports: list[InferenceResult] = []
        for question in questions:
            report = await backfill_question(session, question)
            reports.append(report)

        if args.dry_run:
            await session.rollback()
        else:
            await session.commit()

    mapped = [item for item in reports if item.mapped]
    unmapped = [item for item in reports if not item.mapped]
    payload = {
        "summary": {
            "total_questions": len(reports),
            "mapped_questions": len(mapped),
            "unmapped_questions": len(unmapped),
            "dry_run": args.dry_run,
        },
        "mapped": [item.to_dict() for item in mapped],
        "unmapped": [item.to_dict() for item in unmapped],
    }
    report_path.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    print(json.dumps(payload["summary"], indent=2))
    print(f"report={report_path}")


async def backfill_question(session, question: Question) -> InferenceResult:
    actions: list[str] = []
    warnings: list[str] = []
    reasons: list[str] = []

    quiz_rows_result = await session.execute(
        select(Quiz, QuizQuestion)
        .join(QuizQuestion, QuizQuestion.quiz_id == Quiz.id)
        .where(QuizQuestion.question_id == question.id)
        .order_by(Quiz.created_at.asc())
    )
    quiz_rows = list(quiz_rows_result.all())

    if not quiz_rows:
        return build_unmapped(question, reasons=["No quiz relationships found"])

    quizzes = [quiz for quiz, _ in quiz_rows]
    course_ids = {quiz.course_id for quiz in quizzes}
    explicit_chapter_ids = {quiz.chapter_id for quiz in quizzes if quiz.chapter_id is not None}
    session_ids = {quiz.session_id for quiz in quizzes if quiz.session_id is not None}

    inferred_course_id: UUID | None = None
    if question.course_id is not None:
        if len(course_ids) > 1 or (course_ids and question.course_id not in course_ids):
            warnings.append("Existing course_id conflicts with quiz-linked courses")
            return build_unmapped(
                question,
                reasons=["Conflicting course signals"],
                warnings=warnings,
            )
        inferred_course_id = question.course_id
    elif len(course_ids) == 1:
        inferred_course_id = next(iter(course_ids))
        question.course_id = inferred_course_id
        actions.append("set course_id from quiz usage")
    else:
        return build_unmapped(
            question,
            reasons=["Question is used across multiple courses"],
        )

    if inferred_course_id is None:
        return build_unmapped(question, reasons=["No safe course inference"])

    if not question.chapters:
        if len(explicit_chapter_ids) == 1:
            chapter_id = next(iter(explicit_chapter_ids))
            chapter = await session.get(Chapter, chapter_id)
            if chapter is not None:
                question.chapters.append(chapter)
                actions.append("linked chapter from quiz.chapter_id")
        elif len(explicit_chapter_ids) > 1:
            warnings.append("Multiple distinct quiz chapter links")

    if not question.lessons and not question.concepts and not question.atomic_concepts:
        session_academic = await infer_session_academics(session, session_ids, inferred_course_id)
        if session_academic["status"] == "safe":
            for relation_name, items in (
                ("chapters", session_academic["chapters"]),
                ("lessons", session_academic["lessons"]),
                ("concepts", session_academic["concepts"]),
                ("atomic_concepts", session_academic["atomic_concepts"]),
            ):
                relation = getattr(question, relation_name)
                if not relation and items:
                    relation.extend(items)
                    actions.append(f"linked {relation_name} from session usage")
        elif session_academic["status"] == "ambiguous":
            warnings.append("Multiple session mappings found")

    if not actions:
        missing_parts = []
        if question.course_id is None:
            missing_parts.append("course")
        if not question.chapters and not question.lessons and not question.concepts and not question.atomic_concepts:
            missing_parts.append("academic links")
        if not missing_parts:
            reasons.append("Already mapped")
        else:
            reasons.append(f"No safe inference for {', '.join(missing_parts)}")
        return build_unmapped(question, reasons=reasons, warnings=warnings)

    return InferenceResult(
        mapped=True,
        question_id=str(question.id),
        title=question.title,
        actions=actions,
        warnings=warnings,
        reasons=reasons,
        course_id=str(question.course_id) if question.course_id else None,
        chapter_ids=[str(item.id) for item in question.chapters],
        lesson_ids=[str(item.id) for item in question.lessons],
        concept_ids=[str(item.id) for item in question.concepts],
        atomic_concept_ids=[str(item.id) for item in question.atomic_concepts],
    )


async def infer_session_academics(session, session_ids: set[UUID], course_id: UUID) -> dict[str, Any]:
    if not session_ids:
        return {"status": "none"}

    session_result = await session.execute(
        select(Session)
        .where(Session.id.in_(session_ids))
        .options(
            selectinload(Session.chapters),
            selectinload(Session.lessons),
            selectinload(Session.concepts),
            selectinload(Session.atomic_concepts),
        )
    )
    sessions = list(session_result.scalars().all())
    if not sessions:
        return {"status": "none"}
    if any(item.course_id != course_id for item in sessions):
        return {"status": "ambiguous"}

    if len(sessions) == 1:
        session_item = sessions[0]
        return {
            "status": "safe",
            "chapters": list(session_item.chapters),
            "lessons": list(session_item.lessons),
            "concepts": list(session_item.concepts),
            "atomic_concepts": list(session_item.atomic_concepts),
        }

    signature = {
        (
            tuple(sorted(str(item.id) for item in session_item.chapters)),
            tuple(sorted(str(item.id) for item in session_item.lessons)),
            tuple(sorted(str(item.id) for item in session_item.concepts)),
            tuple(sorted(str(item.id) for item in session_item.atomic_concepts)),
        )
        for session_item in sessions
    }
    if len(signature) != 1:
        return {"status": "ambiguous"}

    exemplar = sessions[0]
    return {
        "status": "safe",
        "chapters": list(exemplar.chapters),
        "lessons": list(exemplar.lessons),
        "concepts": list(exemplar.concepts),
        "atomic_concepts": list(exemplar.atomic_concepts),
    }


def build_unmapped(
    question: Question,
    *,
    reasons: list[str],
    warnings: list[str] | None = None,
) -> InferenceResult:
    return InferenceResult(
        mapped=False,
        question_id=str(question.id),
        title=question.title,
        actions=[],
        warnings=warnings or [],
        reasons=reasons,
        course_id=str(question.course_id) if question.course_id else None,
        chapter_ids=[str(item.id) for item in question.chapters],
        lesson_ids=[str(item.id) for item in question.lessons],
        concept_ids=[str(item.id) for item in question.concepts],
        atomic_concept_ids=[str(item.id) for item in question.atomic_concepts],
    )


if __name__ == "__main__":
    asyncio.run(main())
