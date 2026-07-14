import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  FileImage,
  FileText,
  Layers3,
  ListTree,
  Lock,
  PlayCircle,
  Shield,
  Video,
} from "lucide-react";
import { LessonPlayerLayout } from "@/components/lesson/LessonPlayerLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import type {
  CourseDetailsRead,
  SessionRead as CourseSessionRead,
} from "@/lib/api/courses";
import {
  getStudentSessionDetail,
  type StudentSessionBlockRead,
  type StudentSessionBlockType,
  type StudentSessionDetailRead,
  type StudentVideoRead,
} from "@/lib/api/student-session-detail";
import type { MaterialRead } from "@/lib/api/materials";
import { resolveFileUrl } from "@/lib/api/client";
import {
  getStudentCourseAccessError,
  loadStudentCourseAccess,
} from "@/lib/student-course-access";
import { cn } from "@/lib/utils";

type PlayerItemType = "video" | "text" | "pdf" | "image" | "attachment" | "notes";

type PlayerItem = {
  id: string;
  entityId: string;
  kind: "session_block" | "material";
  type: PlayerItemType;
  title: string;
  description: string;
  position: number;
  contentUrl?: string;
  textContent?: string;
  fileName?: string;
  sourceLabel: string;
};

export const Route = createFileRoute("/student/courses/$courseId/session")({
  validateSearch: (search: Record<string, unknown>) => ({
    sessionId: (search.sessionId as string) || "",
    itemId: (search.itemId as string) || "",
  }),
  component: CourseSessionPage,
});

