from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.modules.anti_cheating.router import router as anti_cheating_router
from app.modules.assignments.router import router as assignments_router
from app.modules.atomic_concepts.router import router as atomic_concepts_router
from app.modules.chapters.router import router as chapters_router
from app.modules.auth.router import router as auth_router
from app.modules.concepts.router import router as concepts_router
from app.modules.courses.router import router as courses_router
from app.modules.grading.router import router as grading_router
from app.modules.lessons.router import router as lessons_router
from app.modules.session_blocks.router import router as session_blocks_router
from app.modules.sessions.router import router as sessions_router
from app.modules.progress.router import router as progress_router
from app.modules.quiz_attempts.router import router as quiz_attempts_router
from app.modules.question_bank.router import router as question_bank_router
from app.modules.quizzes.router import router as quizzes_router
from app.modules.results.router import router as results_router
from app.modules.teacher_dashboard.router import router as teacher_dashboard_router
from app.modules.teachers.router import router as teachers_router
from app.modules.uploads.router import router as uploads_router
from app.modules.videos.router import router as videos_router

UPLOAD_ROOT = Path(__file__).resolve().parent.parent / "uploads"


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.project_name,
        version=settings.api_version,
        docs_url="/api/docs",
        redoc_url="/api/redoc",
        openapi_url="/api/openapi.json",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/api/health", tags=["system"])
    async def health_check() -> dict[str, str]:
        return {"status": "ok", "service": settings.project_name}

    UPLOAD_ROOT.mkdir(parents=True, exist_ok=True)
    app.mount("/uploads", StaticFiles(directory=str(UPLOAD_ROOT)), name="uploads")

    app.include_router(auth_router, prefix=settings.api_prefix)
    app.include_router(anti_cheating_router, prefix=settings.api_prefix)
    app.include_router(courses_router, prefix=settings.api_prefix)
    app.include_router(chapters_router, prefix=settings.api_prefix)
    app.include_router(lessons_router, prefix=settings.api_prefix)
    app.include_router(concepts_router, prefix=settings.api_prefix)
    app.include_router(atomic_concepts_router, prefix=settings.api_prefix)
    app.include_router(assignments_router, prefix=settings.api_prefix)
    app.include_router(sessions_router, prefix=settings.api_prefix)
    app.include_router(session_blocks_router, prefix=settings.api_prefix)
    app.include_router(videos_router, prefix=settings.api_prefix)
    app.include_router(progress_router, prefix=settings.api_prefix)
    app.include_router(question_bank_router, prefix=settings.api_prefix)
    app.include_router(quizzes_router, prefix=settings.api_prefix)
    app.include_router(quiz_attempts_router, prefix=settings.api_prefix)
    app.include_router(results_router, prefix=settings.api_prefix)
    app.include_router(grading_router, prefix=settings.api_prefix)
    app.include_router(teacher_dashboard_router, prefix=settings.api_prefix)
    app.include_router(teachers_router, prefix=settings.api_prefix)
    app.include_router(uploads_router, prefix=settings.api_prefix)

    return app


app = create_app()
