from uuid import UUID

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db_session
from app.modules.question_import import service
from app.modules.question_import.schemas import (
    ImportCommitRequest,
    ImportCommitResponse,
    ImportJobRead,
    ImportPreviewRequest,
    ImportPreviewResponse,
    ImportUploadResponse,
)

router = APIRouter(prefix="/question-import", tags=["question_import"])


@router.post("/upload", response_model=ImportUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_questions(
    file: UploadFile = File(...),
    session: AsyncSession = Depends(get_db_session),
) -> ImportUploadResponse:
    content = await file.read()
    try:
        job = await service.create_upload_job(session, file.filename or "questions.csv", content)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    return ImportUploadResponse(job_id=job.id, filename=job.filename, source_type=job.source_type, total_rows=len(job.raw_rows))


@router.post("/preview", response_model=ImportPreviewResponse)
async def preview_questions(
    payload: ImportPreviewRequest,
    session: AsyncSession = Depends(get_db_session),
) -> ImportPreviewResponse:
    job = await service.preview_job(session, payload.job_id)
    if job is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Import job not found")

    return ImportPreviewResponse(job=job)


@router.post("/commit", response_model=ImportCommitResponse)
async def commit_questions(
    payload: ImportCommitRequest,
    session: AsyncSession = Depends(get_db_session),
) -> ImportCommitResponse:
    job = await service.commit_job(session, payload.job_id)
    if job is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Import job not found")
    if job.summary is not None and job.summary.invalid_rows > 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Import job has validation errors")

    return ImportCommitResponse(job=job)


@router.get("/history", response_model=list[ImportJobRead])
async def import_history(session: AsyncSession = Depends(get_db_session)) -> list[ImportJobRead]:
    return await service.list_jobs(session)


@router.get("/{job_id}", response_model=ImportJobRead)
async def get_import_job(
    job_id: UUID,
    session: AsyncSession = Depends(get_db_session),
) -> ImportJobRead:
    job = await service.get_job(session, job_id)
    if job is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Import job not found")

    return job
