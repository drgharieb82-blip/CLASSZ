from __future__ import annotations

import re
from collections import Counter, defaultdict
from datetime import UTC, datetime, timedelta
from uuid import UUID

from sqlalchemy import Select, case, delete, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.modules.courses.models import Course
from app.modules.enrollments.models import Enrollment
from app.modules.progress.service import get_student_progress_summary
from app.modules.question_bank.models import Question
from app.modules.quiz_attempts.models import QuizAttempt
from app.modules.results.models import QuestionResult, QuizResult
from app.modules.sessions.models import Session as ClassSession
from app.modules.student_memory.models import (
    NoteImportance,
    NoteSmartType,
    StudentNote,
    StudentQuestionBookmark,
)
from app.modules.student_memory.schemas import (
    StudentAssistantConceptRead,
    StudentAssistantContextRead,
    StudentAssistantPromptRead,
    StudentNoteCreate,
    StudentNoteRead,
    StudentNoteUpdate,
    StudentQuestionBookmarkRead,
    StudentQuestionBookmarkUpdate,
    StudentRevisionItemRead,
    StudentRevisionSummaryRead,
)
from app.modules.student_question_bank.service import list_student_wrong_questions


def _normalize_tags(tags: list[str]) -> str:
    return ",".join(sorted({tag.strip() for tag in tags if tag.strip()}))


def _split_tags(tags: str) -> list[str]:
    return [tag.strip() for tag in tags.split(",") if tag.strip()]


def _note_smart_type(body: str) -> NoteSmartType:
    text = body.lower()
    if re.search(r"(\b(mol|ph|ksp|kc|kp|reaction|equilibrium|acid|base|ion)\b|[a-z][⁺⁻])", text):
        return "chemistry-equation"
    if re.search(r"\b(newton|force|velocity|acceleration|energy|momentum|wave|volt|ohm|ampere)\b", text):
        return "physics-law"
    if re.search(r"(∫|∑|lim|d/dx|derivative|integral|sin|cos|tan|log|ln|sqrt|slope|function)", text):
        return "math-formula"
    if re.search(r"\b(is defined as|means|refers to|is the|definition|is called)\b", text):
        return "definition"
    if "?" in text or re.search(r"^(why|how|what|when|where|does|can|is it|should)\b", text):
        return "question"
    return "general"


async def list_student_notes(session: AsyncSession, student_id: UUID) -> list[StudentNoteRead]:
    result = await session.execute(
        select(StudentNote)
        .where(StudentNote.student_id == student_id)
        .order_by(StudentNote.pinned.desc(), StudentNote.updated_at.desc())
    )
    return [_note_to_read(note) for note in result.scalars().all()]


async def create_student_note(session: AsyncSession, student_id: UUID, payload: StudentNoteCreate) -> StudentNoteRead:
    body = payload.body.strip()
    note = StudentNote(
        student_id=student_id,
        course_id=payload.course_id,
        session_id=payload.session_id,
        subject_name=payload.subject_name.strip() or "General",
        course_name=payload.course_name.strip() or "General",
        session_title=payload.session_title.strip() or "General Notes",
        session_item_title=payload.session_item_title.strip() or "Manual Note",
        session_item_id=payload.session_item_id.strip() or "manual-note",
        item_type=payload.item_type.strip() or "notes",
        body=body,
        tags=_normalize_tags(payload.tags),
        importance=NoteImportance(payload.importance),
        smart_type=NoteSmartType(payload.smart_type or _note_smart_type(body)),
    )
    session.add(note)
    await session.commit()
    await session.refresh(note)
    if note.session_item_id == "manual-note":
        note.session_item_id = f"manual-{str(note.id)[:8]}"
        await session.commit()
        await session.refresh(note)
    return _note_to_read(note)


