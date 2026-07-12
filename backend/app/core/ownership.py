"""Course-ownership checks shared by every router that mutates a
course-scoped resource. A TEACHER may only touch resources under a course
whose `teacher_id` matches their own id; ADMIN/SUPER_ADMIN bypass the check.

Nested resources (chapter -> lesson -> concept -> atomic concept, and
session -> session block -> video) have no `teacher_id` column of their own,
so ownership is resolved by joining up to the owning course.
"""

from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import Role, User
from app.modules.assistants.models import (
    AssistantAction,
    AssistantLinkStatus,
    AssistantPermission,
    AssistantResource,
    TeacherAssistantLink,
)
from app.modules.enrollments.models import Enrollment, EnrollmentStatus
from app.modules.atomic_concepts.models import AtomicConcept
from app.modules.chapters.models import Chapter
from app.modules.concepts.models import Concept
from app.modules.courses.models import Course
from app.modules.lessons.models import Lesson
from app.modules.materials.models import Material, MaterialStatus
from app.modules.parents.models import ParentLinkStatus, ParentStudentLink
from app.modules.quizzes.models import Quiz
from app.modules.session_blocks.models import SessionBlock
from app.modules.sessions.models import Session as ClassSession, SessionStatus
from app.modules.videos.models import Video

_ADMIN_ROLES = {Role.ADMIN, Role.SUPER_ADMIN}


async def assert_owns_course(
    session: AsyncSession,
    course_id: UUID,
    user: User,
    *,
    not_found_detail: str = "Course not found",
) -> None:
    if user.role in _ADMIN_ROLES:
        return

    result = await session.execute(select(Course.teacher_id).where(Course.id == course_id))
    teacher_id = result.scalar_one_or_none()
    if teacher_id is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=not_found_detail)
    if teacher_id != user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your course")


async def _assistant_has_permission(
    session: AsyncSession,
    assistant_id: UUID,
    teacher_id: UUID,
    resource: AssistantResource,
    action: AssistantAction,
) -> bool:
    result = await session.execute(
        select(AssistantPermission.id)
        .join(TeacherAssistantLink, TeacherAssistantLink.id == AssistantPermission.link_id)
        .where(
            TeacherAssistantLink.teacher_id == teacher_id,
            TeacherAssistantLink.assistant_id == assistant_id,
            TeacherAssistantLink.status == AssistantLinkStatus.ACTIVE,
            AssistantPermission.resource == resource,
            AssistantPermission.action == action,
        )
    )
    return result.scalar_one_or_none() is not None


async def assert_can(
    session: AsyncSession,
    user: User,
    course_id: UUID,
    resource: AssistantResource,
    action: AssistantAction,
    *,
    not_found_detail: str = "Course not found",
) -> None:
    """Generalizes `assert_owns_course` for delegated assistant access.
    ADMIN/SUPER_ADMIN bypass. TEACHER must own the course (existing check).
    ASSISTANT must have an ACTIVE TeacherAssistantLink to the course's owning
    teacher AND a granted AssistantPermission(resource, action) on that link.
    Anyone else (STUDENT, PARENT, etc.) is always denied."""
    if user.role in _ADMIN_ROLES:
        return

    result = await session.execute(select(Course.teacher_id).where(Course.id == course_id))
    teacher_id = result.scalar_one_or_none()
    if teacher_id is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=not_found_detail)

    if user.role == Role.TEACHER:
        if teacher_id != user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your course")
        return

    if user.role == Role.ASSISTANT and await _assistant_has_permission(
        session, user.id, teacher_id, resource, action
    ):
        return

    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")


async def assert_student_enrolled_in_course(
    session: AsyncSession,
    course_id: UUID,
    user: User,
    *,
    not_found_detail: str = "Course not found",
    forbidden_detail: str = "Enrollment required",
) -> None:
    if user.role != Role.STUDENT:
        return

    result = await session.execute(
        select(Course.id).where(Course.id == course_id, Course.is_published.is_(True))
    )
    existing_course_id = result.scalar_one_or_none()
    if existing_course_id is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=not_found_detail)

    enrollment_result = await session.execute(
        select(Enrollment.id).where(
            Enrollment.student_id == user.id,
            Enrollment.course_id == course_id,
            Enrollment.status == EnrollmentStatus.ACTIVE,
        )
    )
    if enrollment_result.scalar_one_or_none() is None:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=forbidden_detail)


