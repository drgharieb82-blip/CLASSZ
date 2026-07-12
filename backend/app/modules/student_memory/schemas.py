from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, Field

NoteImportance = Literal["low", "medium", "high"]
NoteSmartType = Literal["chemistry-equation", "physics-law", "math-formula", "definition", "question", "general"]
RevisionCategory = Literal["overdue", "today", "tomorrow", "weak", "forgotten", "soon"]
RevisionPriority = Literal["high", "medium", "low"]


class StudentNoteBase(BaseModel):
    body: str
    subject_name: str = "General"
    course_name: str = "General"
    session_title: str = "General Notes"
    session_item_title: str = "Manual Note"
    session_item_id: str = "manual-note"
    item_type: str = "notes"
    tags: list[str] = Field(default_factory=list)
    importance: NoteImportance = "low"
    smart_type: NoteSmartType = "general"
    course_id: UUID | None = None
    session_id: UUID | None = None


class StudentNoteCreate(StudentNoteBase):
    pass


class StudentNoteUpdate(BaseModel):
    body: str | None = None
    subject_name: str | None = None
    course_name: str | None = None
    session_title: str | None = None
    session_item_title: str | None = None
    session_item_id: str | None = None
    item_type: str | None = None
    tags: list[str] | None = None
    importance: NoteImportance | None = None
    smart_type: NoteSmartType | None = None
    pinned: bool | None = None


class StudentNoteRead(StudentNoteBase):
    id: UUID
    pinned: bool
    created_at: datetime
    updated_at: datetime


class StudentQuestionBookmarkRead(BaseModel):
    question_id: UUID
    bookmarked: bool
    updated_at: datetime


class StudentQuestionBookmarkUpdate(BaseModel):
    bookmarked: bool


class StudentRevisionItemRead(BaseModel):
    id: str
    question_id: UUID | None = None
    title: str
    subject_name: str
    course_name: str
    chapter_title: str | None = None
    concept_title: str | None = None
    due_category: RevisionCategory
    priority: RevisionPriority
    confidence: int
    estimated_minutes: int
    next_review_at: datetime
    source: str
    reason: str


class StudentRevisionSummaryRead(BaseModel):
    due_today: int
    overdue: int
    weak: int
    forgotten: int
    total_minutes: int
    items: list[StudentRevisionItemRead] = Field(default_factory=list)


class StudentAssistantPromptRead(BaseModel):
    title: str
    prompt: str
    reason: str


class StudentAssistantConceptRead(BaseModel):
    concept: str
    score: float
    last_practiced_at: datetime | None = None


class StudentAssistantContextRead(BaseModel):
    overview: list[str] = Field(default_factory=list)
    recommendations: list[str] = Field(default_factory=list)
    weak_concepts: list[StudentAssistantConceptRead] = Field(default_factory=list)
    revision_summary: StudentRevisionSummaryRead
    recent_notes: list[StudentNoteRead] = Field(default_factory=list)
    recent_bookmarks: list[StudentRevisionItemRead] = Field(default_factory=list)
    quick_prompts: list[StudentAssistantPromptRead] = Field(default_factory=list)
