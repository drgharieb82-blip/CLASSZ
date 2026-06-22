import { Link } from "@tanstack/react-router";
import {
  Archive, BookOpen, ClipboardList, Clock, Copy, DollarSign, Edit3,
  Eye, HelpCircle, Lock, MoreHorizontal, Pencil, Send, Trash2,
  Unlock, Users, Video, FileText, Layers,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { SESSION_TYPE_META, type SessionWorkspaceType } from "@/lib/teacher/session-workspace-types";
import type { TeacherSession } from "@/lib/teacher/teacher-session-store";

export interface SessionStats {
  materialsCount: number;
  questionsCount: number;
  quizzesCount: number;
  examsCount: number;
  homeworkCount: number;
}

interface SessionCardProps {
  session: TeacherSession;
  courseId: string;
  chapterName?: string;
  stats: SessionStats;
  onPublish?: () => void;
  onArchive?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  onToggleLock?: () => void;
}

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-amber-500/10 text-amber-600 border-amber-200",
  published: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
  archived: "bg-slate-500/10 text-slate-500 border-slate-200",
};

const ACCESS_MAP: Record<string, { icon: typeof Lock; label: string; cls: string }> = {
  locked: { icon: Lock, label: "Locked", cls: "text-slate-500" },
  unlocked: { icon: Unlock, label: "Unlocked", cls: "text-emerald-500" },
  scheduled: { icon: Clock, label: "Scheduled", cls: "text-blue-500" },
};

const TYPE_ACCENT: Record<string, string> = {
  lesson: "from-blue-500 to-blue-600",
  revision: "from-violet-500 to-violet-600",
  practice: "from-emerald-500 to-emerald-600",
  quiz_session: "from-amber-500 to-amber-600",
  exam_session: "from-rose-500 to-rose-600",
  homework_session: "from-orange-500 to-orange-600",
  mixed: "from-cyan-500 to-cyan-600",
  live: "from-green-500 to-green-600",
  crash_course: "from-pink-500 to-pink-600",
  final_revision: "from-indigo-500 to-indigo-600",
};

function stableHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function PremiumSessionCard({
  session, courseId, chapterName, stats,
  onPublish, onArchive, onDuplicate, onDelete, onToggleLock,
}: SessionCardProps) {
  const typeMeta = SESSION_TYPE_META[session.sessionType as SessionWorkspaceType] || SESSION_TYPE_META.lesson;
  const access = ACCESS_MAP[session.accessStatus] || ACCESS_MAP.locked;
  const AccessIcon = access.icon;
  const accent = TYPE_ACCENT[session.sessionType] || TYPE_ACCENT.lesson;
  const blocksCount = stats.materialsCount + stats.questionsCount;
  const mockStudents = (stableHash(session.id) % 180) + 12;
  const mockRevenue = session.price * mockStudents;

  return (
    <Card className="group relative overflow-hidden border bg-card transition-all duration-200 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20">
      <div className={cn("absolute inset-y-0 start-0 w-1 bg-gradient-to-b", accent)} />

      <div className="p-5 ps-6">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-[15px] truncate max-w-[260px]">{session.title}</h3>
              <Badge className={cn("rounded-full text-[10px] border-0 shrink-0 px-2 py-0", typeMeta.color)}>{typeMeta.label}</Badge>
              <Badge variant="outline" className={cn("rounded-full text-[10px] shrink-0 px-2 py-0", STATUS_STYLES[session.status])}>{session.status}</Badge>
              {session.isFreePreview && <Badge className="rounded-full bg-blue-500/10 text-blue-600 border-0 text-[10px] px-2 py-0 shrink-0">Free Preview</Badge>}
            </div>
            <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <span className="font-mono">{session.publicCode}</span>
              <span className="opacity-40">|</span>
              <AccessIcon className={cn("h-3 w-3", access.cls)} />
              <span>{access.label}</span>
              {chapterName && (
                <>
                  <span className="opacity-40">|</span>
                  <span className="truncate max-w-[140px]">{chapterName}</span>
                </>
              )}
            </div>
          </div>
          <div className="text-end shrink-0">
            <p className={cn("text-lg font-bold tracking-tight", session.price === 0 ? "text-emerald-600" : "text-foreground")}>
              {session.price === 0 ? "Free" : `$${session.price}`}
            </p>
          </div>
        </div>

        {/* Stats pills */}
        <div className="mt-3.5 flex flex-wrap gap-1.5">
          <div className="flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] bg-background/50">
            <Video className="h-3 w-3 text-blue-500" />
            <span className="font-semibold">{stats.materialsCount}</span>
            <span className="text-muted-foreground">materials</span>
          </div>
          <div className="flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] bg-background/50">
            <HelpCircle className="h-3 w-3 text-emerald-500" />
            <span className="font-semibold">{stats.questionsCount}</span>
            <span className="text-muted-foreground">questions</span>
          </div>
          <div className="flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] bg-background/50">
            <Layers className="h-3 w-3 text-violet-500" />
            <span className="font-semibold">{blocksCount}</span>
            <span className="text-muted-foreground">blocks</span>
          </div>
        </div>

        {/* Assessment badges */}
        {(stats.quizzesCount > 0 || stats.examsCount > 0 || stats.homeworkCount > 0 || session.hasQuiz || session.hasExam || session.hasHomework) && (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {(stats.quizzesCount > 0 || session.hasQuiz) && (
              <Badge variant="outline" className="rounded-full text-[10px] border-cyan-200 bg-cyan-500/5 text-cyan-700 px-2 py-0">
                <ClipboardList className="me-1 h-2.5 w-2.5" />{stats.quizzesCount || 1} Quiz
              </Badge>
            )}
            {(stats.homeworkCount > 0 || session.hasHomework) && (
              <Badge variant="outline" className="rounded-full text-[10px] border-orange-200 bg-orange-500/5 text-orange-700 px-2 py-0">
                <Pencil className="me-1 h-2.5 w-2.5" />{stats.homeworkCount || 1} Homework
              </Badge>
            )}
            {(stats.examsCount > 0 || session.hasExam) && (
              <Badge variant="outline" className="rounded-full text-[10px] border-rose-200 bg-rose-500/5 text-rose-700 px-2 py-0">
                <BookOpen className="me-1 h-2.5 w-2.5" />{stats.examsCount || 1} Exam
              </Badge>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-3.5 flex items-center justify-between border-t pt-3">
          <div className="flex items-center gap-3.5 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1"><Users className="h-3 w-3" />{mockStudents} students</span>
            {session.price > 0 && <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" />${mockRevenue}</span>}
          </div>
          <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <Button asChild variant="outline" size="sm" className="h-7 rounded-lg text-[11px] px-2">
              <Link to="/teacher/courses/$courseId/sessions/$sessionId" params={{ courseId, sessionId: session.id }}>
                <Edit3 className="me-1 h-3 w-3" />Edit
              </Link>
            </Button>
            <Button variant="ghost" size="sm" className="h-7 rounded-lg text-[11px] px-2">
              <Eye className="me-1 h-3 w-3" />Preview
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg"><MoreHorizontal className="h-3.5 w-3.5" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                {session.status === "draft" && onPublish && (
                  <DropdownMenuItem onClick={onPublish}><Send className="me-2 h-3.5 w-3.5" />Publish</DropdownMenuItem>
                )}
                {onDuplicate && <DropdownMenuItem onClick={onDuplicate}><Copy className="me-2 h-3.5 w-3.5" />Duplicate</DropdownMenuItem>}
                {onToggleLock && (
                  <DropdownMenuItem onClick={onToggleLock}>
                    {session.accessStatus === "locked"
                      ? <><Unlock className="me-2 h-3.5 w-3.5" />Unlock</>
                      : <><Lock className="me-2 h-3.5 w-3.5" />Lock</>}
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                {onArchive && <DropdownMenuItem onClick={onArchive} className="text-amber-600"><Archive className="me-2 h-3.5 w-3.5" />Archive</DropdownMenuItem>}
                {onDelete && <DropdownMenuItem onClick={onDelete} className="text-destructive"><Trash2 className="me-2 h-3.5 w-3.5" />Delete</DropdownMenuItem>}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </Card>
  );
}
