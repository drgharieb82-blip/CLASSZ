import { useState, useEffect } from "react";
import {
  BookOpen, Clock, StickyNote, Paperclip, HelpCircle, MessageSquare, Bot,
  Plus, Pin, PinOff, Pencil, Trash2, ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LessonOverviewCard } from "./LessonOverviewCard";
import { LessonProgressCard } from "./LessonProgressCard";
import { TeacherCard } from "./TeacherCard";
import type { SessionAccess } from "@/lib/sessionMock";
import {
  detectSmartType,
  smartTypeLabels,
  smartTypeColors,
  importanceColors,
  type SessionNote,
  type NoteImportance,
} from "@/lib/notesMock";

interface LessonTabsProps {
  objectives: string[];
  keyConcepts: string[];
  duration: string;
  contentType: string;
  progress: number;
  watchedTime: string;
  remainingTime: string;
  teacherName: string;
  teacherSubject: string;
  teacherInitials: string;
  sessionAccess?: SessionAccess;
  notes?: SessionNote[];
  onAddNote?: (body: string, tags: string[], importance: NoteImportance) => void;
  onEditNote?: (id: string, body: string, tags: string[], importance: NoteImportance) => void;
  onDeleteNote?: (id: string) => void;
  onPinNote?: (id: string) => void;
}

const TABS = [
  { id: "overview", label: "Overview", icon: BookOpen },
  { id: "notes", label: "Notes", icon: StickyNote },
  { id: "attachments", label: "Attach", icon: Paperclip },
  { id: "questions", label: "Q&A", icon: HelpCircle },
  { id: "discussion", label: "Discuss", icon: MessageSquare },
  { id: "ai", label: "AI", icon: Bot },
] as const;

