import { useState, useCallback, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen } from "lucide-react";
import { LessonPlayerLayout } from "@/components/lesson/LessonPlayerLayout";
import { SessionSidebar } from "@/components/lesson/SessionSidebar";
import { LessonHeader } from "@/components/lesson/LessonHeader";
import { ContentPlayer } from "@/components/lesson/ContentPlayer";
import { LessonNavigation } from "@/components/lesson/LessonNavigation";
import { LessonContent } from "@/components/lesson/LessonContent";
import { LessonTabs } from "@/components/lesson/LessonTabs";
import {
  QuizCard,
  HomeworkCard,
  AttachmentCard,
} from "@/components/lesson/SessionItemContent";
import { getSessionCourseById, getSessionProgress } from "@/lib/sessionMock";
import {
  initialNotes,
  detectSmartType,
  type SessionNote,
  type NoteImportance,
} from "@/lib/notesMock";

export const Route = createFileRoute("/student/courses/$courseId/session")({
  component: CourseSessionPage,
});

function CourseSessionPage() {
  const { courseId } = Route.useParams();
  const course = getSessionCourseById(courseId);

  if (!course) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#080C1A] px-4">
        <div className="flex max-w-sm flex-col items-center text-center">
          <div className="mb-5 grid h-20 w-20 place-items-center rounded-full border border-violet-500/20 bg-violet-500/10">
            <BookOpen className="h-9 w-9 text-violet-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">Session Not Available Yet</h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-400">
            This course does not have an unlocked learning session yet.
          </p>
          <a
            href="/student/courses"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-blue-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:scale-[1.03] hover:shadow-violet-500/25"
          >
            <ArrowLeft className="h-4 w-4" /> Back to My Courses
          </a>
        </div>
      </div>
    );
  }

  return <SessionPlayer course={course} courseId={courseId} />;
}