function CourseSessionPage() {
  const { courseId } = Route.useParams();
  const { sessionId, itemId } = Route.useSearch();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const [course, setCourse] = useState<CourseDetailsRead | null>(null);
  const [sessionDetail, setSessionDetail] = useState<StudentSessionDetailRead | null>(null);
  const [sessionDetailLoading, setSessionDetailLoading] = useState(false);
  const [sessionDetailError, setSessionDetailError] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setSessionDetail(null);
      setSessionDetailLoading(false);
      setSessionDetailError("");

      try {
        const access = await loadStudentCourseAccess(courseId);
        if (!active) return;

        setAllowed(access.allowed);
        setCourse(access.course);
        setError("");

        if (!access.allowed || !access.course) {
          return;
        }
      } catch (err) {
        if (!active) return;
        setAllowed(false);
        setCourse(null);
        setSessionDetail(null);
        setError(getStudentCourseAccessError(err, "Failed to verify course access."));
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, [courseId]);

  const orderedSessions = useMemo(
    () => [...(course?.sessions ?? [])].sort((left, right) => left.position - right.position),
    [course],
  );

  const defaultSession = useMemo(
    () =>
      orderedSessions.find((session) => canOpenSession(session))
      ?? orderedSessions[0]
      ?? null,
    [orderedSessions],
  );

  const activeSession = useMemo(
    () =>
      orderedSessions.find((session) => session.id === sessionId)
      ?? defaultSession,
    [defaultSession, orderedSessions, sessionId],
  );

  useEffect(() => {
    if (!course || !activeSession) return;
    if (sessionId === activeSession.id) return;

    navigate({
      to: "/student/courses/$courseId/session",
      params: { courseId },
      search: { sessionId: activeSession.id, itemId: "" },
      replace: true,
    });
  }, [activeSession, course, courseId, itemId, navigate, sessionId]);

  useEffect(() => {
    let active = true;

    async function loadSessionDetailData() {
      if (!activeSession || !canOpenSession(activeSession)) {
        setSessionDetail(null);
        setSessionDetailError("");
        setSessionDetailLoading(false);
        return;
      }

      setSessionDetailLoading(true);
      setSessionDetailError("");
      setSessionDetail(null);

      try {
        const detail = await getStudentSessionDetail(activeSession.id);
        if (!active) return;
        setSessionDetail(detail);
      } catch (err) {
        if (!active) return;
        setSessionDetail(null);
        setSessionDetailError(
          getStudentCourseAccessError(err, "Failed to load session content."),
        );
      } finally {
        if (active) setSessionDetailLoading(false);
      }
    }

    void loadSessionDetailData();

    return () => {
      active = false;
    };
  }, [activeSession]);

  const resolvedSession = sessionDetail?.session ?? activeSession ?? null;
  const blocks = sessionDetail?.blocks ?? [];
  const sessionMaterials = sessionDetail?.materials ?? [];
  const sessionVideos = sessionDetail?.videos ?? [];

  const playerItems = useMemo(
    () => buildPlayerItems(blocks, sessionMaterials, sessionVideos),
    [blocks, sessionMaterials, sessionVideos],
  );

  const activeItem = useMemo(
    () => playerItems.find((playerItem) => playerItem.id === itemId) ?? playerItems[0] ?? null,
    [itemId, playerItems],
  );

  useEffect(() => {
    if (!activeSession) return;
    const nextItemId = activeItem?.id ?? "";
    if (itemId === nextItemId) return;

    navigate({
      to: "/student/courses/$courseId/session",
      params: { courseId },
      search: { sessionId: activeSession.id, itemId: nextItemId },
      replace: true,
    });
  }, [activeItem, activeSession, courseId, itemId, navigate]);

  const activeIndex = activeItem
    ? playerItems.findIndex((playerItem) => playerItem.id === activeItem.id)
    : -1;

  const hasPrevious = activeIndex > 0;
  const hasNext = activeIndex >= 0 && activeIndex < playerItems.length - 1;

  const navigateItem = (direction: -1 | 1) => {
    if (!activeSession || activeIndex < 0) return;
    const nextItem = playerItems[activeIndex + direction];
    if (!nextItem) return;
    navigate({
      to: "/student/courses/$courseId/session",
      params: { courseId },
      search: { sessionId: activeSession.id, itemId: nextItem.id },
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#080C1A] px-4 text-white">
        <p className="text-sm text-slate-400">Loading your session workspace...</p>
      </div>
    );
  }

  if (!allowed || !course) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#080C1A] px-4 text-white">
        <Shield className="h-16 w-16 text-slate-600" />
        <h1 className="text-2xl font-bold">{error || "Course Access Required"}</h1>
        <p className="max-w-md text-center text-sm text-slate-400">
          Enroll in this course before opening its student learning workspace.
        </p>
        <Link
          to="/student/courses/$courseId/enroll"
          params={{ courseId }}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-blue-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:scale-[1.03] hover:shadow-violet-500/25"
        >
          Open Enrollment
        </Link>
      </div>
    );
  }

  if (!activeSession) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#080C1A] px-4 text-white">
        <BookOpen className="h-14 w-14 text-slate-600" />
        <h1 className="mt-4 text-2xl font-bold">No Sessions Published Yet</h1>
        <p className="mt-2 max-w-md text-center text-sm text-slate-400">
          This enrolled course is available, but no real learning sessions have been published yet.
        </p>
        <Link
          to="/student/courses/$courseId"
          params={{ courseId }}
          className="mt-6 inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-200 hover:bg-white/5"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Course Overview
        </Link>
      </div>
    );
  }

  const isLocked = !canOpenSession(activeSession);

  return (
    <LessonPlayerLayout
      sidebar={
        <StudentSessionSidebar
          course={course}
          sessions={orderedSessions}
          activeSessionId={activeSession.id}
          activeItemId={activeItem?.id ?? ""}
          onOpenSession={(nextSessionId) => {
            navigate({
              to: "/student/courses/$courseId/session",
              params: { courseId },
              search: { sessionId: nextSessionId, itemId: "" },
            });
          }}
          onOpenItem={(nextItemId) => {
            navigate({
              to: "/student/courses/$courseId/session",
              params: { courseId },
              search: { sessionId: activeSession.id, itemId: nextItemId },
            });
          }}
          currentSessionItems={playerItems}
        />
      }
      content={
        <div className="space-y-5 p-4 sm:p-6">
          <div className="space-y-3">
            <nav className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
              <Link to="/student" className="transition-colors hover:text-foreground">
                Dashboard
              </Link>
              <ChevronRight className="h-3 w-3" />
              <Link to="/student/courses" className="transition-colors hover:text-foreground">
                My Courses
              </Link>
              <ChevronRight className="h-3 w-3" />
              <Link
                to="/student/courses/$courseId"
                params={{ courseId }}
                className="transition-colors hover:text-foreground"
              >
                {course.title}
              </Link>
              <ChevronRight className="h-3 w-3" />
              <span>{activeSession.title}</span>
            </nav>

            <div className="rounded-2xl border bg-card/60 p-5">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="rounded-full border-white/10 bg-white/5">
                      Session {activeSession.position}
                    </Badge>
                    <Badge variant="outline" className="rounded-full border-white/10 bg-white/5 capitalize">
                      {activeSession.status}
                    </Badge>
                    {activeSession.is_free_preview ? (
                      <Badge className="rounded-full border-0 bg-blue-500/10 text-blue-300">
                        Free Preview
                      </Badge>
                    ) : null}
                    {activeSession.is_locked ? (
                      <Badge className="rounded-full border-0 bg-amber-500/10 text-amber-300">
                        Locked
                      </Badge>
                    ) : null}
                  </div>
                  <h1 className="text-2xl font-bold text-white sm:text-3xl">
                    {activeItem?.title ?? activeSession.title}
                  </h1>
                  <p className="text-sm text-slate-300">
                    {activeItem?.description || activeSession.description || "Real backend-driven session content."}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[320px]">
                  <SessionMetric label="Blocks" value={String(blocks.length)} />
                  <SessionMetric label="Materials" value={String(sessionMaterials.length)} />
                  <SessionMetric label="Concepts" value={String((resolvedSession ?? activeSession).concepts.length)} />
                </div>
              </div>
            </div>
          </div>

          {sessionDetailError ? (
            <InlineAlert tone="warning" message={sessionDetailError} />
          ) : null}

          {isLocked ? (
            <LockedSessionState courseId={courseId} session={activeSession} />
          ) : sessionDetailLoading ? (
            <LoadingState />
          ) : !activeItem ? (
            <EmptySessionState />
          ) : (
            <>
              <SessionContentCard item={activeItem} />
              <div className="flex items-center justify-between gap-3">
                <Button
                  variant="outline"
                  className="rounded-xl"
                  disabled={!hasPrevious}
                  onClick={() => navigateItem(-1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous Item
                </Button>
                <Button
                  variant="outline"
                  className="rounded-xl"
                  disabled={!hasNext}
                  onClick={() => navigateItem(1)}
                >
                  Next Item
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </div>
      }
      panel={
        <StudentSessionPanel
          session={resolvedSession ?? activeSession}
          activeItem={activeItem}
          blocksCount={blocks.length}
          materialsCount={sessionMaterials.length}
        />
      }
    />
  );
}

function StudentSessionSidebar({
  course,
  sessions,
  activeSessionId,
  activeItemId,
  currentSessionItems,
  onOpenSession,
  onOpenItem,
}: {
  course: CourseDetailsRead;
  sessions: CourseSessionRead[];
  activeSessionId: string;
  activeItemId: string;
  currentSessionItems: PlayerItem[];
  onOpenSession: (sessionId: string) => void;
  onOpenItem: (itemId: string) => void;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b p-4">
        <p className="truncate text-base font-semibold text-white">{course.title}</p>
        <p className="mt-1 text-xs text-slate-400">
          {sessions.length} sessions • student workspace
        </p>
      </div>

      <ScrollArea className="flex-1 px-3 py-3">
        <div className="space-y-2">
          {sessions.map((session) => {
            const open = session.id === activeSessionId;
            const sessionItems = open ? currentSessionItems : [];

            return (
              <div
                key={session.id}
                className={cn(
                  "rounded-2xl border p-3",
                  open ? "border-primary/30 bg-primary/5" : "border-white/10 bg-white/[0.03]",
                )}
              >
                <button
                  onClick={() => onOpenSession(session.id)}
                  className="flex w-full items-start justify-between gap-3 text-left"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">{session.title}</span>
                      {session.is_locked ? (
                        <Lock className="h-3.5 w-3.5 text-amber-300" />
                      ) : null}
                    </div>
                    <p className="mt-1 text-xs text-slate-400">
                      Session {session.position}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className="rounded-full border-white/10 bg-white/5 text-[10px]"
                  >
                    {sessionItems.length || (session.id === activeSessionId ? "Open" : "View")}
                  </Badge>
                </button>

                {open ? (
                  <div className="mt-3 space-y-1.5">
                    {sessionItems.length > 0 ? (
                      sessionItems.map((item, index) => (
                        <button
                          key={item.id}
                          onClick={() => onOpenItem(item.id)}
                          className={cn(
                            "flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm transition-colors",
                            item.id === activeItemId
                              ? "bg-white/10 text-white"
                              : "text-slate-300 hover:bg-white/5",
                          )}
                        >
                          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/5 text-[11px] text-slate-300">
                            {index + 1}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">{item.title}</p>
                            <p className="text-[10px] uppercase tracking-wide text-slate-400">
                              {item.sourceLabel}
                            </p>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="rounded-xl border border-dashed border-white/10 px-3 py-2 text-xs text-slate-400">
                        No published content in this session yet.
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}

function StudentSessionPanel({
  session,
  activeItem,
  blocksCount,
  materialsCount,
}: {
  session: CourseSessionRead;
  activeItem: PlayerItem | null;
  blocksCount: number;
  materialsCount: number;
}) {
  return (
    <ScrollArea className="h-full">
      <div className="space-y-4 p-4">
        <Card className="border bg-card/70 p-4">
          <div className="flex items-center gap-2">
            <Layers3 className="h-4 w-4 text-violet-300" />
            <h2 className="text-sm font-semibold text-white">Session Metadata</h2>
          </div>
          <div className="mt-4 space-y-3 text-sm">
            <MetaRow label="Status" value={session.status} />
            <MetaRow label="Preview" value={session.is_free_preview ? "Enabled" : "No"} />
            <MetaRow label="Locked" value={session.is_locked ? "Yes" : "No"} />
            <MetaRow
              label="Prerequisite"
              value={session.requires_previous_completion ? "Required" : "Not required"}
            />
            <MetaRow label="Blocks" value={String(blocksCount)} />
            <MetaRow label="Materials" value={String(materialsCount)} />
            <MetaRow
              label="Release"
              value={session.release_at ? formatDateTime(session.release_at) : "Immediate"}
            />
            <MetaRow
              label="Hide"
              value={session.hide_at ? formatDateTime(session.hide_at) : "Not scheduled"}
            />
          </div>
        </Card>

        {activeItem ? (
          <Card className="border bg-card/70 p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-cyan-300" />
              <h2 className="text-sm font-semibold text-white">Active Content</h2>
            </div>
            <div className="mt-4 space-y-2">
              <p className="text-sm font-medium text-white">{activeItem.title}</p>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                {activeItem.sourceLabel}
              </p>
              {activeItem.description ? (
                <p className="text-sm text-slate-300">{activeItem.description}</p>
              ) : null}
            </div>
          </Card>
        ) : null}

        <Card className="border bg-card/70 p-4">
          <div className="flex items-center gap-2">
            <ListTree className="h-4 w-4 text-emerald-300" />
            <h2 className="text-sm font-semibold text-white">Academic Links</h2>
          </div>
          <TagSection label="Chapters" values={session.chapters.map((chapter) => chapter.title)} />
          <TagSection label="Lessons" values={session.lessons.map((lesson) => lesson.title)} />
          <TagSection label="Concepts" values={session.concepts.map((concept) => concept.title)} />
          <TagSection
            label="Atomic Concepts"
            values={session.atomic_concepts.map((atomicConcept) => atomicConcept.title)}
          />
        </Card>
      </div>
    </ScrollArea>
  );
}

function SessionContentCard({ item }: { item: PlayerItem }) {
  if (item.type === "video") {
    return (
      <Card className="overflow-hidden border bg-card/60">
        <div className="border-b px-5 py-4">
          <div className="flex items-center gap-2">
            <Video className="h-4 w-4 text-blue-300" />
            <h2 className="text-lg font-semibold text-white">{item.title}</h2>
          </div>
        </div>
        <div className="space-y-4 p-5">
          {item.contentUrl ? (
            isEmbeddedVideoUrl(item.contentUrl) ? (
              <div className="overflow-hidden rounded-2xl border bg-black">
                <iframe
                  title={item.title}
                  src={toEmbeddedVideoUrl(item.contentUrl)}
                  className="aspect-video w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <video
                controls
                className="aspect-video w-full rounded-2xl border bg-black"
                src={item.contentUrl}
              />
            )
          ) : (
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-8 text-center text-sm text-slate-400">
              No video URL is available for this material yet.
            </div>
          )}
          {item.description ? <RichTextContent content={item.description} /> : null}
        </div>
      </Card>
    );
  }

  if (item.type === "text" || item.type === "notes") {
    return (
      <Card className="border bg-card/60 p-5">
        <div className="mb-4 flex items-center gap-2">
          <FileText className="h-4 w-4 text-violet-300" />
          <h2 className="text-lg font-semibold text-white">{item.title}</h2>
        </div>
        <RichTextContent content={item.textContent || item.description || "No text content available."} />
      </Card>
    );
  }

  if (item.type === "pdf") {
    return (
      <Card className="border bg-card/60 p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-red-300" />
            <h2 className="text-lg font-semibold text-white">{item.title}</h2>
          </div>
          {item.contentUrl ? (
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => window.open(item.contentUrl, "_blank", "noopener,noreferrer")}
            >
              <ExternalLink className="h-4 w-4" />
              Open PDF
            </Button>
          ) : null}
        </div>
        {item.contentUrl ? (
          <iframe
            title={item.title}
            src={item.contentUrl}
            className="h-[70vh] w-full rounded-2xl border bg-white"
          />
        ) : (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-8 text-center text-sm text-slate-400">
            No PDF file is attached yet.
          </div>
        )}
      </Card>
    );
  }

  if (item.type === "image") {
    return (
      <Card className="border bg-card/60 p-5">
        <div className="mb-4 flex items-center gap-2">
          <FileImage className="h-4 w-4 text-pink-300" />
          <h2 className="text-lg font-semibold text-white">{item.title}</h2>
        </div>
        {item.contentUrl ? (
          <img
            src={item.contentUrl}
            alt={item.title}
            className="max-h-[70vh] w-full rounded-2xl border object-contain"
          />
        ) : (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-8 text-center text-sm text-slate-400">
            No image URL is attached yet.
          </div>
        )}
        {item.description ? <RichTextContent content={item.description} className="mt-4" /> : null}
      </Card>
    );
  }

  return (
    <Card className="border bg-card/60 p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-cyan-300" />
          <h2 className="text-lg font-semibold text-white">{item.title}</h2>
        </div>
        {item.contentUrl ? (
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => window.open(item.contentUrl, "_blank", "noopener,noreferrer")}
            >
              <ExternalLink className="h-4 w-4" />
              Preview
            </Button>
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => window.open(item.contentUrl, "_blank", "noopener,noreferrer")}
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
          </div>
        ) : null}
      </div>
      <p className="text-sm text-slate-300">
        {item.description || item.fileName || "No file metadata is available for this attachment."}
      </p>
    </Card>
  );
}

function RichTextContent({
  content,
  className,
}: {
  content: string;
  className?: string;
}) {
  const paragraphs = content
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return (
    <div className={cn("space-y-4", className)}>
      {paragraphs.length > 0 ? (
        paragraphs.map((paragraph, index) => (
          <p key={`${paragraph}-${index}`} className="whitespace-pre-wrap text-sm leading-7 text-slate-200">
            <LinkifiedText text={paragraph} />
          </p>
        ))
      ) : (
        <p className="text-sm text-slate-400">No rich text content is available yet.</p>
      )}
    </div>
  );
}

function LinkifiedText({ text }: { text: string }) {
  const parts = text.split(/(https?:\/\/[^\s]+)/g);

  return (
    <>
      {parts.map((part, index) =>
        /^https?:\/\/[^\s]+$/.test(part) ? (
          <a
            key={`${part}-${index}`}
            href={part}
            target="_blank"
            rel="noreferrer"
            className="break-all text-blue-300 underline underline-offset-4 hover:text-blue-200"
          >
            {part}
          </a>
        ) : (
          <span key={`${part}-${index}`}>{part}</span>
        ),
      )}
    </>
  );
}

function LockedSessionState({
  courseId,
  session,
}: {
  courseId: string;
  session: CourseSessionRead;
}) {
  return (
    <Card className="border bg-card/60 p-8 text-center">
      <Lock className="mx-auto h-12 w-12 text-amber-300" />
      <h2 className="mt-4 text-xl font-semibold text-white">This Session Is Locked</h2>
      <p className="mt-2 text-sm text-slate-400">
        {session.description || "This real session exists, but access is still locked."}
      </p>
      <Link
        to="/student/courses/$courseId"
        params={{ courseId }}
        className="mt-6 inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-200 hover:bg-white/5"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Course Overview
      </Link>
    </Card>
  );
}

function EmptySessionState() {
  return (
    <Card className="border bg-card/60 p-8 text-center">
      <BookOpen className="mx-auto h-12 w-12 text-slate-500" />
      <h2 className="mt-4 text-xl font-semibold text-white">No Published Session Content Yet</h2>
      <p className="mt-2 text-sm text-slate-400">
        This session is available, but no real blocks or linked materials are published yet.
      </p>
    </Card>
  );
}

function LoadingState() {
  return (
    <Card className="border bg-card/60 p-8 text-center">
      <PlayCircle className="mx-auto h-12 w-12 animate-pulse text-violet-300" />
      <p className="mt-4 text-sm text-slate-400">Loading real session content...</p>
    </Card>
  );
}

function InlineAlert({
  tone,
  message,
}: {
  tone: "error" | "warning";
  message: string;
}) {
  return (
    <Card
      className={cn(
        "border p-4 text-sm",
        tone === "error"
          ? "border-red-500/20 bg-red-500/10 text-red-100"
          : "border-amber-500/20 bg-amber-500/10 text-amber-100",
      )}
    >
      {message}
    </Card>
  );
}

function SessionMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-lg font-semibold text-white">{value}</p>
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-slate-400">{label}</span>
      <span className="text-right text-white">{value}</span>
    </div>
  );
}

function TagSection({ label, values }: { label: string; values: string[] }) {
  return (
    <div className="mt-4">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <div className="flex flex-wrap gap-2">
        {values.length > 0 ? (
          values.map((value) => (
            <Badge
              key={`${label}-${value}`}
              variant="outline"
              className="rounded-full border-white/10 bg-white/5 text-slate-200"
            >
              {value}
            </Badge>
          ))
        ) : (
          <span className="text-sm text-slate-400">None linked</span>
        )}
      </div>
    </div>
  );
}

function canOpenSession(session: CourseSessionRead): boolean {
  return !session.is_locked || session.is_free_preview;
}

function buildPlayerItems(
  sessionBlocks: StudentSessionBlockRead[],
  materials: MaterialRead[],
  videos: StudentVideoRead[],
): PlayerItem[] {
  const videoByBlockId = new Map(videos.map((video) => [video.session_block_id, video]));
  const blockItems = sessionBlocks.map((block) => toPlayerBlockItem(block, videoByBlockId.get(block.id)));
  const materialItems = materials.map(toPlayerMaterialItem);

  return [...blockItems, ...materialItems].sort((left, right) => {
    if (left.position !== right.position) return left.position - right.position;
    if (left.kind === right.kind) return left.title.localeCompare(right.title);
    return left.kind === "session_block" ? -1 : 1;
  });
}

function toPlayerBlockItem(
  block: StudentSessionBlockRead,
  video?: StudentVideoRead,
): PlayerItem {
  const data = block.data_json;
  const titleMap: Record<SessionBlockType, string> = {
    TEXT: `Text Block ${block.position + 1}`,
    PDF: stringValue(data.title) || `PDF Block ${block.position + 1}`,
    IMAGE: stringValue(data.caption) || `Image Block ${block.position + 1}`,
    VIDEO: video?.title || `Video Block ${block.position + 1}`,
    ATTACHMENT: stringValue(data.filename) || `Attachment Block ${block.position + 1}`,
  };

  const typeMap: Record<SessionBlockType, PlayerItemType> = {
    TEXT: "text",
    PDF: "pdf",
    IMAGE: "image",
    VIDEO: "video",
    ATTACHMENT: "attachment",
  };

  return {
    id: `block:${block.id}`,
    entityId: block.id,
    kind: "session_block",
    type: typeMap[block.block_type],
    title: titleMap[block.block_type],
    description: stringValue(data.caption) || stringValue(data.title) || "",
    position: block.position,
    contentUrl: resolveFileUrl(
      toVideoContentUrl(video)
      || stringValue(data.file_url)
      || stringValue(data.image_url)
      || stringValue(data.video_url)
      || undefined,
    ) || undefined,
    textContent: stringValue(data.content) || undefined,
    fileName: stringValue(data.filename) || undefined,
    sourceLabel: `Session ${block.block_type.toLowerCase()} block`,
  };
}

function toVideoContentUrl(video?: StudentVideoRead): string | undefined {
  if (!video) return undefined;
  if (/^https?:\/\//i.test(video.provider_video_id)) return video.provider_video_id;
  if (video.provider === "LOCAL") return video.provider_video_id;
  return undefined;
}

type SessionBlockType = StudentSessionBlockType;

function toPlayerMaterialItem(material: MaterialRead): PlayerItem {
  const typeMap: Record<MaterialRead["type"], PlayerItemType> = {
    video: "video",
    notes: "notes",
    pdf: "pdf",
    image: "image",
    attachment: "attachment",
    document: "attachment",
    audio: "attachment",
  };

  return {
    id: `material:${material.id}`,
    entityId: material.id,
    kind: "material",
    type: typeMap[material.type],
    title: material.title,
    description: material.description || "",
    position: material.position,
    contentUrl: resolveFileUrl(material.video_url || material.file_url || undefined) || undefined,
    textContent: material.notes_content || undefined,
    sourceLabel: `Linked ${material.type} material`,
  };
}

function stringValue(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString();
}

function isEmbeddedVideoUrl(url: string): boolean {
  return /(?:youtube\.com|youtu\.be|vimeo\.com)/i.test(url);
}

function toEmbeddedVideoUrl(url: string): string {
  if (/youtu\.be\//i.test(url)) {
    const id = url.split("youtu.be/")[1]?.split(/[?&]/)[0] || "";
    return `https://www.youtube.com/embed/${id}`;
  }

  if (/youtube\.com\/watch/i.test(url)) {
    const parsed = new URL(url);
    return `https://www.youtube.com/embed/${parsed.searchParams.get("v") || ""}`;
  }

  if (/vimeo\.com\//i.test(url)) {
    const id = url.split("vimeo.com/")[1]?.split(/[?&/]/)[0] || "";
    return `https://player.vimeo.com/video/${id}`;
  }

  return url;
}
