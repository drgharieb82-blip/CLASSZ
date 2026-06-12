from app.models import Role, User
from app.modules.assignments.models import Assignment, AssignmentSubmission, AssignmentSubmissionStatus, SubmissionFile
from app.modules.chapters.models import Chapter
from app.modules.courses.models import Course
from app.modules.lesson_blocks.models import BlockType, LessonBlock
from app.modules.lessons.models import Lesson
from app.modules.progress.models import LessonProgress
from app.modules.question_bank.models import (
    Difficulty,
    MediaType,
    Question,
    QuestionCategory,
    QuestionChoice,
    QuestionMedia,
    QuestionTag,
    QuestionType,
)
from app.modules.quiz_attempts.models import QuizAnswer, QuizAttempt, QuizAttemptStatus
from app.modules.quizzes.models import Quiz, QuizQuestion
from app.modules.results.models import QuestionResult, QuizResult
from app.modules.videos.models import Video, VideoProvider

__all__ = [
    "BlockType",
    "Assignment",
    "AssignmentSubmission",
    "AssignmentSubmissionStatus",
    "Chapter",
    "Course",
    "Lesson",
    "LessonBlock",
    "LessonProgress",
    "Difficulty",
    "MediaType",
    "Question",
    "QuestionCategory",
    "QuestionChoice",
    "QuestionMedia",
    "QuestionTag",
    "QuestionType",
    "Quiz",
    "QuizAnswer",
    "QuizAttempt",
    "QuizAttemptStatus",
    "QuizQuestion",
    "QuizResult",
    "QuestionResult",
    "Role",
    "SubmissionFile",
    "User",
    "Video",
    "VideoProvider",
]
