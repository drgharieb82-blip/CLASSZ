import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  BookOpen, Calendar, Clock, Copy, DollarSign, Eye, FolderTree, Grid3x3,
  Layers, Lock, PlayCircle, Plus, Sparkles, Target, Unlock, Users, Video, Zap,
} from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ROLES } from "@/lib/roles";
import { cn } from "@/lib/utils";
import { useTeacherCourseStore } from "@/lib/teacher/teacher-course-store";
import { useTeacherSessionStore, listSessions } from "@/lib/teacher/teacher-session-store";
import { listChapters } from "@/lib/teacher/teacher-chapter-store";
import {
  BUILT_IN_TEMPLATES, SESSION_TYPE_META, type SessionWorkspaceType,
} from "@/lib/teacher/session-workspace-types";

export const Route = createFileRoute("/teacher/sessions")({
  component: SessionWorkspacePage,
});

function SessionWorkspacePage() {
  const courses = useTeacherCourseStore((s) => s.courses);
  const allSessions = useTeacherSessionStore((s) => s.sessions);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [view, setView] = useState<"list" | "templates" | "graph">("list");

  const courseSessions = selectedCourse ? allSessions.filter((s) => s.courseId === selectedCourse) : allSessions;
  const chapters = selectedCourse ? listChapters(selectedCourse) : [];
  const course = courses.find((c) => c.id === selectedCourse);

  return (
    <DashPage role="teacher" title="Session Workspace" subtitle="Build premium learning experiences for your students" icon={ROLES.teacher.icon}>
      {/* Course Selector + Views */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)} className="h-9 rounded-xl border bg-card px-3 text-sm font-medium max-w-[250px]">
            <option value="">All Courses</option>
            {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
          {course && <Badge variant="outline" className="rounded-full text-xs">{courseSessions.length} sessions</Badge>}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border">
            <button onClick={() => setView("list")} className={cn("px-3 py-1.5 text-xs font-medium", view === "list" ? "bg-primary/10 text-primary" : "text-muted-foreground")}>List</button>
            <button onClick={() => setView("templates")} className={cn("px-3 py-1.5 text-xs font-medium border-x", view === "templates" ? "bg-primary/10 text-primary" : "text-muted-foreground")}>Templates</button>
            <button onClick={() => setView("graph")} className={cn("px-3 py-1.5 text-xs font-medium", view === "graph" ? "bg-primary/10 text-primary" : "text-muted-foreground")}>Graph</button>
          </div>
          {selectedCourse && (
            <Button asChild className="rounded-xl gradient-brand border-0 text-white" size="sm">
              <Link to="/teacher/courses/$courseId/sessions" params={{ courseId: selectedCourse }}><Plus className="me-1.5 h-4 w-4" /> Create Session</Link>
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Card className="flex items-center gap-2 border bg-card p-3"><PlayCircle className="h-4 w-4 text-blue-500" /><div><p className="text-lg font-bold">{courseSessions.length}</p><p className="text-xs text-muted-foreground">Sessions</p></div></Card>
        <Card className="flex items-center gap-2 border bg-card p-3"><Eye className="h-4 w-4 text-emerald-500" /><div><p className="text-lg font-bold">{courseSessions.filter((s) => s.status === "published").length}</p><p className="text-xs text-muted-foreground">Published</p></div></Card>
        <Card className="flex items-center gap-2 border bg-card p-3"><Lock className="h-4 w-4 text-amber-500" /><div><p className="text-lg font-bold">{courseSessions.filter((s) => s.accessStatus === "locked").length}</p><p className="text-xs text-muted-foreground">Locked</p></div></Card>
        <Card className="flex items-center gap-2 border bg-card p-3"><Sparkles className="h-4 w-4 text-violet-500" /><div><p className="text-lg font-bold">{courseSessions.filter((s) => s.isFreePreview).length}</p><p className="text-xs text-muted-foreground">Free Preview</p></div></Card>
        <Card className="flex items-center gap-2 border bg-card p-3"><DollarSign className="h-4 w-4 text-primary" /><div><p className="text-lg font-bold">${courseSessions.reduce((a, s) => a + (s.price || 0), 0)}</p><p className="text-xs text-muted-foreground">Total Price</p></div></Card>
      </div>

      {/* Template View */}
      {view === "templates" && (
        <div>
          <h3 className="font-semibold mb-3">Session Templates</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {BUILT_IN_TEMPLATES.map((tpl) => {
              const meta = SESSION_TYPE_META[tpl.type];
              return (
                <Card key={tpl.id} className="border bg-card p-4 transition-colors hover:border-primary/30 cursor-pointer">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={cn("rounded-full text-xs border-0", meta.color)}>{meta.label}</Badge>
                    <Badge variant="outline" className="rounded-full text-xs">Built-in</Badge>
                  </div>
                  <p className="font-semibold">{tpl.name}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {tpl.blocks.map((b) => (
                      <span key={b} className="rounded-md border px-2 py-0.5 text-xs text-muted-foreground">{b.replace("_", " ")}</span>
                    ))}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Graph View Placeholder */}
      {view === "graph" && (
        <Card className="flex flex-col items-center gap-4 border bg-card p-12 text-center">
          <Grid3x3 className="h-12 w-12 text-muted-foreground" />
          <h3 className="text-lg font-semibold">Session Graph View</h3>
          <p className="text-sm text-muted-foreground max-w-md">Visual dependency graph showing session flow, prerequisites, and connections. Coming in the next phase.</p>
          <Badge variant="outline" className="rounded-full">Future Feature</Badge>
        </Card>
      )}

      {/* List View */}
      {view === "list" && (
        <>
          {courseSessions.length === 0 ? (
            <Card className="flex flex-col items-center gap-4 border bg-card p-12 text-center">
              <Layers className="h-12 w-12 text-muted-foreground" />
              <h3 className="text-lg font-semibold">{selectedCourse ? "No sessions in this course" : "Select a course to view sessions"}</h3>
              <p className="text-sm text-muted-foreground">Sessions are premium learning packages. Start with a template or build from scratch.</p>
              {selectedCourse && (
                <Button asChild className="rounded-xl gradient-brand border-0 text-white">
                  <Link to="/teacher/courses/$courseId/sessions" params={{ courseId: selectedCourse }}><Plus className="me-1.5 h-4 w-4" /> Create First Session</Link>
                </Button>
              )}
            </Card>
          ) : (
            <div className="space-y-2">
              {courseSessions.sort((a, b) => a.order - b.order).map((session) => {
                const chapter = chapters.find((c) => c.id === session.chapterId);
                const typeMeta = SESSION_TYPE_META[session.sessionType as SessionWorkspaceType] || SESSION_TYPE_META.lesson;
                return (
                  <Card key={session.id} className="flex items-center gap-4 border bg-card px-5 py-4">
                    <div className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl text-sm font-bold", session.accessStatus === "unlocked" ? "bg-emerald-500/10 text-emerald-600" : "bg-slate-500/10 text-slate-500")}>
                      {session.accessStatus === "unlocked" ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold truncate">{session.title}</p>
                        <Badge className={cn("rounded-full text-xs border-0", typeMeta.color)}>{typeMeta.label}</Badge>
                        <Badge variant="outline" className={cn("rounded-full text-xs", session.status === "published" ? "border-emerald-300 text-emerald-600" : "border-amber-300 text-amber-600")}>{session.status}</Badge>
                        {session.isFreePreview && <Badge className="rounded-full bg-blue-500/10 text-blue-600 border-0 text-xs">Preview</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground">{session.publicCode} · {chapter?.title || "No chapter"} · {session.price === 0 ? "Free" : `$${session.price}`}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {selectedCourse && (
                        <Button asChild variant="outline" size="sm" className="rounded-lg text-xs h-8">
                          <Link to="/teacher/courses/$courseId/sessions/$sessionId" params={{ courseId: selectedCourse, sessionId: session.id }}>Canvas</Link>
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Learning Objectives Summary */}
      {selectedCourse && courseSessions.length > 0 && (
        <Card className="border bg-card p-5">
          <h3 className="font-semibold flex items-center gap-2"><Target className="h-4 w-4 text-primary" /> Session Coverage</h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-4">
            <div className="rounded-xl border p-3 text-center">
              <p className="text-xl font-bold">{chapters.length}</p>
              <p className="text-xs text-muted-foreground">Chapters</p>
            </div>
            <div className="rounded-xl border p-3 text-center">
              <p className="text-xl font-bold">{courseSessions.length}</p>
              <p className="text-xs text-muted-foreground">Sessions</p>
            </div>
            <div className="rounded-xl border p-3 text-center">
              <p className="text-xl font-bold">{courseSessions.filter((s) => s.status === "published").length}</p>
              <p className="text-xs text-muted-foreground">Published</p>
            </div>
            <div className="rounded-xl border p-3 text-center">
              <p className="text-xl font-bold">{courseSessions.filter((s) => s.hasQuiz || s.hasExam).length}</p>
              <p className="text-xs text-muted-foreground">With Assessment</p>
            </div>
          </div>
        </Card>
      )}
    </DashPage>
  );
}
