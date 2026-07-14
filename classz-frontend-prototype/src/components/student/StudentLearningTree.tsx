import { Link } from "@tanstack/react-router";
import {
  BookCopy,
  BookOpen,
  FileStack,
  Layers3,
  Orbit,
  PlayCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import type {
  ChapterRead,
  CourseDetailsRead,
  LessonRead,
  SessionRead,
} from "@/lib/api/courses";
import { cn } from "@/lib/utils";

function sortByPosition<T extends { position: number }>(items: T[]): T[] {
  return [...items].sort((left, right) => left.position - right.position);
}

function getLessonSessions(course: CourseDetailsRead, lessonId: string): SessionRead[] {
  return sortByPosition(
    course.sessions.filter((session) =>
      session.lessons.some((lesson) => lesson.id === lessonId),
    ),
  );
}

function getChapterOnlySessions(course: CourseDetailsRead, chapterId: string): SessionRead[] {
  return sortByPosition(
    course.sessions.filter((session) =>
      session.chapters.some((chapter) => chapter.id === chapterId)
      && !session.lessons.some((lesson) => lesson.chapter_id === chapterId),
    ),
  );
}

function getLessonConceptCount(lesson: LessonRead): number {
  return lesson.concepts.length;
}

function getLessonAtomicConceptCount(lesson: LessonRead): number {
  return lesson.concepts.reduce(
    (count, concept) => count + concept.atomic_concepts.length,
    0,
  );
}

function SessionChip({
  courseId,
  session,
  tone = "default",
}: {
  courseId: string;
  session: SessionRead;
  tone?: "default" | "chapter";
}) {
  const toneClassName = tone === "chapter"
    ? "border-cyan-400/20 bg-cyan-500/5"
    : "border-white/10 bg-white/5";

  return (
    <Link
      to="/student/courses/$courseId/session"
      params={{ courseId }}
      search={{ sessionId: session.id, itemId: "" }}
      className={cn(
        "flex items-center justify-between rounded-xl border p-3 transition-colors hover:bg-white/10",
        toneClassName,
      )}
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <PlayCircle className="h-4 w-4 shrink-0 text-violet-300" />
          <p className="truncate text-sm font-semibold text-white">{session.title}</p>
        </div>
        <p className="mt-1 text-xs text-slate-400">
          Session {session.position}
          {session.is_free_preview ? " • Preview enabled" : ""}
        </p>
      </div>
      <Badge
        variant="outline"
        className={cn(
          "ml-3 shrink-0 rounded-full border-white/10 text-[10px] capitalize text-slate-200",
          session.is_locked && "border-amber-400/30 text-amber-200",
        )}
      >
        {session.is_locked ? "Locked" : "Open"}
      </Badge>
    </Link>
  );
}

function LessonSection({
  courseId,
  course,
  lesson,
}: {
  courseId: string;
  course: CourseDetailsRead;
  lesson: LessonRead;
}) {
  const lessonSessions = getLessonSessions(course, lesson.id);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-sky-300" />
            <h4 className="text-sm font-semibold text-white">{lesson.title}</h4>
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-slate-300">
            <Badge variant="outline" className="rounded-full border-white/10 bg-white/5">
              {getLessonConceptCount(lesson)} concepts
            </Badge>
            <Badge variant="outline" className="rounded-full border-white/10 bg-white/5">
              {getLessonAtomicConceptCount(lesson)} atomic concepts
            </Badge>
            <Badge variant="outline" className="rounded-full border-white/10 bg-white/5">
              {lessonSessions.length} sessions
            </Badge>
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {lessonSessions.length > 0 ? (
          lessonSessions.map((session) => (
            <SessionChip
              key={session.id}
              courseId={courseId}
              session={session}
            />
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-3 text-xs text-slate-400">
            No sessions are linked to this lesson yet.
          </div>
        )}
      </div>
    </div>
  );
}

function ChapterSection({
  courseId,
  course,
  chapter,
}: {
  courseId: string;
  course: CourseDetailsRead;
  chapter: ChapterRead;
}) {
  const lessons = sortByPosition(chapter.lessons);
  const chapterOnlySessions = getChapterOnlySessions(course, chapter.id);

  return (
    <AccordionItem
      value={chapter.id}
      className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] px-5"
    >
      <AccordionTrigger className="py-5 text-left hover:no-underline">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <div className="mt-0.5 rounded-xl bg-violet-500/10 p-2 text-violet-300">
            <Layers3 className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate text-base font-semibold text-white">{chapter.title}</p>
              <Badge variant="outline" className="rounded-full border-white/10 bg-white/5 text-[10px]">
                {lessons.length} lessons
              </Badge>
              <Badge variant="outline" className="rounded-full border-white/10 bg-white/5 text-[10px]">
                {chapterOnlySessions.length} direct sessions
              </Badge>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Chapter {chapter.position}
            </p>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="space-y-4 pt-1">
        {chapterOnlySessions.length > 0 ? (
          <div className="space-y-3 rounded-2xl border border-cyan-400/15 bg-cyan-500/[0.03] p-4">
            <div className="flex items-center gap-2 text-cyan-100">
              <FileStack className="h-4 w-4 text-cyan-300" />
              <p className="text-sm font-semibold">Chapter-linked sessions</p>
            </div>
            {chapterOnlySessions.map((session) => (
              <SessionChip
                key={session.id}
                courseId={courseId}
                session={session}
                tone="chapter"
              />
            ))}
          </div>
        ) : null}

        {lessons.length > 0 ? (
          <div className="space-y-4">
            {lessons.map((lesson) => (
              <LessonSection
                key={lesson.id}
                courseId={courseId}
                course={course}
                lesson={lesson}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-4 text-sm text-slate-400">
            No lessons are available in this chapter yet.
          </div>
        )}
      </AccordionContent>
    </AccordionItem>
  );
}

export function StudentLearningTree({
  course,
}: {
  course: CourseDetailsRead;
}) {
  const chapters = sortByPosition(course.chapters);

  if (chapters.length === 0) {
    return (
      <Card className="border-white/10 bg-white/[0.03] p-8 text-center">
        <div className="mx-auto flex max-w-md flex-col items-center gap-3">
          <BookCopy className="h-10 w-10 text-slate-500" />
          <h2 className="text-lg font-semibold text-white">No chapters published yet</h2>
          <p className="text-sm text-slate-400">
            This enrolled course is available, but its learning tree has not been published yet.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Orbit className="h-5 w-5 text-violet-300" />
        <h2 className="text-xl font-semibold text-white">Learning tree</h2>
      </div>
      <Accordion
        type="multiple"
        defaultValue={chapters.slice(0, 1).map((chapter) => chapter.id)}
        className="space-y-4"
      >
        {chapters.map((chapter) => (
          <ChapterSection
            key={chapter.id}
            courseId={course.id}
            course={course}
            chapter={chapter}
          />
        ))}
      </Accordion>
    </div>
  );
}