export function LessonTabs(props: LessonTabsProps) {
  const [activeTab, setActiveTab] = useState<string>("overview");

  return (
    <div className="flex h-full flex-col">
      <div className="shrink-0 border-b">
        <div className="grid grid-cols-6 px-1 py-1.5">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex flex-col items-center gap-1 rounded-lg px-1 py-2 text-[11px] font-medium transition-colors",
                activeTab === tab.id
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4">
          {activeTab === "overview" && (
            <div className="space-y-4">
              {props.sessionAccess && (
                <SessionCountdown access={props.sessionAccess} />
              )}
              <LessonOverviewCard
                objectives={props.objectives}
                keyConcepts={props.keyConcepts}
                duration={props.duration}
                contentType={props.contentType}
              />
              <LessonProgressCard
                percent={props.progress}
                watchedTime={props.watchedTime}
                remainingTime={props.remainingTime}
              />
              <TeacherCard
                name={props.teacherName}
                subject={props.teacherSubject}
                initials={props.teacherInitials}
              />
            </div>
          )}

          {activeTab === "notes" && (
            <NotesPanel
              notes={props.notes ?? []}
              onAdd={props.onAddNote}
              onEdit={props.onEditNote}
              onDelete={props.onDeleteNote}
              onPin={props.onPinNote}
            />
          )}

          {activeTab === "attachments" && (
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Attachments</p>
              {["Lecture Slides.pdf", "Practice Problems.pdf", "Formula Sheet.pdf"].map((name) => (
                <div key={name} className="flex items-center gap-3 rounded-xl border bg-card/70 p-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-sm">📄</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{name}</p>
                    <p className="text-xs text-muted-foreground">PDF • 2.4 MB</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "questions" && (
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Questions</p>
              <div className="rounded-2xl border border-dashed bg-card/40 p-6 text-center">
                <HelpCircle className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">Ask a question about this lesson.</p>
              </div>
            </div>
          )}

          {activeTab === "discussion" && (
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Discussion</p>
              <div className="rounded-2xl border border-dashed bg-card/40 p-6 text-center">
                <MessageSquare className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">Join the discussion with your classmates.</p>
              </div>
            </div>
          )}

          {activeTab === "ai" && (
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">AI Assistant</p>
              <div className="rounded-2xl border border-dashed bg-card/40 p-6 text-center">
                <Bot className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">Ask the AI to explain concepts from this lesson.</p>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

// ── Notes Panel ──────────────────────────────────────────────────────

function NotesPanel({
  notes,
  onAdd,
  onEdit,
  onDelete,
  onPin,
}: {
  notes: SessionNote[];
  onAdd?: (body: string, tags: string[], importance: NoteImportance) => void;
  onEdit?: (id: string, body: string, tags: string[], importance: NoteImportance) => void;
  onDelete?: (id: string) => void;
  onPin?: (id: string) => void;
}) {
  const [composing, setComposing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [body, setBody] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [importance, setImportance] = useState<NoteImportance>("low");

  const sorted = [...notes].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return b.createdAt.localeCompare(a.createdAt);
  });

  const detected = body.trim() ? detectSmartType(body) : "general";

  const startEdit = (note: SessionNote) => {
    setEditId(note.id);
    setBody(note.body);
    setTagInput(note.tags.join(", "));
    setImportance(note.importance);
    setComposing(true);
  };

  const handleSave = () => {
    if (!body.trim()) return;
    const tags = tagInput.split(",").map((t) => t.trim()).filter(Boolean);
    if (editId) {
      onEdit?.(editId, body.trim(), tags, importance);
    } else {
      onAdd?.(body.trim(), tags, importance);
    }
    setBody("");
    setTagInput("");
    setImportance("low");
    setEditId(null);
    setComposing(false);
  };

  const handleCancel = () => {
    setBody("");
    setTagInput("");
    setImportance("low");
    setEditId(null);
    setComposing(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Your Notes
        </p>
        {!composing && (
          <button
            onClick={() => setComposing(true)}
            className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
          >
            <Plus className="h-3 w-3" /> Add
          </button>
        )}
      </div>

      {/* Compose / Edit form */}
      {composing && (
        <div className="space-y-2 rounded-2xl border bg-card/60 p-3">
          <textarea
            rows={3}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write your note..."
            className="w-full resize-y rounded-xl border bg-background/50 px-3 py-2 text-sm outline-none focus:border-primary/40"
          />
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="Tags (comma separated)"
            className="w-full rounded-xl border bg-background/50 px-3 py-1.5 text-xs outline-none focus:border-primary/40"
          />
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground">Importance:</span>
            {(["low", "medium", "high"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setImportance(v)}
                className={cn(
                  "rounded-md px-2 py-0.5 text-[10px] font-medium capitalize transition-colors",
                  importance === v
                    ? v === "high" ? "bg-red-500/15 text-red-400"
                      : v === "medium" ? "bg-amber-500/15 text-amber-400"
                      : "bg-slate-500/15 text-slate-400"
                    : "text-muted-foreground hover:bg-accent",
                )}
              >
                {v}
              </button>
            ))}
          </div>
          {body.trim() && (
            <p className="text-[10px] text-muted-foreground">
              Detected: <span className={cn("font-medium", smartTypeColors[detected].split(" ")[0])}>{smartTypeLabels[detected]}</span>
            </p>
          )}
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={!body.trim()}
              className="rounded-lg bg-primary/15 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/25 disabled:opacity-50"
            >
              {editId ? "Update" : "Save"}
            </button>
            <button
              onClick={handleCancel}
              className="rounded-lg px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Notes list */}
      {sorted.length === 0 && !composing && (
        <div className="rounded-2xl border border-dashed bg-card/40 p-6 text-center">
          <StickyNote className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">
            No notes yet. Start taking notes as you learn.
          </p>
        </div>
      )}

      {sorted.map((note) => (
        <div key={note.id} className="rounded-2xl border bg-card/60 p-3">
          <div className="mb-1.5 flex items-start justify-between gap-1">
            <div className="flex flex-wrap gap-1">
              <span className={cn("rounded-full border px-1.5 py-0.5 text-[9px] font-semibold", smartTypeColors[note.smartType])}>
                {smartTypeLabels[note.smartType]}
              </span>
              {note.pinned && (
                <span className="rounded-full bg-primary/15 px-1.5 py-0.5 text-[9px] font-semibold text-primary">
                  Pinned
                </span>
              )}
            </div>
            <div className="flex shrink-0 gap-0.5">
              <button onClick={() => onPin?.(note.id)} className="grid h-6 w-6 place-items-center rounded text-muted-foreground hover:text-foreground">
                {note.pinned ? <PinOff className="h-3 w-3" /> : <Pin className="h-3 w-3" />}
              </button>
              <button onClick={() => startEdit(note)} className="grid h-6 w-6 place-items-center rounded text-muted-foreground hover:text-foreground">
                <Pencil className="h-3 w-3" />
              </button>
              <button onClick={() => onDelete?.(note.id)} className="grid h-6 w-6 place-items-center rounded text-muted-foreground hover:text-destructive">
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          </div>
          <p className="text-sm leading-relaxed">{note.body}</p>
          {note.tags.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {note.tags.map((t) => (
                <span key={t} className="rounded-md bg-muted px-1.5 py-0.5 text-[10px]">{t}</span>
              ))}
            </div>
          )}
          <div className="mt-1.5 flex items-center gap-2 text-[10px] text-muted-foreground">
            <span className={importanceColors[note.importance]}>{note.importance}</span>
            <span>·</span>
            <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Session Countdown ───────────────────────────────────────────────

function SessionCountdown({ access }: { access: SessionAccess }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);

  if (!access.purchasedAt) {
    return (
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
        <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
          <Clock className="h-3.5 w-3.5" /> Session Access
        </div>
        <p className="text-sm font-medium text-foreground">
          {access.durationDays} days access
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {access.type === "purchase"
            ? `Purchase for $${access.price ?? 0} to start your ${access.durationDays}-day access`
            : `Free access · ${access.durationDays} days from activation`}
        </p>
      </div>
    );
  }

  const purchasedMs = new Date(access.purchasedAt).getTime();
  const expiresMs = purchasedMs + access.durationDays * 24 * 60 * 60 * 1000;
  const remainingMs = Math.max(0, expiresMs - now);

  const totalDays = Math.floor(remainingMs / (24 * 60 * 60 * 1000));
  const totalHours = Math.floor(
    (remainingMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000),
  );
  const totalMinutes = Math.floor(
    (remainingMs % (60 * 60 * 1000)) / (60 * 1000),
  );
  const expired = remainingMs <= 0;

  return (
    <div
      className={cn(
        "rounded-2xl border p-4",
        expired
          ? "border-red-500/30 bg-red-500/10"
          : totalDays < 1
            ? "border-amber-500/30 bg-amber-500/10"
            : "border-emerald-500/30 bg-emerald-500/10",
      )}
    >
      <div
        className={cn(
          "mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider",
          expired
            ? "text-red-400"
            : totalDays < 1
              ? "text-amber-400"
              : "text-emerald-400",
        )}
      >
        <Clock className="h-3.5 w-3.5" />
        {expired ? "Session Expired" : "Session Access"}
      </div>

      {expired ? (
        <p className="text-sm text-muted-foreground">
          Access has expired. Purchase again to continue.
        </p>
      ) : (
        <>
          <div className="flex items-baseline gap-3">
            <div className="text-center">
              <p className="text-2xl font-bold tabular-nums">{totalDays}</p>
              <p className="text-[10px] text-muted-foreground">days</p>
            </div>
            <span className="text-lg font-bold text-muted-foreground">:</span>
            <div className="text-center">
              <p className="text-2xl font-bold tabular-nums">{totalHours}</p>
              <p className="text-[10px] text-muted-foreground">hours</p>
            </div>
            <span className="text-lg font-bold text-muted-foreground">:</span>
            <div className="text-center">
              <p className="text-2xl font-bold tabular-nums">{totalMinutes}</p>
              <p className="text-[10px] text-muted-foreground">min</p>
            </div>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            {access.type === "free" ? "Free access" : "Purchased"} ·{" "}
            {access.durationDays} day plan
          </p>
        </>
      )}
    </div>
  );
}
