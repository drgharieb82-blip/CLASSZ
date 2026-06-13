from typing import Literal
from uuid import UUID

from pydantic import BaseModel, Field


TeacherMode = Literal["direct_explanation", "guided_hint", "exam_preparation", "revision_summary"]
TeacherLanguage = Literal["ar", "en"]


class AITeacherRequest(BaseModel):
    concept: str
    student_level: str = Field(default="secondary")
    language: TeacherLanguage = "en"
    mode: TeacherMode = "direct_explanation"
    question: str | None = None
    student_answer: str | None = None
    concept_context: str | None = None
    student_id: UUID | None = Field(default=None, alias="studentId")


class AITeacherResponse(BaseModel):
    title: str
    answer: str
    steps: list[str]
    next_step: str = Field(alias="nextStep")
    language: TeacherLanguage
    mode: TeacherMode
    fallback_used: bool = Field(default=False, alias="fallbackUsed")
