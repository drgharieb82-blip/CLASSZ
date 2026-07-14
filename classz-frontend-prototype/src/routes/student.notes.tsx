import { useState, useMemo, useCallback, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Bookmark,
  ChevronRight,
  Clock,
  Copy,
  Filter,
  Grid3X3,
  LayoutList,
  List,
  Pencil,
  Pin,
  PinOff,
  Search,
  StickyNote,
  Table,
  Trash2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DashPage } from "@/components/common/DashPage";
import { GradientButton } from "@/components/premium/GradientButton";
import { BrainGlow } from "@/components/illustrations/Characters";
import { ROLES } from "@/lib/roles";
import {
  initialNotes,
  smartTypeLabels,
  smartTypeColors,
  importanceColors,
  type SessionNote,
  type NoteSmartType,
  type NoteImportance,
} from "@/lib/notesMock";
import {
  createMyNote,
  deleteMyNote,
  listMyNotes,
  updateMyNote,
  type StudentNoteRead,
} from "@/lib/api/student-memory";

export const Route = createFileRoute("/student/notes")({
  component: MyNotesPage,
});

// ── Types ───────────────────────────────────────────────────────────

type ViewState =
  | { level: "subjects" }
  | { level: "sessions"; subject: string }
  | { level: "notes"; subject: string; session: string };

type ViewMode = "cards" | "compact" | "table";
type SortKey = "newest" | "oldest" | "importance" | "pinned" | "smart-type" | "item-order";
type GroupBy = "none" | "session-item" | "smart-type" | "importance";

// ── Component ───────────────────────────────────────────────────────

