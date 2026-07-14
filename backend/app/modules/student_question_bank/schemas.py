from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, Field


class StudentQuestionOptionRead(BaseModel):
    id: str
    text: str


class StudentQuestionRead(BaseModel):
    id: UUID
    course_id: UUID | None = None
    title: str
    question_type: str
    difficulty: str
    explanation: str | None = None
    points: int
    chapter_ids: list[UUID] = Field(default_factory=list)
    lesson_ids: list[UUID] = Field(default_factory=list)
    concept_ids: list[UUID] = Field(default_factory=list)
    atomic_concept_ids: list[UUID] = Field(default_factory=list)
    chapter_titles: list[str] = Field(default_factory=list)
    lesson_titles: list[str] = Field(default_factory=list)
    concept_titles: list[str] = Field(default_factory=list)
    atomic_concept_titles: list[str] = Field(default_factory=list)
    answer_data_json: dict[str, Any] | None = None
    options: list[StudentQuestionOptionRead] = Field(default_factory=list)


class StudentQuestionConceptRead(BaseModel):
    id: UUID
    name: str
    question_count: int


class StudentQuestionLessonRead(BaseModel):
    id: UUID
    title: str
    concepts: list[StudentQuestionConceptRead] = Field(default_factory=list)


class StudentQuestionChapterRead(BaseModel):
    id: UUID
    title: str
    lessons: list[StudentQuestionLessonRead] = Field(default_factory=list)
    total_questions: int
    solved_questions: int
    progress: int


class StudentQuestionCourseRead(BaseModel):
    id: UUID
    name: str
    subject: str
    grade: str
    total_questions: int
    solved_questions: int
    accuracy: int
    available_quizzes: int
    chapters: list[StudentQuestionChapterRead] = Field(default_factory=list)


class StudentPracticeAnswerSubmit(BaseModel):
    question_id: UUID
    answer_data: dict[str, Any] = Field(default_factory=dict)


class StudentPracticeResultRead(BaseModel):
    question_id: UUID
    is_correct: bool
    pending_manual_review: bool
    earned_points: int
    max_points: int
    explanation: str | None = None
    correct_choice_ids: list[str] = Field(default_factory=list)
    correct_choice_texts: list[str] = Field(default_factory=list)
    accepted_text_answers: list[str] = Field(default_factory=list)
    correct_order_ids: list[str] = Field(default_factory=list)
    correct_pairs: list[dict[str, str]] = Field(default_factory=list)


class StudentWrongQuestionRead(BaseModel):
    question_id: UUID
    course_id: UUID | None = None
    course_name: str
    subject_name: str
    chapter_titles: list[str] = Field(default_factory=list)
    lesson_titles: list[str] = Field(default_factory=list)
    concept_titles: list[str] = Field(default_factory=list)
    atomic_concept_titles: list[str] = Field(default_factory=list)
    difficulty: str
    source: str = "quiz"
    question: StudentQuestionRead
    wrong_count: int
    retry_count: int
    retry_corrected: bool
    last_wrong_at: datetime
    bookmarked: bool = False