async def _require_course_id(course_id: UUID | None, not_found_detail: str) -> UUID:
    if course_id is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=not_found_detail)
    return course_id


async def assert_owns_chapter(
    session: AsyncSession, chapter_id: UUID, user: User, *, action: AssistantAction = AssistantAction.EDIT
) -> None:
    result = await session.execute(select(Chapter.course_id).where(Chapter.id == chapter_id))
    course_id = await _require_course_id(result.scalar_one_or_none(), "Chapter not found")
    await assert_can(session, user, course_id, AssistantResource.CHAPTERS_LESSONS, action, not_found_detail="Chapter not found")


async def assert_student_enrolled_in_chapter(session: AsyncSession, chapter_id: UUID, user: User) -> None:
    result = await session.execute(select(Chapter.course_id).where(Chapter.id == chapter_id))
    course_id = await _require_course_id(result.scalar_one_or_none(), "Chapter not found")
    await assert_student_enrolled_in_course(session, course_id, user, not_found_detail="Chapter not found")


async def assert_owns_lesson(
    session: AsyncSession, lesson_id: UUID, user: User, *, action: AssistantAction = AssistantAction.EDIT
) -> None:
    result = await session.execute(
        select(Chapter.course_id).join(Lesson, Lesson.chapter_id == Chapter.id).where(Lesson.id == lesson_id)
    )
    course_id = await _require_course_id(result.scalar_one_or_none(), "Lesson not found")
    await assert_can(session, user, course_id, AssistantResource.CHAPTERS_LESSONS, action, not_found_detail="Lesson not found")


async def assert_student_enrolled_in_lesson(session: AsyncSession, lesson_id: UUID, user: User) -> None:
    result = await session.execute(
        select(Chapter.course_id).join(Lesson, Lesson.chapter_id == Chapter.id).where(Lesson.id == lesson_id)
    )
    course_id = await _require_course_id(result.scalar_one_or_none(), "Lesson not found")
    await assert_student_enrolled_in_course(session, course_id, user, not_found_detail="Lesson not found")


async def assert_owns_concept(
    session: AsyncSession, concept_id: UUID, user: User, *, action: AssistantAction = AssistantAction.EDIT
) -> None:
    result = await session.execute(
        select(Chapter.course_id)
        .join(Lesson, Lesson.chapter_id == Chapter.id)
        .join(Concept, Concept.lesson_id == Lesson.id)
        .where(Concept.id == concept_id)
    )
    course_id = await _require_course_id(result.scalar_one_or_none(), "Concept not found")
    await assert_can(session, user, course_id, AssistantResource.CHAPTERS_LESSONS, action, not_found_detail="Concept not found")


async def assert_student_enrolled_in_concept(session: AsyncSession, concept_id: UUID, user: User) -> None:
    result = await session.execute(
        select(Chapter.course_id)
        .join(Lesson, Lesson.chapter_id == Chapter.id)
        .join(Concept, Concept.lesson_id == Lesson.id)
        .where(Concept.id == concept_id)
    )
    course_id = await _require_course_id(result.scalar_one_or_none(), "Concept not found")
    await assert_student_enrolled_in_course(session, course_id, user, not_found_detail="Concept not found")


async def assert_owns_atomic_concept(
    session: AsyncSession, atomic_concept_id: UUID, user: User, *, action: AssistantAction = AssistantAction.EDIT
) -> None:
    result = await session.execute(
        select(Chapter.course_id)
        .join(Lesson, Lesson.chapter_id == Chapter.id)
        .join(Concept, Concept.lesson_id == Lesson.id)
        .join(AtomicConcept, AtomicConcept.concept_id == Concept.id)
        .where(AtomicConcept.id == atomic_concept_id)
    )
    course_id = await _require_course_id(result.scalar_one_or_none(), "Atomic concept not found")
    await assert_can(
        session, user, course_id, AssistantResource.CHAPTERS_LESSONS, action, not_found_detail="Atomic concept not found"
    )


