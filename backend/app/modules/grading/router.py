from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db_session
from app.modules.grading import service
from app.modules.grading.schemas import ManualGradeAction, ManualGradeRead, ManualGradeReturn

router = APIRouter(prefix="/grading", tags=["grading"])


@router.get("/pending", response_model=list[ManualGradeRead])
async def list_pending_grades(session: AsyncSession = Depends(get_db_session)) -> list[ManualGradeRead]:
    return await service.list_pending_grades(session)


@router.get("/{grade_id}", response_model=ManualGradeRead)
async def get_manual_grade(
    grade_id: UUID,
    session: AsyncSession = Depends(get_db_session),
) -> ManualGradeRead:
    grade = await service.get_manual_grade(session, grade_id)
    if grade is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Manual grade not found")

    return grade


@router.post("/{grade_id}/grade", response_model=ManualGradeRead)
async def grade_manual_grade(
    grade_id: UUID,
    payload: ManualGradeAction,
    session: AsyncSession = Depends(get_db_session),
) -> ManualGradeRead:
    grade = await service.grade_manual_grade(session, grade_id, payload)
    if grade is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Manual grade not found")

    return grade


@router.post("/{grade_id}/return", response_model=ManualGradeRead)
async def return_manual_grade(
    grade_id: UUID,
    payload: ManualGradeReturn,
    session: AsyncSession = Depends(get_db_session),
) -> ManualGradeRead:
    grade = await service.return_manual_grade(session, grade_id, payload)
    if grade is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Manual grade not found")

    return grade
