from typing import Literal

from pydantic import BaseModel

ContentType = Literal["lesson_outline", "lesson_notes", "quiz_questions", "homework", "flashcards", "revision_summary", "teacher_script"]


class AIContentRequest(BaseModel):
    content_type: ContentType
    subject: str
    grade: str
    topic: str
    language: Literal["ar", "en"] = "en"
    difficulty: Literal["easy", "medium", "hard", "adaptive"] = "adaptive"
    count: int = 5


class AIContentResponse(BaseModel):
    title: str
    content_type: ContentType
    items: list[dict[str, object]]
    summary: str
    language: Literal["ar", "en"]
    fallback_used: bool = False