async def assert_owns_session(
    session: AsyncSession, session_id: UUID, user: User, *, action: AssistantAction = AssistantAction.EDIT
) -> None:
    result = await session.execute(select(ClassSession.course_id).where(ClassSession.id == session_id))
    course_id = await _require_course_id(result.scalar_one_or_none(), "Session not found")
    await assert_can(session, user, course_id, AssistantResource.SESSIONS, action, not_found_detail="Session not found")


async def assert_student_enrolled_in_session(session: AsyncSession, session_id: UUID, user: User) -> None:
    result = await session.execute(
        select(ClassSession.course_id).where(
            ClassSession.id == session_id,
            ClassSession.status == SessionStatus.published,
        )
    )
    course_id = await _require_course_id(result.scalar_one_or_none(), "Session not found")
    await assert_student_enrolled_in_course(
        session,
        course_id,
        user,
        not_found_detail="Session not found",
    )


async def assert_owns_session_block(
    session: AsyncSession, block_id: UUID, user: User, *, action: AssistantAction = AssistantAction.EDIT
) -> None:
    result = await session.execute(
        select(ClassSession.course_id)
        .join(SessionBlock, SessionBlock.session_id == ClassSession.id)
        .where(SessionBlock.id == block_id)
    )
    course_id = await _require_course_id(result.scalar_one_or_none(), "Session block not found")
    await assert_can(session, user, course_id, AssistantResource.SESSIONS, action, not_found_detail="Session block not found")


async def assert_student_enrolled_in_session_block(session: AsyncSession, block_id: UUID, user: User) -> None:
    result = await session.execute(
        select(ClassSession.course_id)
        .join(SessionBlock, SessionBlock.session_id == ClassSession.id)
        .where(
            SessionBlock.id == block_id,
            ClassSession.status == SessionStatus.published,
        )
    )
    course_id = await _require_course_id(result.scalar_one_or_none(), "Session block not found")
    await assert_student_enrolled_in_course(
        session,
        course_id,
        user,
        not_found_detail="Session block not found",
    )


async def assert_student_enrolled_in_material(session: AsyncSession, material_id: UUID, user: User) -> None:
    result = await session.execute(
        select(Material.course_id).where(
            Material.id == material_id,
            Material.status == MaterialStatus.published,
        )
    )
    course_id = await _require_course_id(result.scalar_one_or_none(), "Material not found")
    await assert_student_enrolled_in_course(
        session,
        course_id,
        user,
        not_found_detail="Material not found",
    )


async def assert_owns_quiz(
    session: AsyncSession,
    quiz_id: UUID,
    user: User,
    *,
    resource: AssistantResource = AssistantResource.QUIZZES,
    action: AssistantAction = AssistantAction.EDIT,
) -> None:
    """`resource` defaults to QUIZZES/EDIT (quiz-content mutation) but is
    overridden by callers checking quiz-*submission* access instead (viewing
    attempts, anti-cheating events, finalizing results) — those pass
    `resource=AssistantResource.QUIZ_SUBMISSIONS` or `ANTI_CHEATING`."""
    result = await session.execute(select(Quiz.course_id).where(Quiz.id == quiz_id))
    course_id = await _require_course_id(result.scalar_one_or_none(), "Quiz not found")
    await assert_can(session, user, course_id, resource, action, not_found_detail="Quiz not found")


async def assert_owns_video(
    session: AsyncSession, video_id: UUID, user: User, *, action: AssistantAction = AssistantAction.VIEW
) -> None:
    result = await session.execute(
        select(ClassSession.course_id)
        .join(SessionBlock, SessionBlock.session_id == ClassSession.id)
        .join(Video, Video.session_block_id == SessionBlock.id)
        .where(Video.id == video_id)
    )
    course_id = await _require_course_id(result.scalar_one_or_none(), "Video not found")
    await assert_can(session, user, course_id, AssistantResource.SESSIONS, action, not_found_detail="Video not found")