function SessionPlayer({
  course,
  courseId,
}: {
  course: NonNullable<ReturnType<typeof getSessionCourseById>>;
  courseId: string;
}) {
  const allItems = useMemo(
    () => course.sessions.flatMap((s) => s.items),
    [course],
  );

  const firstActiveId = allItems.find((i) => i.status === "active")?.id
    ?? allItems.find((i) => i.status === "available")?.id
    ?? allItems[0]?.id
    ?? "";

  const [activeItemId, setActiveItemId] = useState(firstActiveId);
  const [notes, setNotes] = useState<SessionNote[]>(() => [...initialNotes]);

  const activeItem = allItems.find((i) => i.id === activeItemId) ?? allItems[0];
  const activeIdx = allItems.indexOf(activeItem);
  const hasPrevious = activeIdx > 0;
  const hasNext = activeIdx < allItems.length - 1;

  const activeSession = course.sessions.find((s) =>
    s.items.some((i) => i.id === activeItemId),
  );

  const progress = getSessionProgress(course);

  const navigate = useCallback(
    (dir: -1 | 1) => {
      const nextIdx = activeIdx + dir;
      if (nextIdx >= 0 && nextIdx < allItems.length) {
        const next = allItems[nextIdx];
        if (next.status !== "locked") setActiveItemId(next.id);
      }
    },
    [activeIdx, allItems],
  );

  const sessionItemCount = activeSession
    ? `${activeSession.items.filter((i) => i.status === "completed").length}/${activeSession.items.length} items`
    : "";

  const breadcrumbSession = activeSession?.title ?? "Session";

  const activeNotes = useMemo(
    () => notes.filter((n) => n.sessionItemId === activeItemId),
    [notes, activeItemId],
  );

  const handleAddNote = useCallback(
    (body: string, tags: string[], importance: NoteImportance) => {
      const now = new Date().toISOString();
      const newNote: SessionNote = {
        id: `n-${Date.now()}`,
        body,
        subjectName: course.teacher.subject,
        courseName: course.name,
        sessionTitle: activeSession?.title ?? "",
        sessionItemTitle: activeItem.title,
        sessionItemId: activeItemId,
        itemType: activeItem.type,
        createdAt: now,
        updatedAt: now,
        tags,
        importance,
        pinned: false,
        smartType: detectSmartType(body),
      };
      setNotes((prev) => [...prev, newNote]);
    },
    [course, activeSession, activeItem, activeItemId],
  );

  const handleEditNote = useCallback(
    (id: string, body: string, tags: string[], importance: NoteImportance) => {
      setNotes((prev) =>
        prev.map((n) =>
          n.id === id
            ? { ...n, body, tags, importance, smartType: detectSmartType(body), updatedAt: new Date().toISOString() }
            : n,
        ),
      );
    },
    [],
  );

  const handleDeleteNote = useCallback((id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const handlePinNote = useCallback((id: string) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n)),
    );
  }, []);

  return (
    <LessonPlayerLayout
      sidebar={
        <SessionSidebar
          course={course}
          activeItemId={activeItemId}
          onItemClick={(id) => {
            const item = allItems.find((i) => i.id === id);
            if (item && item.status !== "locked") setActiveItemId(id);
          }}
          completedItems={progress.completedItems}
          totalItems={progress.totalItems}
          coursePercent={progress.percent}
        />
      }
      content={
        <motion.div
          key={activeItemId}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="space-y-5 p-4 sm:p-6"
        >
          <LessonHeader
            courseName={course.name}
            chapterName={breadcrumbSession}
            lessonTitle={activeItem.title}
            lessonDescription={
              activeItem.videoDescription ??
              `${activeItem.type.charAt(0).toUpperCase() + activeItem.type.slice(1)} · ${sessionItemCount}`
            }
            lessonNumber={activeIdx + 1}
            totalLessons={allItems.length}
            progress={progress.percent}
          />

          {activeItem.type === "video" && (
            <>
              <ContentPlayer
                title={activeItem.title}
                type="video"
                thumbnailEmoji={course.emoji}
              />
              {activeItem.videoDescription && (
                <LessonContent
                  blocks={[{ type: "text" as const, content: activeItem.videoDescription }]}
                />
              )}
            </>
          )}

          {activeItem.type === "quiz" && <QuizCard item={activeItem} />}
          {activeItem.type === "homework" && <HomeworkCard item={activeItem} />}
          {activeItem.type === "attachment" && <AttachmentCard item={activeItem} />}

          <LessonNavigation
            hasPrevious={hasPrevious}
            hasNext={hasNext}
            isCompleted={activeItem.status === "completed"}
            onPrevious={() => navigate(-1)}
            onNext={() => navigate(1)}
          />
        </motion.div>
      }
      panel={
        <LessonTabs
          objectives={
            activeItem.type === "video"
              ? ["Understand the core concept", "Apply formulas and techniques", "Solve practice problems"]
              : activeItem.type === "quiz"
                ? [`Answer ${activeItem.questionCount ?? 0} questions`, `Time limit: ${activeItem.quizDuration ?? "N/A"}`, `Pass with ${activeItem.passingScore ?? 0}%`]
                : activeItem.type === "homework"
                  ? [`Complete ${activeItem.questionCount ?? 0} questions`, `Due: ${activeItem.dueDate ?? "N/A"}`, `${activeItem.attemptsAllowed ?? 1} attempt(s) allowed`]
                  : ["Download or preview the resource"]
          }
          keyConcepts={
            activeItem.type === "video"
              ? ["Key Topic 1", "Key Topic 2", "Key Topic 3"]
              : [activeItem.type.charAt(0).toUpperCase() + activeItem.type.slice(1)]
          }
          duration={activeItem.duration ?? activeItem.quizDuration ?? "—"}
          contentType={activeItem.type.charAt(0).toUpperCase() + activeItem.type.slice(1)}
          progress={progress.percent}
          watchedTime={activeItem.status === "completed" ? "Completed" : "—"}
          remainingTime={activeItem.status === "completed" ? "0:00" : "—"}
          teacherName={course.teacher.name}
          teacherSubject={course.teacher.subject}
          teacherInitials={course.teacher.initials}
          sessionAccess={activeSession?.access}
          notes={activeNotes}
          onAddNote={handleAddNote}
          onEditNote={handleEditNote}
          onDeleteNote={handleDeleteNote}
          onPinNote={handlePinNote}
        />
      }
    />
  );
}
