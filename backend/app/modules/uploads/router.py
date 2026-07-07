import uuid
from pathlib import Path

from fastapi import APIRouter, File, Form, HTTPException, UploadFile, status
from pydantic import BaseModel

router = APIRouter(prefix="/uploads", tags=["uploads"])

# backend/uploads - served back out as static files, mounted at /uploads in main.py
UPLOAD_ROOT = Path(__file__).resolve().parents[3] / "uploads"

ALLOWED_CATEGORIES = {"identity", "photo", "certification"}

# Content-type -> file extension. Deliberately narrow: images + PDF only, no
# executables/scripts. The extension is derived from this map, never trusted
# from the client-supplied filename, to avoid path traversal / extension spoofing.
ALLOWED_CONTENT_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "application/pdf": ".pdf",
}

MAX_UPLOAD_BYTES = 8 * 1024 * 1024  # 8 MB


class UploadResponse(BaseModel):
    url: str


@router.post("", response_model=UploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_file(
    category: str = Form(...),
    file: UploadFile = File(...),
) -> UploadResponse:
    if category not in ALLOWED_CATEGORIES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"category must be one of {sorted(ALLOWED_CATEGORIES)}",
        )

    extension = ALLOWED_CONTENT_TYPES.get(file.content_type or "")
    if extension is None:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported file type: {file.content_type}. Allowed: JPEG, PNG, WEBP, PDF.",
        )

    contents = await file.read(MAX_UPLOAD_BYTES + 1)
    if len(contents) > MAX_UPLOAD_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File too large. Max {MAX_UPLOAD_BYTES // (1024 * 1024)}MB.",
        )

    category_dir = UPLOAD_ROOT / category
    category_dir.mkdir(parents=True, exist_ok=True)

    filename = f"{uuid.uuid4().hex}{extension}"
    destination = category_dir / filename
    destination.write_bytes(contents)

    return UploadResponse(url=f"/uploads/{category}/{filename}")