async def assert_student_enrolled_in_video(session: AsyncSession, video_id: UUID, user: User) -> None:
    result = await session.execute(
        select(ClassSession.course_id)
        .join(SessionBlock, SessionBlock.session_id == ClassSession.id)
        .join(Video, Video.session_block_id == SessionBlock.id)
        .where(Video.id == video_id, ClassSession.status == SessionStatus.published)
    )
    course_id = await _require_course_id(result.scalar_one_or_none(), "Video not found")
    await assert_student_enrolled_in_course(
        session,
        course_id,
        user,
        not_found_detail="Video not found",
    )


async def assert_parent_linked_to_student(session: AsyncSession, student_id: UUID, user: User) -> None:
    """A PARENT may act on a student's data only via an ACTIVE link.
    ADMIN/SUPER_ADMIN bypass."""
    if user.role in _ADMIN_ROLES:
        return

    result = await session.execute(
        select(ParentStudentLink.id).where(
            ParentStudentLink.parent_id == user.id,
            ParentStudentLink.student_id == student_id,
            ParentStudentLink.status == ParentLinkStatus.ACTIVE,
        )
    )
    if result.scalar_one_or_none() is None:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not linked to this student")


async def teacher_course_ids(session: AsyncSession, user: User) -> list[UUID]:
    """All course ids the given teacher owns (empty for non-teachers)."""
    if user.role not in (Role.TEACHER,) and user.role not in _ADMIN_ROLES:
        return []
    query = select(Course.id)
    if user.role not in _ADMIN_ROLES:
        query = query.where(Course.teacher_id == user.id)
    result = await session.execute(query)
    return list(result.scalars().all())


async def teacher_or_assistant_course_ids(
    session: AsyncSession,
    user: User,
    resource: AssistantResource,
    action: AssistantAction,
) -> list[UUID]:
    """Like `teacher_course_ids`, but also resolves the course ids an
    ASSISTANT may list/view — every course belonging to a teacher who has
    granted them an ACTIVE (resource, action) permission."""
    if user.role == Role.ASSISTANT:
        result = await session.execute(
            select(Course.id)
            .join(TeacherAssistantLink, TeacherAssistantLink.teacher_id == Course.teacher_id)
            .join(AssistantPermission, AssistantPermission.link_id == TeacherAssistantLink.id)
            .where(
                TeacherAssistantLink.assistant_id == user.id,
                TeacherAssistantLink.status == AssistantLinkStatus.ACTIVE,
                AssistantPermission.resource == resource,
                AssistantPermission.action == action,
            )
        )
        return list(result.scalars().all())
    return await teacher_course_ids(session, user)


async def assert_teaches_student(
    session: AsyncSession,
    student_id: UUID,
    user: User,
    *,
    assistant_action: AssistantAction = AssistantAction.VIEW,
) -> None:
    """A TEACHER may act on a student's data only if that student is (or was)
    enrolled in one of the teacher's courses. An ASSISTANT may do so only if
    granted the given PARENT_CONTACTS action by a teacher who teaches that
    student. ADMIN/SUPER_ADMIN bypass."""
    if user.role in _ADMIN_ROLES:
        return

    if user.role == Role.ASSISTANT:
        result = await session.execute(
            select(Course.teacher_id)
            .join(Enrollment, Enrollment.course_id == Course.id)
            .join(TeacherAssistantLink, TeacherAssistantLink.teacher_id == Course.teacher_id)
            .join(AssistantPermission, AssistantPermission.link_id == TeacherAssistantLink.id)
            .where(
                Enrollment.student_id == student_id,
                TeacherAssistantLink.assistant_id == user.id,
                TeacherAssistantLink.status == AssistantLinkStatus.ACTIVE,
                AssistantPermission.resource == AssistantResource.PARENT_CONTACTS,
                AssistantPermission.action == assistant_action,
            )
        )
        if result.first() is not None:
            return
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your student")

    result = await session.execute(
        select(Enrollment.id)
        .join(Course, Course.id == Enrollment.course_id)
        .where(Enrollment.student_id == student_id, Course.teacher_id == user.id)
    )
    if result.scalar_one_or_none() is None:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your student")
