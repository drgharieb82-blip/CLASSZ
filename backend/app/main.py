import uuid as _uuid
from pathlib import Path

from fastapi import Depends, FastAPI, HTTPException, Query, Request
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from jose import JWTError, jwt as _jwt
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import guard_against_insecure_defaults, settings
from app.db.session import get_db_session
from app.models.user import User
from app.modules.anti_cheating.router import router as anti_cheating_router
from app.modules.assignments.router import router as assignments_router
from app.modules.assistants.router import router as assistants_router
from app.modules.atomic_concepts.router import router as atomic_concepts_router
from app.modules.certificates.router import router as certificates_router
from app.modules.chapters.router import router as chapters_router
from app.modules.auth.router import router as auth_router
from app.modules.concepts.router import router as concepts_router
from app.modules.courses.router import router as courses_router
from app.modules.enrollments.router import router as enrollments_router
from app.modules.finance.router import router as finance_router
from app.modules.grading.router import router as grading_router
from app.modules.lessons.router import router as lessons_router
from app.modules.materials.router import router as materials_router
from app.modules.notifications.router import router as notifications_router
from app.modules.parents.router import router as parents_router
from app.modules.session_blocks.router import router as session_blocks_router
from app.modules.sessions.router import router as sessions_router
from app.modules.progress.router import router as progress_router
from app.modules.quiz_attempts.router import router as quiz_attempts_router
from app.modules.question_bank.router import router as question_bank_router
from app.modules.quizzes.router import router as quizzes_router
from app.modules.results.router import router as results_router
from app.modules.student_portal.router import router as student_portal_router
from app.modules.student_memory.router import router as student_memory_router
from app.modules.student_content.router import router as student_content_router
from app.modules.student_question_bank.router import router as student_question_bank_router
from app.modules.students.router import router as students_router
from app.modules.teacher_dashboard.router import router as teacher_dashboard_router
from app.modules.teachers.router import router as teachers_router
from app.modules.uploads.router import router as uploads_router
from app.modules.videos.router import router as videos_router
from app.modules.wallets.router import router as wallets_router

UPLOAD_ROOT = Path(__file__).resolve().parent.parent / "uploads"
LOGIN_ARTWORK_SOURCE = Path(__file__).resolve().parents[2] / "Assets" / "login" / "LOGIN PAGE.png"
LOGIN_SOUND_SOURCE = (
    Path(__file__).resolve().parents[2]
    / "Assets"
    / "login"
    / "pwlpl-epic-t-rex-roaring-sound-effect-powerful-dinosaur-444199.mp3"
)