async def update_student_note(
    session: AsyncSession,
    student_id: UUID,
    note_id: UUID,
    payload: StudentNoteUpdate,
) -> StudentNoteRead | None:
    note = await _get_student_note(session, student_id, note_id)
    if note is None:
        return None
    if payload.body is not None:
        note.body = payload.body.strip()
        note.smart_type = NoteSmartType(payload.smart_type or _note_smart_type(note.body))
    if payload.subject_name is not None:
        note.subject_name = payload.subject_name.strip() or note.subject_name
    if payload.course_name is not None:
        note.course_name = payload.course_name.strip() or note.course_name
    if payload.session_title is not None:
        note.session_title = payload.session_title.strip() or note.session_title
    if payload.session_item_title is not None:
        note.session_item_title = payload.session_item_title.strip() or note.session_item_title
    if payload.session_item_id is not None:
        note.session_item_id = payload.session_item_id.strip() or note.session_item_id
    if payload.item_type is not None:
        note.item_type = payload.item_type.strip() or note.item_type
    if payload.tags is not None:
        note.tags = _normalize_tags(payload.tags)
    if payload.importance is not None:
        note.importance = NoteImportance(payload.importance)
    if payload.smart_type is not None:
        note.smart_type = NoteSmartType(payload.smart_type)
    if payload.pinned is not None:
        note.pinned = payload.pinned
    await session.commit()
    await session.refresh(note)
    return _note_to_read(note)


async def delete_student_note(session: AsyncSession, student_id: UUID, note_id: UUID) -> bool:
    note = await _get_student_note(session, student_id, note_id)
    if note is None:
        return False
    await session.delete(note)
    await session.commit()
    return True


async def list_student_revision_summary(session: AsyncSession, student_id: UUID) -> StudentRevisionSummaryRead:
    progress_summary = await get_student_progress_summary(session, student_id)
    wrong_questions = await list_student_wrong_questions(session, student_id)
    notes = await list_student_notes(session, student_id)

    now = datetime.now(UTC)
    items = [_wrong_question_to_revision_item(item, now) for item in wrong_questions]
    note_items = [_note_to_revision_item(note, now) for note in notes[: min(8, len(notes))]]
    items.extend(note_items)
    items.sort(key=lambda item: (item.due_category != "overdue", item.due_category != "today", item.priority != "high", item.next_review_at))

    due_today = sum(1 for item in items if item.due_category == "today")
    overdue = sum(1 for item in items if item.due_category == "overdue")
    weak = sum(1 for item in items if item.due_category == "weak")
    forgotten = sum(1 for item in items if item.due_category == "forgotten")
    total_minutes = sum(item.estimated_minutes for item in items[:12])

    return StudentRevisionSummaryRead(
        due_today=due_today,
        overdue=overdue,
        weak=weak,
        forgotten=forgotten,
        total_minutes=total_minutes,
        items=items[:20],
    )


async def get_student_assistant_context(session: AsyncSession, student_id: UUID) -> StudentAssistantContextRead:
    progress_summary = await get_student_progress_summary(session, student_id)
    wrong_questions = await list_student_wrong_questions(session, student_id)
    notes = await list_student_notes(session, student_id)
    revision_summary = await list_student_revision_summary(session, student_id)

    weak_concepts = _build_weak_concepts(wrong_questions)
    recent_notes = notes[:5]
    recent_bookmarks = revision_summary.items[:5]
    overview = [
        f"You are enrolled in {progress_summary.total_courses_enrolled} course(s) with {progress_summary.overall_progress_percent:.0f}% overall progress.",
        f"You have {len(wrong_questions)} unresolved wrong question(s) and {revision_summary.overdue + revision_summary.due_today} revision item(s) waiting.",
        f"Your notebook currently has {len(notes)} saved note(s) across subjects.",
    ]
    recommendations = _build_recommendations(weak_concepts, revision_summary, notes, progress_summary.total_courses_enrolled)
    quick_prompts = _build_prompts(weak_concepts, notes, revision_summary)

    return StudentAssistantContextRead(
        overview=overview,
        recommendations=recommendations,
        weak_concepts=weak_concepts,
        revision_summary=revision_summary,
        recent_notes=recent_notes,
        recent_bookmarks=recent_bookmarks,
        quick_prompts=quick_prompts,
    )


async def toggle_student_question_bookmark(
    session: AsyncSession,
    student_id: UUID,
    question_id: UUID,
    payload: StudentQuestionBookmarkUpdate,
) -> StudentQuestionBookmarkRead:
    bookmark = await _get_bookmark(session, student_id, question_id)
    if bookmark is None:
        bookmark = StudentQuestionBookmark(student_id=student_id, question_id=question_id, is_bookmarked=payload.bookmarked)
        session.add(bookmark)
    else:
        bookmark.is_bookmarked = payload.bookmarked
    await session.commit()
    await session.refresh(bookmark)
    return StudentQuestionBookmarkRead(question_id=question_id, bookmarked=bookmark.is_bookmarked, updated_at=bookmark.updated_at)