function MyNotesPage() {
  const [notes, setNotes] = useState<SessionNote[]>([]);
  const [view, setView] = useState<ViewState>({ level: "subjects" });
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("cards");
  const [sortBy, setSortBy] = useState<SortKey>("newest");
  const [groupBy, setGroupBy] = useState<GroupBy>("none");
  const [showFilters, setShowFilters] = useState(false);
  const [filterSmartType, setFilterSmartType] = useState<NoteSmartType | "all">("all");
  const [filterImportance, setFilterImportance] = useState<NoteImportance | "all">("all");
  const [filterPinned, setFilterPinned] = useState<"all" | "pinned" | "unpinned">("all");
  const [filterItemType, setFilterItemType] = useState<string>("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [editId, setEditId] = useState<string | null>(null);
  const [editBody, setEditBody] = useState("");
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeBody, setComposeBody] = useState("");
  const [composeTags, setComposeTags] = useState("");
  const [composeImportance, setComposeImportance] = useState<NoteImportance>("medium");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let active = true;
    async function loadNotes() {
      setLoading(true);
      setLoadError("");
      try {
        const items = await listMyNotes();
        if (!active) return;
        setNotes(items.map(mapApiNote));
      } catch {
        if (!active) return;
        setNotes([...initialNotes]);
        setLoadError("Using local sample notes until your saved notes are available.");
      } finally {
        if (active) setLoading(false);
      }
    }
    void loadNotes();
    return () => {
      active = false;
    };
  }, []);

  // ── Derived data ──

  const subjectSummaries = useMemo(() => {
    const map = new Map<string, SessionNote[]>();
    for (const n of notes) {
      const list = map.get(n.subjectName) ?? [];
      list.push(n);
      map.set(n.subjectName, list);
    }
    return [...map.entries()].map(([subject, list]) => ({
      subject,
      total: list.length,
      pinned: list.filter((n) => n.pinned).length,
      high: list.filter((n) => n.importance === "high").length,
      lastUpdated: list.reduce((a, n) => (n.updatedAt > a ? n.updatedAt : a), ""),
    }));
  }, [notes]);

  const sessionSummaries = useMemo(() => {
    if (view.level !== "sessions" && view.level !== "notes") return [];
    const subj = view.subject;
    const subjectNotes = notes.filter((n) => n.subjectName === subj);
    const map = new Map<string, SessionNote[]>();
    for (const n of subjectNotes) {
      const list = map.get(n.sessionTitle) ?? [];
      list.push(n);
      map.set(n.sessionTitle, list);
    }
    return [...map.entries()].map(([session, list]) => {
      const allTags = list.flatMap((n) => n.tags);
      const tagCounts = new Map<string, number>();
      for (const t of allTags) tagCounts.set(t, (tagCounts.get(t) ?? 0) + 1);
      const topTags = [...tagCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4).map(([t]) => t);
      return {
        session,
        total: list.length,
        pinned: list.filter((n) => n.pinned).length,
        high: list.filter((n) => n.importance === "high").length,
        lastUpdated: list.reduce((a, n) => (n.updatedAt > a ? n.updatedAt : a), ""),
        topTags,
      };
    });
  }, [notes, view]);

  const sessionNotes = useMemo(() => {
    if (view.level !== "notes") return [];
    let list = notes.filter((n) => n.subjectName === view.subject && n.sessionTitle === view.session);

    if (search.trim()) {
      const s = search.toLowerCase();
      list = list.filter((n) =>
        n.body.toLowerCase().includes(s) ||
        n.tags.some((t) => t.toLowerCase().includes(s)) ||
        n.sessionItemTitle.toLowerCase().includes(s) ||
        smartTypeLabels[n.smartType].toLowerCase().includes(s),
      );
    }
    if (filterSmartType !== "all") list = list.filter((n) => n.smartType === filterSmartType);
    if (filterImportance !== "all") list = list.filter((n) => n.importance === filterImportance);
    if (filterPinned === "pinned") list = list.filter((n) => n.pinned);
    if (filterPinned === "unpinned") list = list.filter((n) => !n.pinned);
    if (filterItemType !== "all") list = list.filter((n) => n.itemType === filterItemType);

    list.sort((a, b) => {
      if (sortBy === "newest") return b.updatedAt.localeCompare(a.updatedAt);
      if (sortBy === "oldest") return a.updatedAt.localeCompare(b.updatedAt);
      if (sortBy === "importance") {
        const ord: Record<string, number> = { high: 0, medium: 1, low: 2 };
        return (ord[a.importance] ?? 2) - (ord[b.importance] ?? 2);
      }
      if (sortBy === "pinned") return (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0);
      if (sortBy === "smart-type") return a.smartType.localeCompare(b.smartType);
      return a.sessionItemId.localeCompare(b.sessionItemId);
    });
    return list;
  }, [notes, view, search, filterSmartType, filterImportance, filterPinned, filterItemType, sortBy]);

  const groupedNotes = useMemo(() => {
    if (groupBy === "none") return [{ key: "", notes: sessionNotes }];
    const map = new Map<string, SessionNote[]>();
    for (const n of sessionNotes) {
      const key = groupBy === "session-item" ? n.sessionItemTitle
        : groupBy === "smart-type" ? smartTypeLabels[n.smartType]
        : n.importance;
      const list = map.get(key) ?? [];
      list.push(n);
      map.set(key, list);
    }
    return [...map.entries()].map(([key, notes]) => ({ key, notes }));
  }, [sessionNotes, groupBy]);

  // ── Actions ──

  const togglePin = useCallback((id: string) => {
    const current = notes.find((note) => note.id === id);
    if (!current) return;
    void updateMyNote(id, { pinned: !current.pinned }).then((updated) => {
      setNotes((p) => p.map((n) => (n.id === id ? mapApiNote(updated) : n)));
    });
  }, [notes]);

  const deleteNote = useCallback((id: string) => {
    void deleteMyNote(id).then(() => {
      setNotes((p) => p.filter((n) => n.id !== id));
      setSelectedIds((p) => { const s = new Set(p); s.delete(id); return s; });
    });
  }, []);

  const copyNote = useCallback((body: string) => {
    navigator.clipboard.writeText(body).catch(() => {});
  }, []);

  const startEdit = useCallback((note: SessionNote) => {
    setEditId(note.id);
    setEditBody(note.body);
  }, []);

  const saveEdit = useCallback(() => {
    if (!editId || !editBody.trim()) return;
    const current = notes.find((note) => note.id === editId);
    void updateMyNote(editId, {
      body: editBody.trim(),
      subject_name: current?.subjectName,
      course_name: current?.courseName,
      session_title: current?.sessionTitle,
      session_item_title: current?.sessionItemTitle,
      session_item_id: current?.sessionItemId,
      item_type: current?.itemType,
      tags: current?.tags,
      importance: current?.importance,
      smart_type: current?.smartType,
    }).then((updated) => {
      setNotes((p) => p.map((n) => (n.id === editId ? mapApiNote(updated) : n)));
      setEditId(null);
      setEditBody("");
    });
  }, [editId, editBody, notes]);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((p) => { const s = new Set(p); if (s.has(id)) s.delete(id); else s.add(id); return s; });
  }, []);

  const bulkPin = useCallback(() => {
    const ids = [...selectedIds];
    Promise.all(ids.map((id) => updateMyNote(id, { pinned: true }))).then((updated) => {
      const updatedById = new Map(updated.map((note) => [note.id, mapApiNote(note)]));
      setNotes((current) => current.map((note) => updatedById.get(note.id) ?? note));
      setSelectedIds(new Set());
    });
  }, [selectedIds]);

  const bulkDelete = useCallback(() => {
    const ids = [...selectedIds];
    Promise.all(ids.map((id) => deleteMyNote(id))).finally(() => {
      setNotes((p) => p.filter((n) => !selectedIds.has(n.id)));
      setSelectedIds(new Set());
    });
  }, [selectedIds]);

  const bulkCopy = useCallback(() => {
    const bodies = notes.filter((n) => selectedIds.has(n.id)).map((n) => n.body).join("\n\n");
    navigator.clipboard.writeText(bodies).catch(() => {});
    setSelectedIds(new Set());
  }, [notes, selectedIds]);

  const composeSubject = view.level === "notes" ? view.subject : "";
  const composeSession = view.level === "notes" ? view.session : "";

  const createNote = useCallback(() => {
    if (view.level !== "notes") return;
    if (!composeBody.trim()) return;
    const subjectName = composeSubject;
    const sessionTitle = composeSession;
    const courseName = notes.find((note) => note.subjectName === subjectName && note.sessionTitle === sessionTitle)?.courseName ?? subjectName;
    void createMyNote({
      body: composeBody.trim(),
      subject_name: subjectName,
      course_name: courseName,
      session_title: sessionTitle,
      session_item_title: "Manual Note",
      session_item_id: `manual-${Date.now().toString(36)}`,
      item_type: "notes",
      tags: composeTags.split(",").map((tag) => tag.trim()).filter(Boolean),
      importance: composeImportance,
      smart_type: detectSmartTypeLocal(composeBody),
    }).then((created) => {
      setNotes((current) => [mapApiNote(created), ...current]);
      setComposeBody("");
      setComposeTags("");
      setComposeImportance("medium");
      setComposeOpen(false);
    });
  }, [composeBody, composeImportance, composeTags, composeSession, composeSubject, notes, view.level]);

  // ── Subtitle ──
  const subtitle = view.level === "subjects"
    ? `${notes.length} notes across your sessions`
    : view.level === "sessions"
      ? `${view.subject} — ${notes.filter((n) => n.subjectName === view.subject).length} notes`
      : `${sessionNotes.length} notes`;

  return (
    <DashPage role="student" title="My Notes" subtitle={subtitle} icon={ROLES.student.icon}>
      <BrainGlow size="sm" className="mx-auto" />
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06, duration: 0.45 }} className="space-y-5">
        {loadError && (
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            {loadError}
          </div>
        )}
        {loading && notes.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-card/60 px-4 py-6 text-sm text-slate-400">
            Loading your saved notes…
          </div>
        ) : null}

        {/* ═══ BREADCRUMB ═══ */}
        {view.level !== "subjects" && (
          <nav className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
            <button onClick={() => setView({ level: "subjects" })} className="transition-colors hover:text-foreground">My Notes</button>
            <ChevronRight className="h-3 w-3" />
            {view.level === "sessions" && <span className="text-foreground">{view.subject}</span>}
            {view.level === "notes" && (
              <>
                <button onClick={() => setView({ level: "sessions", subject: view.subject })} className="transition-colors hover:text-foreground">{view.subject}</button>
                <ChevronRight className="h-3 w-3" />
                <span className="text-foreground">{view.session}</span>
              </>
            )}
          </nav>
        )}

        {/* ═══ GLOBAL SEARCH ═══ */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notes, tags, subjects, sessions..."
            className="h-10 w-full rounded-xl border bg-card/60 pl-10 pr-4 text-sm outline-none focus:border-primary/40"
          />
        </div>

        {view.level === "notes" && (
          <div className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,24,42,0.96),rgba(10,14,28,0.92))] p-4 shadow-[0_18px_50px_rgba(0,0,0,0.18)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-white">Add a note</p>
                <p className="text-xs text-slate-400">
                  Saved to your account and available on every device.
                </p>
              </div>
              <button
                onClick={() => setComposeOpen((current) => !current)}
                className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-slate-200 transition-colors hover:bg-white/[0.06]"
              >
                {composeOpen ? "Close" : "New note"}
              </button>
            </div>
            {composeOpen && (
              <div className="mt-4 space-y-3">
                <textarea
                  rows={4}
                  value={composeBody}
                  onChange={(event) => setComposeBody(event.target.value)}
                  placeholder="Write the note you want to keep..."
                  className="w-full rounded-2xl border bg-background/60 px-4 py-3 text-sm outline-none focus:border-primary/40"
                />
                <div className="grid gap-3 md:grid-cols-[1fr_200px]">
                  <input
                    value={composeTags}
                    onChange={(event) => setComposeTags(event.target.value)}
                    placeholder="Tags separated by commas"
                    className="h-10 rounded-xl border bg-background/60 px-3 text-sm outline-none focus:border-primary/40"
                  />
                  <select
                    value={composeImportance}
                    onChange={(event) => setComposeImportance(event.target.value as NoteImportance)}
                    className="h-10 rounded-xl border bg-background/60 px-3 text-sm outline-none focus:border-primary/40"
                  >
                    <option value="low">Low priority</option>
                    <option value="medium">Medium priority</option>
                    <option value="high">High priority</option>
                  </select>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-primary/15 px-2 py-1 text-[11px] font-medium text-primary">
                    {view.subject}
                  </span>
                  <span className="rounded-full bg-white/[0.04] px-2 py-1 text-[11px] font-medium text-slate-300">
                    {view.session}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={createNote}
                    disabled={!composeBody.trim()}
                    className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    Save note
                  </button>
                  <button
                    onClick={() => {
                      setComposeBody("");
                      setComposeTags("");
                      setComposeImportance("medium");
                      setComposeOpen(false);
                    }}
                    className="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══ LEVEL: SUBJECTS ═══ */}
        {view.level === "subjects" && (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {(search.trim()
              ? subjectSummaries.filter((s) => s.subject.toLowerCase().includes(search.toLowerCase()) || notes.some((n) => n.subjectName === s.subject && n.body.toLowerCase().includes(search.toLowerCase())))
              : subjectSummaries
            ).map((s) => (
              <div key={s.subject} className="overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,24,42,0.96),rgba(10,14,28,0.92))] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.26)] md:p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary/15 text-lg">
                    <StickyNote className="h-6 w-6 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg font-bold text-white">{s.subject}</h3>
                    <p className="text-sm text-slate-400">{s.total} notes</p>
                  </div>
                </div>
                <div className="mb-4 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-xl border border-white/8 bg-white/[0.03] py-2">
                    <p className="text-base font-bold text-white">{s.total}</p>
                    <p className="text-[10px] text-slate-500">Total</p>
                  </div>
                  <div className="rounded-xl border border-white/8 bg-white/[0.03] py-2">
                    <p className="text-base font-bold text-violet-400">{s.pinned}</p>
                    <p className="text-[10px] text-slate-500">Pinned</p>
                  </div>
                  <div className="rounded-xl border border-white/8 bg-white/[0.03] py-2">
                    <p className="text-base font-bold text-red-400">{s.high}</p>
                    <p className="text-[10px] text-slate-500">High</p>
                  </div>
                </div>
                <div className="mb-4 flex items-center gap-1.5 text-[10px] text-slate-500">
                  <Clock className="h-3 w-3" />
                  Last updated: {new Date(s.lastUpdated).toLocaleDateString()}
                </div>
                <GradientButton size="sm" className="w-full justify-center" onClick={() => setView({ level: "sessions", subject: s.subject })}>
                  Open Subject Notes
                </GradientButton>
              </div>
            ))}
          </div>
        )}

        {/* ═══ LEVEL: SESSIONS ═══ */}
        {view.level === "sessions" && (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {(search.trim()
              ? sessionSummaries.filter((s) => s.session.toLowerCase().includes(search.toLowerCase()) || notes.some((n) => n.subjectName === view.subject && n.sessionTitle === s.session && n.body.toLowerCase().includes(search.toLowerCase())))
              : sessionSummaries
            ).map((s) => (
              <div key={s.session} className="overflow-hidden rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,24,42,0.96),rgba(10,14,28,0.92))] p-5 shadow-lg">
                <h4 className="mb-1 text-base font-semibold text-white">{s.session}</h4>
                <p className="mb-3 text-xs text-slate-500">{s.total} notes · {s.pinned} pinned · {s.high} high</p>
                <div className="mb-3 flex items-center gap-1.5 text-[10px] text-slate-500">
                  <Clock className="h-3 w-3" />
                  {new Date(s.lastUpdated).toLocaleDateString()}
                </div>
                {s.topTags.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-1">
                    {s.topTags.map((t) => <span key={t} className="rounded-md bg-muted px-1.5 py-0.5 text-[10px]">{t}</span>)}
                  </div>
                )}
                <GradientButton size="sm" className="w-full justify-center" onClick={() => setView({ level: "notes", subject: view.subject, session: s.session })}>
                  Open Session Notes
                </GradientButton>
              </div>
            ))}
          </div>
        )}

        {/* ═══ LEVEL: NOTES ═══ */}
        {view.level === "notes" && (
          <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-2">
              {/* View mode */}
              <div className="flex rounded-lg border border-white/10 bg-white/[0.03]">
                {([["cards", Grid3X3], ["compact", List], ["table", Table]] as const).map(([mode, Icon]) => (
                  <button key={mode} onClick={() => setViewMode(mode)} className={cn("grid h-8 w-8 place-items-center transition-colors", viewMode === mode ? "bg-primary/15 text-primary" : "text-slate-500 hover:text-slate-300")}>
                    <Icon className="h-3.5 w-3.5" />
                  </button>
                ))}
              </div>

              <button onClick={() => setShowFilters(!showFilters)} className={cn("inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition-colors", showFilters ? "border-violet-500/40 bg-violet-500/15 text-violet-300" : "border-white/10 bg-white/[0.03] text-slate-400")}>
                <Filter className="h-3 w-3" /> Filters
              </button>

              <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortKey)} className="h-8 rounded-lg border border-white/10 bg-white/[0.05] px-2 text-xs text-slate-300 outline-none">
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="importance">Importance</option>
                <option value="pinned">Pinned First</option>
                <option value="smart-type">Smart Type</option>
                <option value="item-order">Item Order</option>
              </select>

              <select value={groupBy} onChange={(e) => setGroupBy(e.target.value as GroupBy)} className="h-8 rounded-lg border border-white/10 bg-white/[0.05] px-2 text-xs text-slate-300 outline-none">
                <option value="none">No Grouping</option>
                <option value="session-item">By Session Item</option>
                <option value="smart-type">By Smart Type</option>
                <option value="importance">By Importance</option>
              </select>

              {selectedIds.size > 0 && (
                <div className="ml-auto flex items-center gap-1.5">
                  <span className="text-xs text-slate-400">{selectedIds.size} selected</span>
                  <button onClick={bulkPin} className="h-7 rounded-lg bg-violet-500/15 px-2 text-[10px] font-medium text-violet-300">Pin</button>
                  <button onClick={bulkCopy} className="h-7 rounded-lg bg-cyan-500/15 px-2 text-[10px] font-medium text-cyan-300">Copy</button>
                  <button onClick={bulkDelete} className="h-7 rounded-lg bg-red-500/15 px-2 text-[10px] font-medium text-red-300">Delete</button>
                  <button onClick={() => setSelectedIds(new Set())} className="grid h-7 w-7 place-items-center rounded-lg text-slate-500 hover:text-slate-300"><X className="h-3 w-3" /></button>
                </div>
              )}
            </div>

            {/* Filters panel */}
            {showFilters && (
              <div className="flex flex-wrap gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <FSelect label="Smart Type" value={filterSmartType} onChange={(v) => setFilterSmartType(v as NoteSmartType | "all")} options={[{ value: "all", label: "All" }, ...Object.entries(smartTypeLabels).map(([v, l]) => ({ value: v, label: l }))]} />
                <FSelect label="Importance" value={filterImportance} onChange={(v) => setFilterImportance(v as NoteImportance | "all")} options={[{ value: "all", label: "All" }, { value: "high", label: "High" }, { value: "medium", label: "Medium" }, { value: "low", label: "Low" }]} />
                <FSelect label="Pinned" value={filterPinned} onChange={(v) => setFilterPinned(v as "all" | "pinned" | "unpinned")} options={[{ value: "all", label: "All" }, { value: "pinned", label: "Pinned" }, { value: "unpinned", label: "Unpinned" }]} />
                <FSelect label="Item Type" value={filterItemType} onChange={setFilterItemType} options={[{ value: "all", label: "All" }, { value: "video", label: "Video" }, { value: "quiz", label: "Quiz" }, { value: "homework", label: "Homework" }, { value: "attachment", label: "Attachment" }]} />
              </div>
            )}

            {/* Notes content */}
            {sessionNotes.length === 0 ? (
              <div className="rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,24,42,0.96),rgba(10,14,28,0.92))] p-8 text-center shadow-lg">
                <StickyNote className="mx-auto h-8 w-8 text-muted-foreground/40" />
                <p className="mt-2 text-sm text-muted-foreground">No notes match your filters.</p>
              </div>
            ) : (
              groupedNotes.map((group) => (
                <div key={group.key || "__all"} className="space-y-2">
                  {group.key && (
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">{group.key} ({group.notes.length})</h4>
                  )}

                  {/* ── TABLE VIEW ── */}
                  {viewMode === "table" ? (
                    <div className="overflow-x-auto rounded-xl border border-white/10">
                      <table className="w-full text-left text-sm">
                        <thead className="border-b border-white/10 bg-white/[0.03]">
                          <tr>
                            <th className="px-3 py-2 text-[10px] font-semibold text-slate-500 w-8"></th>
                            <th className="px-3 py-2 text-[10px] font-semibold text-slate-500">Note</th>
                            <th className="px-3 py-2 text-[10px] font-semibold text-slate-500">Type</th>
                            <th className="px-3 py-2 text-[10px] font-semibold text-slate-500">Imp.</th>
                            <th className="px-3 py-2 text-[10px] font-semibold text-slate-500">Item</th>
                            <th className="px-3 py-2 text-[10px] font-semibold text-slate-500">Date</th>
                            <th className="px-3 py-2 text-[10px] font-semibold text-slate-500 w-20"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {group.notes.map((note) => (
                            <tr key={note.id} className={cn("border-b border-white/5 transition-colors hover:bg-white/[0.02]", selectedIds.has(note.id) && "bg-primary/5")}>
                              <td className="px-3 py-2"><input type="checkbox" checked={selectedIds.has(note.id)} onChange={() => toggleSelect(note.id)} className="accent-primary" /></td>
                              <td className="max-w-xs truncate px-3 py-2 text-slate-200">
                                {note.pinned && <Pin className="mr-1 inline h-3 w-3 text-primary" />}
                                {note.body}
                              </td>
                              <td className="px-3 py-2"><span className={cn("rounded-full border px-1.5 py-0.5 text-[9px] font-semibold", smartTypeColors[note.smartType])}>{smartTypeLabels[note.smartType]}</span></td>
                              <td className={cn("px-3 py-2 text-xs font-medium capitalize", importanceColors[note.importance])}>{note.importance}</td>
                              <td className="px-3 py-2 text-xs text-slate-500">{note.sessionItemTitle}</td>
                              <td className="px-3 py-2 text-xs text-slate-500">{new Date(note.updatedAt).toLocaleDateString()}</td>
                              <td className="px-3 py-2">
                                <NoteActions note={note} onPin={togglePin} onEdit={startEdit} onCopy={copyNote} onDelete={deleteNote} />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : viewMode === "compact" ? (
                    /* ── COMPACT VIEW ── */
                    <div className="space-y-1">
                      {group.notes.map((note) => (
                        <div key={note.id} className={cn("flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2.5 transition-colors hover:bg-white/[0.04]", selectedIds.has(note.id) && "border-primary/30 bg-primary/5")}>
                          <input type="checkbox" checked={selectedIds.has(note.id)} onChange={() => toggleSelect(note.id)} className="accent-primary shrink-0" />
                          {note.pinned && <Pin className="h-3 w-3 shrink-0 text-primary" />}
                          <p className="min-w-0 flex-1 truncate text-sm text-slate-200">{note.body}</p>
                          <span className={cn("shrink-0 rounded-full border px-1.5 py-0.5 text-[9px] font-semibold", smartTypeColors[note.smartType])}>{smartTypeLabels[note.smartType]}</span>
                          <span className={cn("shrink-0 text-[10px] font-medium capitalize", importanceColors[note.importance])}>{note.importance}</span>
                          <NoteActions note={note} onPin={togglePin} onEdit={startEdit} onCopy={copyNote} onDelete={deleteNote} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    /* ── CARD VIEW ── */
                    <div className="grid gap-3 md:grid-cols-2">
                      {group.notes.map((note) => (
                        <div key={note.id} className={cn("overflow-hidden rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,24,42,0.96),rgba(10,14,28,0.92))] p-5 shadow-lg", selectedIds.has(note.id) && "ring-1 ring-primary/40")}>
                          <div className="mb-2 flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <input type="checkbox" checked={selectedIds.has(note.id)} onChange={() => toggleSelect(note.id)} className="accent-primary" />
                              <div className="flex flex-wrap gap-1">
                                <span className={cn("rounded-full border px-1.5 py-0.5 text-[9px] font-semibold", smartTypeColors[note.smartType])}>{smartTypeLabels[note.smartType]}</span>
                                {note.pinned && <span className="rounded-full bg-primary/15 px-1.5 py-0.5 text-[9px] font-semibold text-primary">Pinned</span>}
                                <span className={cn("rounded-full px-1.5 py-0.5 text-[9px] font-semibold capitalize", importanceColors[note.importance])}>{note.importance}</span>
                              </div>
                            </div>
                            <NoteActions note={note} onPin={togglePin} onEdit={startEdit} onCopy={copyNote} onDelete={deleteNote} />
                          </div>

                          {editId === note.id ? (
                            <div className="mb-2 space-y-2">
                              <textarea rows={3} value={editBody} onChange={(e) => setEditBody(e.target.value)} className="w-full resize-y rounded-xl border bg-background/50 px-3 py-2 text-sm outline-none focus:border-primary/40" />
                              <div className="flex gap-2">
                                <button onClick={saveEdit} className="rounded-lg bg-primary/15 px-3 py-1 text-xs font-medium text-primary">Save</button>
                                <button onClick={() => setEditId(null)} className="rounded-lg px-3 py-1 text-xs text-muted-foreground hover:bg-accent">Cancel</button>
                              </div>
                            </div>
                          ) : (
                            <p className="mb-2 text-sm leading-relaxed">{note.body}</p>
                          )}

                          {note.tags.length > 0 && (
                            <div className="mb-2 flex flex-wrap gap-1">
                              {note.tags.map((t) => <span key={t} className="rounded-md bg-muted px-1.5 py-0.5 text-[10px]">{t}</span>)}
                            </div>
                          )}

                          <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-muted-foreground">
                            <span>{note.sessionItemTitle}</span>
                            <span className="capitalize">{note.itemType}</span>
                            <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                          </div>

                          <Link to="/student/courses" className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-primary transition-colors hover:text-primary/80">
                            Go to session item <ArrowRight className="h-3 w-3" />
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </motion.div>
    </DashPage>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────

function mapApiNote(note: StudentNoteRead): SessionNote {
  return {
    id: note.id,
    body: note.body,
    subjectName: note.subject_name,
    courseName: note.course_name,
    sessionTitle: note.session_title,
    sessionItemTitle: note.session_item_title,
    sessionItemId: note.session_item_id,
    itemType: note.item_type,
    createdAt: note.created_at,
    updatedAt: note.updated_at,
    tags: note.tags,
    importance: note.importance,
    pinned: note.pinned,
    smartType: note.smart_type,
  };
}

function detectSmartTypeLocal(text: string): NoteSmartType {
  const body = text.toLowerCase();
  if (/\b(mol|ph|ksp|kc|kp|equilibrium|acid|base|ion)\b/.test(body) || /[a-z][⁺⁻]/.test(body)) return "chemistry-equation";
  if (/\b(newton|force|velocity|acceleration|energy|momentum|wave|volt|ohm|ampere)\b/.test(body)) return "physics-law";
  if (/(∫|∑|lim|d\/dx|derivative|integral|sin|cos|tan|log|ln|sqrt|slope|function)/.test(body)) return "math-formula";
  if (/\b(is defined as|means|refers to|is the|definition|is called)\b/.test(body)) return "definition";
  if (body.includes("?") || /^(why|how|what|when|where|does|can|is it|should)\b/.test(body)) return "question";
  return "general";
}

function NoteActions({ note, onPin, onEdit, onCopy, onDelete }: {
  note: SessionNote;
  onPin: (id: string) => void;
  onEdit: (note: SessionNote) => void;
  onCopy: (body: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="flex shrink-0 gap-0.5">
      <button onClick={() => onPin(note.id)} className="grid h-6 w-6 place-items-center rounded text-muted-foreground hover:text-foreground">
        {note.pinned ? <PinOff className="h-3 w-3" /> : <Pin className="h-3 w-3" />}
      </button>
      <button onClick={() => onEdit(note)} className="grid h-6 w-6 place-items-center rounded text-muted-foreground hover:text-foreground">
        <Pencil className="h-3 w-3" />
      </button>
      <button onClick={() => onCopy(note.body)} className="grid h-6 w-6 place-items-center rounded text-muted-foreground hover:text-foreground">
        <Copy className="h-3 w-3" />
      </button>
      <button onClick={() => onDelete(note.id)} className="grid h-6 w-6 place-items-center rounded text-muted-foreground hover:text-destructive">
        <Trash2 className="h-3 w-3" />
      </button>
    </div>
  );
}

function FSelect({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-slate-500">{label}:</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="h-7 rounded-lg border border-white/10 bg-white/[0.05] px-2 text-xs text-slate-300 outline-none focus:border-violet-500/40">
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}
