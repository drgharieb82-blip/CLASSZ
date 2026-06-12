from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.modules.chapters.router import router as chapters_router
from app.modules.auth.router import router as auth_router
from app.modules.courses.router import router as courses_router
from app.modules.lesson_blocks.router import router as lesson_blocks_router
from app.modules.lessons.router import router as lessons_router
from app.modules.progress.router import router as progress_router
from app.modules.question_bank.router import router as question_bank_router
from app.modules.videos.router import router as videos_router


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

    app.include_router(auth_router, prefix=settings.api_prefix)
    app.include_router(courses_router, prefix=settings.api_prefix)
    app.include_router(chapters_router, prefix=settings.api_prefix)
    app.include_router(lessons_router, prefix=settings.api_prefix)
    app.include_router(lesson_blocks_router, prefix=settings.api_prefix)
    app.include_router(videos_router, prefix=settings.api_prefix)
    app.include_router(progress_router, prefix=settings.api_prefix)
    app.include_router(question_bank_router, prefix=settings.api_prefix)

    return app


app = create_app()