async def get_student_question_bookmark(session: AsyncSession, student_id: UUID, question_id: UUID) -> bool:
    bookmark = await _get_bookmark(session, student_id, question_id)
    return bool(bookmark.is_bookmarked) if bookmark is not None else False


async def _get_student_note(session: AsyncSession, student_id: UUID, note_id: UUID) -> StudentNote | None:
    result = await session.execute(
        select(StudentNote).where(StudentNote.id == note_id, StudentNote.student_id == student_id)
    )
    return result.scalar_one_or_none()


async def _get_bookmark(session: AsyncSession, student_id: UUID, question_id: UUID) -> StudentQuestionBookmark | None:
    result = await session.execute(
        select(StudentQuestionBookmark).where(
            StudentQuestionBookmark.student_id == student_id,
            StudentQuestionBookmark.question_id == question_id,
        )
    )
    return result.scalar_one_or_none()


def _note_to_read(note: StudentNote) -> StudentNoteRead:
    return StudentNoteRead(
        id=note.id,
        body=note.body,
        subject_name=note.subject_name,
        course_name=note.course_name,
        session_title=note.session_title,
        session_item_title=note.session_item_title,
        session_item_id=note.session_item_id,
        item_type=note.item_type,
        tags=_split_tags(note.tags),
        importance=note.importance.value,
        smart_type=note.smart_type.value,
        course_id=note.course_id,
        session_id=note.session_id,
        pinned=note.pinned,
        created_at=note.created_at,
        updated_at=note.updated_at,
    )


def _wrong_question_to_revision_item(item, now: datetime) -> StudentRevisionItemRead:
    last_wrong_at = _ensure_aware(item.last_wrong_at)
    age_days = max((now - last_wrong_at).days, 0)
    base_due = last_wrong_at + timedelta(days=max(1, min(14, item.wrong_count + item.retry_count + 1)))
    if item.retry_corrected:
        due_category = "today" if base_due.date() <= now.date() else "tomorrow" if base_due.date() == (now + timedelta(days=1)).date() else "soon"
    elif age_days >= 21:
        due_category = "forgotten"
    elif base_due < now:
        due_category = "overdue"
    elif base_due.date() == now.date():
        due_category = "today"
    elif base_due.date() == (now + timedelta(days=1)).date():
        due_category = "tomorrow"
    else:
        due_category = "weak" if item.wrong_count >= 2 or item.retry_count > 0 else "soon"

    confidence = max(20, 100 - (item.wrong_count * 18) - (item.retry_count * 8))
    if item.retry_corrected:
        confidence = min(95, confidence + 10)
    priority = "high" if due_category in {"overdue", "today"} or confidence < 50 else "medium" if due_category in {"tomorrow", "weak"} else "low"
    estimated_minutes = max(3, min(12, 3 + item.wrong_count + item.retry_count))
    course_name = item.course_name or "Untitled Course"
    subject_name = item.subject_name or "General"
    chapter_title = item.chapter_titles[0] if item.chapter_titles else None
    concept_title = item.concept_titles[0] if item.concept_titles else item.atomic_concept_titles[0] if item.atomic_concept_titles else None

    return StudentRevisionItemRead(
        id=f"wrong-{item.question_id}",
        question_id=item.question_id,
        title=item.question.title,
        subject_name=subject_name,
        course_name=course_name,
        chapter_title=chapter_title,
        concept_title=concept_title,
        due_category=due_category,
        priority=priority,
        confidence=confidence,
        estimated_minutes=estimated_minutes,
        next_review_at=base_due,
        source="wrong_question",
        reason=f"{item.wrong_count} miss(es) and {item.retry_count} retry attempt(s)",
    )


