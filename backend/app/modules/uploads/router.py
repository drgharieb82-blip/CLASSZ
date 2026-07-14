import hashlib
from pathlib import Path
from uuid import UUID

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.ownership import assert_owns_course
from app.db.session import get_db_session
from app.models.user import Role, User
from app.modules.auth.dependencies import get_optional_user

router = APIRouter(prefix="/uploads", tags=["uploads"])

# backend/uploads - served back out as static files, mounted at /uploads in main.py
UPLOAD_ROOT = Path(__file__).resolve().parents[3] / "uploads"

ALLOWED_CATEGORIES = {"identity", "photo", "certification", "material"}

# Categories collected during teacher self-registration, before an account or
# token exists - these stay unauthenticated, matching the original design.
# "material" (course content) always requires a logged-in teacher.
PUBLIC_CATEGORIES = {"identity", "photo", "certification"}

# Content-type -> (file extension, storage subfolder). The extension/folder
# are derived from this map, never trusted from the client-supplied filename,
# to avoid path traversal / extension spoofing.
ALLOWED_CONTENT_TYPES: dict[str, tuple[str, str]] = {
    # images
    "image/jpeg": (".jpg", "images"),
    "image/png": (".png", "images"),
    "image/webp": (".webp", "images"),
    # pdf
    "application/pdf": (".pdf", "pdf"),
    # documents (Word / PowerPoint / Excel)
    "application/msword": (".doc", "documents"),
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": (".docx", "documents"),
    "application/vnd.ms-powerpoint": (".ppt", "documents"),
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": (".pptx", "documents"),
    "application/vnd.ms-excel": (".xls", "documents"),
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": (".xlsx", "documents"),
    # video
    "video/mp4": (".mp4", "videos"),
    "video/webm": (".webm", "videos"),
    "video/quicktime": (".mov", "videos"),
    # audio
    "audio/mpeg": (".mp3", "audio"),
    "audio/wav": (".wav", "audio"),
    "audio/x-wav": (".wav", "audio"),
    "audio/mp4": (".m4a", "audio"),
    "audio/ogg": (".ogg", "audio"),
    # archives
    "application/zip": (".zip", "attachments"),
    "application/x-zip-compressed": (".zip", "attachments"),
}

MAX_UPLOAD_BYTES = 2 * 1024 * 1024 * 1024  # 2 GB (videos are the largest expected asset)


class UploadResponse(BaseModel):
    url: str
    file_name: str
    size_bytes: int
    mime_type: str


def _parse_optional_uuid(value: str | None) -> UUID | None:
    if not value:
        return None
    try:
        return UUID(value)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid id")


@router.post("", response_model=UploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_file(
    category: str = Form(...),
    file: UploadFile = File(...),
    course_id: str | None = Form(default=None),
    chapter_id: str | None = Form(default=None),
    lesson_id: str | None = Form(default=None),
    session_id: str | None = Form(default=None),
    current_user: User | None = Depends(get_optional_user),
    db_session: AsyncSession = Depends(get_db_session),
) -> UploadResponse:
    if category not in ALLOWED_CATEGORIES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"category must be one of {sorted(ALLOWED_CATEGORIES)}",
        )

    if category not in PUBLIC_CATEGORIES:
        # Course material: requires a logged-in teacher (or admin), and if a
        # course is named, ownership of that course.
        if current_user is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")
        if current_user.role not in (Role.TEACHER, Role.ADMIN, Role.SUPER_ADMIN):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Teacher access required")

        parsed_course_id = _parse_optional_uuid(course_id)
        if parsed_course_id is not None:
            await assert_owns_course(db_session, parsed_course_id, current_user)

    extension, subfolder = ALLOWED_CONTENT_TYPES.get(file.content_type or "", (None, None))
    if extension is None:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported file type: {file.content_type}.",
        )

    contents = await file.read(MAX_UPLOAD_BYTES + 1)
    if len(contents) > MAX_UPLOAD_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File too large. Max {MAX_UPLOAD_BYTES // (1024 * 1024)}MB.",
        )

    if category == "material":
        # storage/uploads/material/<teacher_id>/<course_id>/[chapter_id]/[lesson_id]/[session_id]/<type>/
        parts = [category, str(current_user.id)]
        parsed_course_id = _parse_optional_uuid(course_id)
        if parsed_course_id is not None:
            parts.append(str(parsed_course_id))
        for raw_id in (chapter_id, lesson_id, session_id):
            parsed = _parse_optional_uuid(raw_id)
            if parsed is not None:
                parts.append(str(parsed))
        parts.append(subfolder)
        target_dir = UPLOAD_ROOT.joinpath(*parts)
    else:
        target_dir = UPLOAD_ROOT / category

    target_dir.mkdir(parents=True, exist_ok=True)

    # Content-hash filename: re-uploading identical bytes into the same
    # folder reuses the existing file instead of duplicating it.
    digest = hashlib.sha256(contents).hexdigest()
    filename = f"{digest}{extension}"
    destination = target_dir / filename
    if not destination.exists():
        destination.write_bytes(contents)

    relative_path = "/".join(str(p) for p in destination.relative_to(UPLOAD_ROOT).parts)
    return UploadResponse(
        url=f"/uploads/{relative_path}",
        file_name=file.filename or filename,
        size_bytes=len(contents),
        mime_type=file.content_type or "application/octet-stream",
    )