def create_app() -> FastAPI:
    guard_against_insecure_defaults()

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

    @app.get("/api/dev/login-artwork", include_in_schema=False)
    async def login_artwork() -> FileResponse:
        if not LOGIN_ARTWORK_SOURCE.exists():
            raise HTTPException(status_code=404, detail="Login artwork not found")
        return FileResponse(
            path=str(LOGIN_ARTWORK_SOURCE),
            media_type="image/png",
            headers={"Cache-Control": "no-store, max-age=0"},
        )

    @app.get("/api/dev/login-sound", include_in_schema=False)
    async def login_sound() -> FileResponse:
        if not LOGIN_SOUND_SOURCE.exists():
            raise HTTPException(status_code=404, detail="Login sound not found")
        return FileResponse(
            path=str(LOGIN_SOUND_SOURCE),
            media_type="audio/mpeg",
            headers={"Cache-Control": "no-store, max-age=0"},
        )

    UPLOAD_ROOT.mkdir(parents=True, exist_ok=True)
    MATERIAL_ROOT = UPLOAD_ROOT / "material"
    MATERIAL_ROOT.mkdir(parents=True, exist_ok=True)

    async def _authenticate_file_request(
        request: Request,
        token: str | None,
        session: AsyncSession,
    ) -> User:
        """Same validation as `get_current_user`, but also accepts the token
        via `?token=` — `<img>`/`<video>` tags can't send an Authorization
        header, so course-material files (unlike the public identity/photo/
        certification uploads) are served through this instead of a plain
        static mount."""
        raw_token = token
        if raw_token is None:
            auth_header = request.headers.get("authorization", "")
            if auth_header.lower().startswith("bearer "):
                raw_token = auth_header[7:]
        if raw_token is None:
            raise HTTPException(status_code=401, detail="Authentication required")

        try:
            payload = _jwt.decode(raw_token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
            user_id = payload.get("sub")
        except JWTError:
            raise HTTPException(status_code=401, detail="Invalid or expired token")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")

        try:
            uid = _uuid.UUID(user_id)
        except ValueError:
            raise HTTPException(status_code=401, detail="Invalid token")

        result = await session.execute(select(User).where(User.id == uid))
        user = result.scalar_one_or_none()
        if user is None or not user.is_active:
            raise HTTPException(status_code=401, detail="Invalid session")
        return user

    @app.get("/uploads/material/{file_path:path}", include_in_schema=False)
    async def serve_material_file(
        file_path: str,
        request: Request,
        token: str | None = Query(default=None),
        session: AsyncSession = Depends(get_db_session),
    ) -> FileResponse:
        await _authenticate_file_request(request, token, session)

        resolved_root = MATERIAL_ROOT.resolve()
        target = (MATERIAL_ROOT / file_path).resolve()
        if target != resolved_root and resolved_root not in target.parents:
            raise HTTPException(status_code=404, detail="Not found")
        if not target.is_file():
            raise HTTPException(status_code=404, detail="Not found")
        return FileResponse(str(target))

    # Everything else uploaded (identity/photo/certification) stays a plain
    # static mount — those categories are deliberately public, collected
    # during registration before an account/token exists (see
    # app/modules/uploads/router.py:PUBLIC_CATEGORIES). Course material is
    # carved out above and is the only category this audit flagged.
    app.mount("/uploads", StaticFiles(directory=str(UPLOAD_ROOT)), name="uploads")

    app.include_router(auth_router, prefix=settings.api_prefix)
    app.include_router(anti_cheating_router, prefix=settings.api_prefix)
    app.include_router(courses_router, prefix=settings.api_prefix)
    app.include_router(enrollments_router, prefix=settings.api_prefix)
    app.include_router(chapters_router, prefix=settings.api_prefix)
    app.include_router(lessons_router, prefix=settings.api_prefix)
    app.include_router(concepts_router, prefix=settings.api_prefix)
    app.include_router(atomic_concepts_router, prefix=settings.api_prefix)
    app.include_router(materials_router, prefix=settings.api_prefix)
    app.include_router(notifications_router, prefix=settings.api_prefix)
    app.include_router(assignments_router, prefix=settings.api_prefix)
    app.include_router(assistants_router, prefix=settings.api_prefix)
    app.include_router(sessions_router, prefix=settings.api_prefix)
    app.include_router(session_blocks_router, prefix=settings.api_prefix)
    app.include_router(videos_router, prefix=settings.api_prefix)
    app.include_router(student_content_router, prefix=settings.api_prefix)
    app.include_router(student_portal_router, prefix=settings.api_prefix)
    app.include_router(student_memory_router, prefix=settings.api_prefix)
    app.include_router(student_question_bank_router, prefix=settings.api_prefix)
    app.include_router(progress_router, prefix=settings.api_prefix)
    app.include_router(question_bank_router, prefix=settings.api_prefix)
    app.include_router(quizzes_router, prefix=settings.api_prefix)
    app.include_router(quiz_attempts_router, prefix=settings.api_prefix)
    app.include_router(results_router, prefix=settings.api_prefix)
    app.include_router(grading_router, prefix=settings.api_prefix)
    app.include_router(teacher_dashboard_router, prefix=settings.api_prefix)
    app.include_router(teachers_router, prefix=settings.api_prefix)
    app.include_router(uploads_router, prefix=settings.api_prefix)
    app.include_router(students_router, prefix=settings.api_prefix)
    app.include_router(parents_router, prefix=settings.api_prefix)
    app.include_router(wallets_router, prefix=settings.api_prefix)
    app.include_router(certificates_router, prefix=settings.api_prefix)
    app.include_router(finance_router, prefix=settings.api_prefix)

    return app


app = create_app()