def _note_to_revision_item(note: StudentNoteRead, now: datetime) -> StudentRevisionItemRead:
    updated_at = _ensure_aware(note.updated_at)
    age_days = max((now - updated_at).days, 0)
    if note.importance == "high" and age_days >= 7:
        due_category = "today"
    elif note.importance == "high" and age_days >= 2:
        due_category = "tomorrow"
    elif note.importance == "medium" and age_days >= 5:
        due_category = "weak"
    elif age_days >= 30:
        due_category = "forgotten"
    else:
        due_category = "soon"
    priority = "high" if note.pinned or note.importance == "high" else "medium" if note.importance == "medium" else "low"
    confidence = 80 if note.importance == "high" else 65 if note.importance == "medium" else 50
    estimated_minutes = 3 if note.importance == "low" else 5 if note.importance == "medium" else 7
    next_review_at = updated_at + timedelta(days=7 if note.importance == "high" else 14 if note.importance == "medium" else 30)

    return StudentRevisionItemRead(
        id=f"note-{note.id}",
        question_id=None,
        title=note.session_item_title,
        subject_name=note.subject_name,
        course_name=note.course_name,
        chapter_title=note.session_title,
        concept_title=note.smart_type,
        due_category=due_category,
        priority=priority,
        confidence=confidence,
        estimated_minutes=estimated_minutes,
        next_review_at=next_review_at,
        source="note",
        reason=f"{note.importance.title()} importance note",
    )


def _ensure_aware(value: datetime) -> datetime:
    return value if value.tzinfo is not None else value.replace(tzinfo=UTC)


def _build_weak_concepts(wrong_questions) -> list[StudentAssistantConceptRead]:
    counter: Counter[str] = Counter()
    last_practiced: dict[str, datetime] = {}
    for item in wrong_questions:
        concepts = item.concept_titles or item.atomic_concept_titles or [item.subject_name]
        for concept in concepts:
            counter[concept] += item.wrong_count + item.retry_count + 1
            if concept not in last_practiced or item.last_wrong_at > last_practiced[concept]:
                last_practiced[concept] = item.last_wrong_at

    concepts: list[StudentAssistantConceptRead] = []
    total = sum(counter.values()) or 1
    for concept, score in counter.most_common(6):
        concepts.append(
            StudentAssistantConceptRead(
                concept=concept,
                score=round(max(20.0, 100.0 - (score / total) * 100.0), 1),
                last_practiced_at=last_practiced.get(concept),
            )
        )
    return concepts


def _build_recommendations(
    weak_concepts: list[StudentAssistantConceptRead],
    revision_summary: StudentRevisionSummaryRead,
    notes: list[StudentNoteRead],
    enrolled_courses: int,
) -> list[str]:
    recommendations: list[str] = []
    if weak_concepts:
        recommendations.append(f"Start with {weak_concepts[0].concept} — it’s your clearest weak spot.")
    if revision_summary.overdue > 0:
        recommendations.append(f"Clear your {revision_summary.overdue} overdue revision item(s) before moving on.")
    if notes:
        top_note = notes[0]
        recommendations.append(f"Review your latest note from {top_note.session_title} to reinforce retrieval.")
    if enrolled_courses > 1:
        recommendations.append("Keep study sessions short and course-specific to avoid context switching.")
    if not recommendations:
        recommendations.append("You’re in a good spot — use the assistant to test recall and build momentum.")
    return recommendations[:4]


def _build_prompts(
    weak_concepts: list[StudentAssistantConceptRead],
    notes: list[StudentNoteRead],
    revision_summary: StudentRevisionSummaryRead,
) -> list[StudentAssistantPromptRead]:
    prompts: list[StudentAssistantPromptRead] = []
    if weak_concepts:
        prompts.append(
            StudentAssistantPromptRead(
                title=f"Explain {weak_concepts[0].concept}",
                prompt=f"Explain {weak_concepts[0].concept} like I’m revising for an exam.",
                reason="Based on your weakest concept",
            )
        )
    if revision_summary.items:
        prompts.append(
            StudentAssistantPromptRead(
                title="Quiz me on today’s revision",
                prompt="Quiz me on the items due for revision today.",
                reason="Uses your spaced-repetition queue",
            )
        )
    if notes:
        prompts.append(
            StudentAssistantPromptRead(
                title="Summarize my notes",
                prompt=f"Summarize my notes from {notes[0].session_title} into a 5-bullet revision sheet.",
                reason="Grounded in your saved notes",
            )
        )
    prompts.append(
        StudentAssistantPromptRead(
            title="Build a study plan",
            prompt="Build me a study plan based on my current progress and weak topics.",
            reason="Combines progress, notes, and revision data",
        )
    )
    return prompts[:4]
