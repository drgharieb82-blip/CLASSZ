import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  Plus, Search, Video, FileText, HelpCircle, ClipboardList, Pencil,
  BookOpen, StickyNote, Paperclip, MessageSquare, GripVertical,
  Copy, Trash2, Eye, Clock, DollarSign, Users, TrendingUp,
  BarChart3, Save, Send, ChevronDown, Layers, Lock, Unlock,
  Play, CheckCircle2, AlertCircle, Settings2, Target, Brain,
  Star, Timer,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/teacher/sessions")({
  component: SessionBuilderPage,
});

/* ────────────────────────────────────────────────────────────
   TYPES
   ──────────────────────────────────────────────────────────── */

interface BuilderBlock {
  id: string;
  type: "video" | "pdf" | "question_practice" | "quiz" | "homework" | "exam" | "notes" | "attachments" | "discussion";
  title: string;
  duration: string;
  required: boolean;
}

interface SessionAnalytics {
  enrolled: number;
  completionRate: number;
  revenue: number;
  avgWatchTime: string;
}

interface BuilderSession {
  id: string;
  title: string;
  description: string;
  status: "draft" | "published";
  price: number;
  isFree: boolean;
  sessionType: string;
  blocks: BuilderBlock[];
  analytics: SessionAnalytics;
  concepts: string[];
  accessModel: string;
  createdAt: string;
}

/* ────────────────────────────────────────────────────────────
   BLOCK CONFIG
   ──────────────────────────────────────────────────────────── */

const BLOCK_TYPES: { type: BuilderBlock["type"]; label: string; icon: typeof Video; color: string; defaultDuration: string }[] = [
  { type: "video", label: "Video", icon: Video, color: "bg-blue-500/10 text-blue-600 border-blue-200", defaultDuration: "25 min" },
  { type: "pdf", label: "PDF", icon: FileText, color: "bg-rose-500/10 text-rose-600 border-rose-200", defaultDuration: "10 min" },
  { type: "question_practice", label: "Question Practice", icon: HelpCircle, color: "bg-amber-500/10 text-amber-600 border-amber-200", defaultDuration: "15 min" },
  { type: "quiz", label: "Quiz", icon: ClipboardList, color: "bg-cyan-500/10 text-cyan-600 border-cyan-200", defaultDuration: "20 min" },
  { type: "homework", label: "Homework", icon: Pencil, color: "bg-orange-500/10 text-orange-600 border-orange-200", defaultDuration: "30 min" },
  { type: "exam", label: "Exam", icon: BookOpen, color: "bg-red-500/10 text-red-600 border-red-200", defaultDuration: "60 min" },
  { type: "notes", label: "Notes", icon: StickyNote, color: "bg-violet-500/10 text-violet-600 border-violet-200", defaultDuration: "5 min" },
  { type: "attachments", label: "Attachments", icon: Paperclip, color: "bg-emerald-500/10 text-emerald-600 border-emerald-200", defaultDuration: "—" },
  { type: "discussion", label: "Discussion", icon: MessageSquare, color: "bg-teal-500/10 text-teal-600 border-teal-200", defaultDuration: "—" },
];

function getBlockConfig(type: BuilderBlock["type"]) {
  return BLOCK_TYPES.find((b) => b.type === type) || BLOCK_TYPES[0];
}

/* ────────────────────────────────────────────────────────────
   MOCK DATA — 5 sessions
   ──────────────────────────────────────────────────────────── */

let _bid = 0;
const bid = () => `blk-${++_bid}`;

const INITIAL_SESSIONS: BuilderSession[] = [
  {
    id: "ses-1", title: "Limits & Continuity", description: "Introduction to limits, one-sided limits, and continuity. The foundation of calculus.",
    status: "published", price: 20, isFree: false, sessionType: "lesson",
    accessModel: "paid_once", createdAt: "2026-06-10",
    concepts: ["Limits", "One-sided Limits", "Continuity", "Squeeze Theorem"],
    analytics: { enrolled: 842, completionRate: 87, revenue: 16840, avgWatchTime: "38 min" },
    blocks: [
      { id: bid(), type: "video", title: "Introduction to Limits", duration: "28 min", required: true },
      { id: bid(), type: "pdf", title: "Limits Formula Sheet", duration: "5 min", required: false },
      { id: bid(), type: "question_practice", title: "Limits Practice Set", duration: "15 min", required: true },
      { id: bid(), type: "quiz", title: "Limits Check", duration: "10 min", required: true },
      { id: bid(), type: "notes", title: "Key Takeaways", duration: "3 min", required: false },
    ],
  },
  {
    id: "ses-2", title: "Derivatives — Power Rule", description: "Master the power rule, product rule, and quotient rule for differentiation.",
    status: "published", price: 0, isFree: true, sessionType: "lesson",
    accessModel: "free", createdAt: "2026-06-12",
    concepts: ["Power Rule", "Product Rule", "Quotient Rule", "Derivative Notation"],
    analytics: { enrolled: 1240, completionRate: 92, revenue: 0, avgWatchTime: "42 min" },
    blocks: [
      { id: bid(), type: "video", title: "Power Rule Explained", duration: "32 min", required: true },
      { id: bid(), type: "video", title: "Product & Quotient Rule", duration: "24 min", required: true },
      { id: bid(), type: "pdf", title: "Derivatives Cheat Sheet", duration: "5 min", required: false },
      { id: bid(), type: "question_practice", title: "Differentiation Drills", duration: "20 min", required: true },
      { id: bid(), type: "homework", title: "Homework: Derivatives Set 1", duration: "45 min", required: true },
      { id: bid(), type: "discussion", title: "Ask Your Questions", duration: "—", required: false },
    ],
  },
  {
    id: "ses-3", title: "Integration Techniques", description: "Substitution, integration by parts, and partial fractions.",
    status: "draft", price: 25, isFree: false, sessionType: "lesson",
    accessModel: "paid_once", createdAt: "2026-06-18",
    concepts: ["Substitution", "Integration by Parts", "Partial Fractions", "Definite Integrals"],
    analytics: { enrolled: 0, completionRate: 0, revenue: 0, avgWatchTime: "—" },
    blocks: [
      { id: bid(), type: "video", title: "U-Substitution Method", duration: "26 min", required: true },
      { id: bid(), type: "video", title: "Integration by Parts", duration: "30 min", required: true },
      { id: bid(), type: "pdf", title: "Integration Formulas", duration: "5 min", required: false },
      { id: bid(), type: "question_practice", title: "Practice Problems", duration: "25 min", required: true },
      { id: bid(), type: "attachments", title: "Extra Worked Examples", duration: "—", required: false },
    ],
  },
  {
    id: "ses-4", title: "Trigonometry Review", description: "Complete trig functions review, identities, and graphs for exam prep.",
    status: "draft", price: 0, isFree: true, sessionType: "revision",
    accessModel: "free", createdAt: "2026-06-20",
    concepts: ["Trig Functions", "Trig Identities", "Unit Circle", "Inverse Trig"],
    analytics: { enrolled: 0, completionRate: 0, revenue: 0, avgWatchTime: "—" },
    blocks: [
      { id: bid(), type: "video", title: "Trig Functions Review", duration: "35 min", required: true },
      { id: bid(), type: "pdf", title: "Unit Circle Reference", duration: "3 min", required: false },
      { id: bid(), type: "quiz", title: "Trig Identities Quiz", duration: "15 min", required: true },
      { id: bid(), type: "notes", title: "Study Notes", duration: "5 min", required: false },
    ],
  },
  {
    id: "ses-5", title: "Calculus Final Exam Prep", description: "Comprehensive exam preparation covering all calculus topics with timed practice.",
    status: "published", price: 35, isFree: false, sessionType: "exam_session",
    accessModel: "paid_once", createdAt: "2026-06-08",
    concepts: ["Limits", "Derivatives", "Integrals", "Applications", "Series"],
    analytics: { enrolled: 654, completionRate: 78, revenue: 22890, avgWatchTime: "56 min" },
    blocks: [
      { id: bid(), type: "video", title: "Exam Strategy & Tips", duration: "18 min", required: true },
      { id: bid(), type: "pdf", title: "Formula Sheet (All Topics)", duration: "10 min", required: true },
      { id: bid(), type: "question_practice", title: "Quick-Fire Practice", duration: "20 min", required: true },
      { id: bid(), type: "exam", title: "Mock Final Exam", duration: "90 min", required: true },
      { id: bid(), type: "homework", title: "Post-Exam Review", duration: "30 min", required: false },
      { id: bid(), type: "discussion", title: "Exam Discussion", duration: "—", required: false },
      { id: bid(), type: "notes", title: "Common Mistakes to Avoid", duration: "5 min", required: false },
    ],
  },
];

/* ────────────────────────────────────────────────────────────
   MAIN COMPONENT
   ──────────────────────────────────────────────────────────── */

function SessionBuilderPage() {
  const [sessions, setSessions] = useState<BuilderSession[]>(INITIAL_SESSIONS);
  const [selectedId, setSelectedId] = useState<string>(INITIAL_SESSIONS[0].id);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | "draft" | "published">("");
  const [addBlockOpen, setAddBlockOpen] = useState(false);

  const selected = sessions.find((s) => s.id === selectedId) || sessions[0];

  const filtered = useMemo(() => {
    let list = sessions;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((s) => s.title.toLowerCase().includes(q));
    }
    if (statusFilter) list = list.filter((s) => s.status === statusFilter);
    return list;
  }, [sessions, search, statusFilter]);

  const updateSelected = (patch: Partial<BuilderSession>) => {
    setSessions((prev) => prev.map((s) => s.id === selectedId ? { ...s, ...patch } : s));
  };

  const createSession = () => {
    const newId = `ses-${Date.now()}`;
    const newSession: BuilderSession = {
      id: newId, title: `New Session ${sessions.length + 1}`, description: "",
      status: "draft", price: 0, isFree: true, sessionType: "lesson",
      accessModel: "free", createdAt: new Date().toISOString().split("T")[0],
      concepts: [], blocks: [],
      analytics: { enrolled: 0, completionRate: 0, revenue: 0, avgWatchTime: "—" },
    };
    setSessions((prev) => [newSession, ...prev]);
    setSelectedId(newId);
  };

  const addBlock = (type: BuilderBlock["type"]) => {
    const cfg = getBlockConfig(type);
    const newBlock: BuilderBlock = {
      id: `blk-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      type, title: cfg.label, duration: cfg.defaultDuration, required: false,
    };
    updateSelected({ blocks: [...selected.blocks, newBlock] });
    setAddBlockOpen(false);
  };

  const updateBlock = (blockId: string, patch: Partial<BuilderBlock>) => {
    updateSelected({ blocks: selected.blocks.map((b) => b.id === blockId ? { ...b, ...patch } : b) });
  };

  const duplicateBlock = (blockId: string) => {
    const block = selected.blocks.find((b) => b.id === blockId);
    if (!block) return;
    const idx = selected.blocks.findIndex((b) => b.id === blockId);
    const dup = { ...block, id: `blk-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`, title: `${block.title} (Copy)` };
    const newBlocks = [...selected.blocks];
    newBlocks.splice(idx + 1, 0, dup);
    updateSelected({ blocks: newBlocks });
  };

  const deleteBlock = (blockId: string) => {
    updateSelected({ blocks: selected.blocks.filter((b) => b.id !== blockId) });
  };

  const togglePublish = () => {
    updateSelected({ status: selected.status === "published" ? "draft" : "published" });
  };

  return (
    <DashboardLayout role="teacher">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl gradient-brand text-white shadow-lg glow">
            <Layers className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Session Builder</h1>
            <p className="text-xs text-muted-foreground">Build premium learning experiences</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="rounded-xl">
            <Save className="me-1.5 h-3.5 w-3.5" /> Save
          </Button>
          <Button size="sm" className={cn("rounded-xl border-0 text-white", selected.status === "published" ? "bg-amber-600 hover:bg-amber-700" : "gradient-brand")}
            onClick={togglePublish}>
            {selected.status === "published" ? <><Pencil className="me-1.5 h-3.5 w-3.5" /> Revert to Draft</> : <><Send className="me-1.5 h-3.5 w-3.5" /> Publish</>}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-[260px_1fr_280px] gap-4 min-h-[calc(100vh-10rem)]">
        {/* ── LEFT PANEL ── */}
        <div className="space-y-3 overflow-y-auto">
          <Button className="w-full rounded-xl gradient-brand border-0 text-white" size="sm" onClick={createSession}>
            <Plus className="me-1.5 h-4 w-4" /> Create Premium Session
          </Button>

          <div className="relative">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search sessions…" className="h-8 rounded-xl ps-8 text-xs" />
          </div>

          <div className="flex gap-1">
            {(["", "draft", "published"] as const).map((f) => (
              <button key={f} onClick={() => setStatusFilter(f)}
                className={cn("flex-1 rounded-lg py-1 text-[11px] font-medium transition-colors",
                  statusFilter === f ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent"
                )}>
                {f === "" ? "All" : f === "draft" ? "Draft" : "Published"}
              </button>
            ))}
          </div>

          <div className="space-y-1.5">
            {filtered.map((s) => (
              <button key={s.id} onClick={() => setSelectedId(s.id)}
                className={cn(
                  "w-full rounded-xl border p-3 text-start transition-all",
                  s.id === selectedId ? "border-primary/40 bg-primary/5 shadow-sm" : "border-transparent bg-card hover:bg-accent/50"
                )}>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold truncate pe-2">{s.title}</p>
                  <Badge variant="outline" className={cn("rounded-full text-[9px] px-1.5 py-0 shrink-0",
                    s.status === "published" ? "border-emerald-200 text-emerald-600 bg-emerald-500/10" : "border-amber-200 text-amber-600 bg-amber-500/10"
                  )}>{s.status}</Badge>
                </div>
                <div className="mt-1.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Layers className="h-3 w-3" /> {s.blocks.length} blocks
                  </span>
                  <Badge className={cn("rounded-full border-0 text-[9px] px-1.5 py-0",
                    s.isFree ? "bg-emerald-500/10 text-emerald-600" : "bg-violet-500/10 text-violet-600"
                  )}>{s.isFree ? "Free" : `$${s.price}`}</Badge>
                </div>
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="text-center text-xs text-muted-foreground py-8">No sessions match</p>
            )}
          </div>
        </div>

        {/* ── CENTER PANEL ── */}
        <Card className="border bg-card overflow-hidden flex flex-col">
          <div className="border-b bg-muted/20 px-5 py-3">
            <Input value={selected.title} onChange={(e) => updateSelected({ title: e.target.value })}
              className="border-0 bg-transparent text-lg font-bold p-0 h-auto focus-visible:ring-0 shadow-none" />
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className={cn("rounded-full text-[10px]",
                selected.status === "published" ? "border-emerald-200 text-emerald-600" : "border-amber-200 text-amber-600"
              )}>{selected.status}</Badge>
              <span className="text-[11px] text-muted-foreground">{selected.blocks.length} blocks · {selected.sessionType}</span>
              {selected.analytics.enrolled > 0 && (
                <span className="text-[11px] text-muted-foreground">· {selected.analytics.enrolled} students</span>
              )}
            </div>
          </div>

          <Tabs defaultValue="blocks" className="flex-1 flex flex-col">
            <TabsList className="w-full justify-start rounded-none border-b bg-transparent px-4 h-10">
              {[
                { value: "overview", label: "Overview", icon: Eye },
                { value: "blocks", label: "Blocks", icon: Layers },
                { value: "access", label: "Access", icon: Lock },
                { value: "concepts", label: "Concepts", icon: Brain },
                { value: "assessment", label: "Assessment", icon: ClipboardList },
                { value: "analytics", label: "Analytics", icon: BarChart3 },
              ].map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value}
                  className="rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary text-xs gap-1.5 px-3">
                  <tab.icon className="h-3.5 w-3.5" /> {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="flex-1 overflow-y-auto p-5">
              {/* OVERVIEW TAB */}
              <TabsContent value="overview" className="mt-0 space-y-4">
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Session Title</Label>
                    <Input value={selected.title} onChange={(e) => updateSelected({ title: e.target.value })} className="rounded-xl" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Description</Label>
                    <Textarea value={selected.description} onChange={(e) => updateSelected({ description: e.target.value })}
                      className="rounded-xl min-h-[80px]" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Session Type</Label>
                      <Select value={selected.sessionType} onValueChange={(v) => updateSelected({ sessionType: v })}>
                        <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {["lesson", "revision", "practice", "quiz_session", "exam_session", "mixed", "live"].map((t) => (
                            <SelectItem key={t} value={t} className="capitalize">{t.replace("_", " ")}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Created</Label>
                      <Input value={selected.createdAt} readOnly className="rounded-xl bg-muted/50" />
                    </div>
                  </div>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Total Blocks", value: selected.blocks.length, icon: Layers, cls: "text-blue-500" },
                    { label: "Required Blocks", value: selected.blocks.filter((b) => b.required).length, icon: CheckCircle2, cls: "text-emerald-500" },
                    { label: "Videos", value: selected.blocks.filter((b) => b.type === "video").length, icon: Video, cls: "text-violet-500" },
                    { label: "Assessments", value: selected.blocks.filter((b) => ["quiz", "exam", "homework"].includes(b.type)).length, icon: ClipboardList, cls: "text-amber-500" },
                  ].map((s) => (
                    <div key={s.label} className="flex items-center gap-3 rounded-xl border p-3">
                      <s.icon className={cn("h-4 w-4", s.cls)} />
                      <div>
                        <p className="text-lg font-bold">{s.value}</p>
                        <p className="text-[11px] text-muted-foreground">{s.label}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* BLOCKS TAB */}
              <TabsContent value="blocks" className="mt-0 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">{selected.blocks.length} Blocks</p>
                  <div className="relative">
                    <Button size="sm" className="rounded-xl gradient-brand border-0 text-white" onClick={() => setAddBlockOpen(!addBlockOpen)}>
                      <Plus className="me-1.5 h-3.5 w-3.5" /> Add Block <ChevronDown className={cn("ms-1 h-3.5 w-3.5 transition-transform", addBlockOpen && "rotate-180")} />
                    </Button>
                    <AnimatePresence>
                      {addBlockOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                          className="absolute end-0 top-full z-20 mt-1.5 w-56 rounded-xl border bg-card p-2 shadow-xl">
                          {BLOCK_TYPES.map((bt) => (
                            <button key={bt.type} onClick={() => addBlock(bt.type)}
                              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent">
                              <bt.icon className={cn("h-4 w-4", bt.color.split(" ")[1])} />
                              {bt.label}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {selected.blocks.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed p-12 text-center">
                    <Layers className="h-10 w-10 text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground">No blocks yet. Click "Add Block" to start building.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selected.blocks.map((block, idx) => {
                      const cfg = getBlockConfig(block.type);
                      const Icon = cfg.icon;
                      return (
                        <Card key={block.id} className={cn("flex items-center gap-3 border p-3 transition-shadow hover:shadow-sm", cfg.color.split(" ")[2] ? `border-l-4 ${cfg.color.split(" ")[2]}` : "")}>
                          <GripVertical className="h-4 w-4 text-muted-foreground/40 shrink-0 cursor-grab" />
                          <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-lg", cfg.color.split(" ").slice(0, 2).join(" "))}>
                            <Icon className="h-4 w-4" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <Input value={block.title} onChange={(e) => updateBlock(block.id, { title: e.target.value })}
                              className="border-0 bg-transparent p-0 h-auto text-sm font-medium focus-visible:ring-0 shadow-none" />
                            <div className="flex items-center gap-2 mt-0.5">
                              <Badge className={cn("rounded-full border-0 text-[9px] px-1.5 py-0", cfg.color.split(" ").slice(0, 2).join(" "))}>{cfg.label}</Badge>
                              {block.duration !== "—" && (
                                <span className="text-[11px] text-muted-foreground flex items-center gap-0.5">
                                  <Timer className="h-3 w-3" /> {block.duration}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <div className="flex items-center gap-1.5 me-2">
                              <span className="text-[10px] text-muted-foreground">Required</span>
                              <Switch checked={block.required} onCheckedChange={(v) => updateBlock(block.id, { required: v })} className="scale-75" />
                            </div>
                            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={() => duplicateBlock(block.id)} title="Duplicate">
                              <Copy className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-rose-500 hover:text-rose-600" onClick={() => deleteBlock(block.id)} title="Delete">
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </TabsContent>

              {/* ACCESS TAB */}
              <TabsContent value="access" className="mt-0 space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-xl border p-4">
                    <div className="flex items-center gap-3">
                      {selected.isFree ? <Unlock className="h-5 w-5 text-emerald-500" /> : <Lock className="h-5 w-5 text-violet-500" />}
                      <div>
                        <p className="text-sm font-semibold">{selected.isFree ? "Free Access" : "Paid Session"}</p>
                        <p className="text-xs text-muted-foreground">{selected.isFree ? "Anyone can access this session" : `Price: $${selected.price}`}</p>
                      </div>
                    </div>
                    <Switch checked={!selected.isFree} onCheckedChange={(v) => updateSelected({ isFree: !v, price: v ? 20 : 0 })} />
                  </div>
                  {!selected.isFree && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Price (USD)</Label>
                        <Input type="number" value={selected.price} onChange={(e) => updateSelected({ price: Number(e.target.value) })} className="rounded-xl" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Access Model</Label>
                        <Select value={selected.accessModel} onValueChange={(v) => updateSelected({ accessModel: v })}>
                          <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="paid_once">Pay Once</SelectItem>
                            <SelectItem value="included_in_course">Included in Course</SelectItem>
                            <SelectItem value="subscription">Subscription</SelectItem>
                            <SelectItem value="wallet_only">Wallet Only</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                  <Separator />
                  <div className="space-y-3">
                    <p className="text-sm font-semibold">Access Rules</p>
                    {[
                      { label: "Allow wallet payment", enabled: true },
                      { label: "Available to scholarship students", enabled: true },
                      { label: "Lock after 30 days", enabled: false },
                      { label: "Require previous session completion", enabled: false },
                    ].map((rule) => (
                      <div key={rule.label} className="flex items-center justify-between rounded-xl border px-4 py-3">
                        <span className="text-sm">{rule.label}</span>
                        <Switch defaultChecked={rule.enabled} />
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* CONCEPTS TAB */}
              <TabsContent value="concepts" className="mt-0 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">Learning Concepts</p>
                  <Button variant="outline" size="sm" className="rounded-xl" onClick={() => {
                    const name = `Concept ${selected.concepts.length + 1}`;
                    updateSelected({ concepts: [...selected.concepts, name] });
                  }}>
                    <Plus className="me-1.5 h-3.5 w-3.5" /> Add Concept
                  </Button>
                </div>
                {selected.concepts.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed p-12 text-center">
                    <Brain className="h-10 w-10 text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground">No concepts linked to this session yet.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selected.concepts.map((concept, i) => (
                      <div key={i} className="flex items-center justify-between rounded-xl border px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className="grid h-8 w-8 place-items-center rounded-lg bg-violet-500/10">
                            <Target className="h-4 w-4 text-violet-500" />
                          </span>
                          <span className="text-sm font-medium">{concept}</span>
                        </div>
                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-rose-500"
                          onClick={() => updateSelected({ concepts: selected.concepts.filter((_, j) => j !== i) })}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* ASSESSMENT TAB */}
              <TabsContent value="assessment" className="mt-0 space-y-4">
                <p className="text-sm font-semibold">Linked Assessments</p>
                {(() => {
                  const assessBlocks = selected.blocks.filter((b) => ["quiz", "exam", "homework", "question_practice"].includes(b.type));
                  if (assessBlocks.length === 0) return (
                    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed p-12 text-center">
                      <ClipboardList className="h-10 w-10 text-muted-foreground/40" />
                      <p className="text-sm text-muted-foreground">No assessment blocks in this session. Add a Quiz, Exam, or Homework block first.</p>
                    </div>
                  );
                  return (
                    <div className="space-y-3">
                      {assessBlocks.map((block) => {
                        const cfg = getBlockConfig(block.type);
                        const Icon = cfg.icon;
                        return (
                          <Card key={block.id} className="flex items-center gap-4 border p-4">
                            <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl", cfg.color.split(" ").slice(0, 2).join(" "))}>
                              <Icon className="h-5 w-5" />
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold">{block.title}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge className={cn("rounded-full border-0 text-[10px]", cfg.color.split(" ").slice(0, 2).join(" "))}>{cfg.label}</Badge>
                                <span className="text-[11px] text-muted-foreground">{block.duration}</span>
                                {block.required && <Badge variant="outline" className="rounded-full text-[10px] border-emerald-200 text-emerald-600">Required</Badge>}
                              </div>
                            </div>
                            <Button variant="outline" size="sm" className="rounded-xl shrink-0">
                              <Settings2 className="me-1.5 h-3.5 w-3.5" /> Configure
                            </Button>
                          </Card>
                        );
                      })}
                    </div>
                  );
                })()}
                <Separator />
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Pass Score", value: "70%", icon: Star, cls: "text-amber-500 bg-amber-500/10" },
                    { label: "Max Attempts", value: "3", icon: AlertCircle, cls: "text-blue-500 bg-blue-500/10" },
                    { label: "Time Limit", value: "Auto", icon: Timer, cls: "text-violet-500 bg-violet-500/10" },
                  ].map((s) => (
                    <div key={s.label} className="rounded-xl border p-3 text-center">
                      <s.icon className={cn("h-5 w-5 mx-auto mb-1", s.cls.split(" ")[0])} />
                      <p className="text-lg font-bold">{s.value}</p>
                      <p className="text-[11px] text-muted-foreground">{s.label}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* ANALYTICS TAB */}
              <TabsContent value="analytics" className="mt-0 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Students Enrolled", value: selected.analytics.enrolled.toLocaleString(), icon: Users, cls: "text-blue-500", bg: "bg-blue-500/10" },
                    { label: "Completion Rate", value: `${selected.analytics.completionRate}%`, icon: CheckCircle2, cls: "text-emerald-500", bg: "bg-emerald-500/10" },
                    { label: "Revenue", value: `$${selected.analytics.revenue.toLocaleString()}`, icon: DollarSign, cls: "text-violet-500", bg: "bg-violet-500/10" },
                    { label: "Avg Watch Time", value: selected.analytics.avgWatchTime, icon: Clock, cls: "text-amber-500", bg: "bg-amber-500/10" },
                  ].map((s) => (
                    <Card key={s.label} className="flex items-center gap-3 border bg-card p-4">
                      <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl", s.bg)}>
                        <s.icon className={cn("h-5 w-5", s.cls)} />
                      </span>
                      <div>
                        <p className="text-xl font-bold">{s.value}</p>
                        <p className="text-[11px] text-muted-foreground">{s.label}</p>
                      </div>
                    </Card>
                  ))}
                </div>
                {selected.analytics.enrolled > 0 ? (
                  <>
                    <Card className="border bg-card p-4 space-y-3">
                      <p className="text-sm font-semibold">Completion Funnel</p>
                      {[
                        { label: "Started", pct: 100, color: "bg-blue-500" },
                        { label: "Watched Videos", pct: 94, color: "bg-violet-500" },
                        { label: "Completed Practice", pct: 82, color: "bg-amber-500" },
                        { label: "Passed Assessment", pct: selected.analytics.completionRate, color: "bg-emerald-500" },
                      ].map((step) => (
                        <div key={step.label} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">{step.label}</span>
                            <span className="font-medium">{step.pct}%</span>
                          </div>
                          <div className="h-2 rounded-full bg-muted overflow-hidden">
                            <div className={cn("h-full rounded-full transition-all", step.color)} style={{ width: `${step.pct}%` }} />
                          </div>
                        </div>
                      ))}
                    </Card>
                    <Card className="border bg-card p-4 space-y-3">
                      <p className="text-sm font-semibold">Block Engagement</p>
                      {selected.blocks.slice(0, 5).map((block) => {
                        const cfg = getBlockConfig(block.type);
                        const engagement = Math.max(40, Math.floor(Math.random() * 60) + 40);
                        return (
                          <div key={block.id} className="flex items-center gap-3">
                            <span className={cn("grid h-7 w-7 shrink-0 place-items-center rounded-md", cfg.color.split(" ").slice(0, 2).join(" "))}>
                              <cfg.icon className="h-3.5 w-3.5" />
                            </span>
                            <span className="text-xs flex-1 truncate">{block.title}</span>
                            <Progress value={engagement} className="h-1.5 w-20" />
                            <span className="text-[11px] text-muted-foreground w-8 text-end">{engagement}%</span>
                          </div>
                        );
                      })}
                    </Card>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed p-12 text-center">
                    <BarChart3 className="h-10 w-10 text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground">Analytics will appear once the session is published and students enroll.</p>
                  </div>
                )}
              </TabsContent>
            </div>
          </Tabs>
        </Card>

        {/* ── RIGHT PANEL — Student Preview ── */}
        <div className="space-y-3">
          <Card className="border bg-card overflow-hidden">
            <div className="relative h-32 bg-gradient-to-br from-primary/20 via-violet-500/10 to-blue-500/20 flex items-center justify-center">
              <Play className="h-10 w-10 text-primary/60" />
              <Badge className="absolute top-2 end-2 rounded-full gradient-brand border-0 text-white text-[10px]">
                {selected.isFree ? "Free" : `$${selected.price}`}
              </Badge>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <p className="text-sm font-bold leading-tight">{selected.title}</p>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{selected.description || "No description"}</p>
              </div>
              <Separator />
              <div className="space-y-1.5">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Session Content</p>
                {selected.blocks.map((block) => {
                  const cfg = getBlockConfig(block.type);
                  const Icon = cfg.icon;
                  return (
                    <div key={block.id} className="flex items-center gap-2 py-1">
                      <Icon className={cn("h-3.5 w-3.5 shrink-0", cfg.color.split(" ")[1])} />
                      <span className="text-xs truncate flex-1">{block.title}</span>
                      {block.required && <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />}
                    </div>
                  );
                })}
                {selected.blocks.length === 0 && (
                  <p className="text-xs text-muted-foreground italic">No content yet</p>
                )}
              </div>
            </div>
          </Card>

          <Card className="border bg-card p-4 space-y-3">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Session Stats</p>
            <div className="space-y-2">
              {[
                { icon: Layers, label: "Blocks", value: String(selected.blocks.length) },
                { icon: CheckCircle2, label: "Required", value: String(selected.blocks.filter((b) => b.required).length) },
                { icon: Video, label: "Videos", value: String(selected.blocks.filter((b) => b.type === "video").length) },
                { icon: Users, label: "Enrolled", value: selected.analytics.enrolled.toLocaleString() },
                { icon: TrendingUp, label: "Completion", value: `${selected.analytics.completionRate}%` },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-xs text-muted-foreground">
                    <s.icon className="h-3.5 w-3.5" /> {s.label}
                  </span>
                  <span className="text-xs font-semibold">{s.value}</span>
                </div>
              ))}
            </div>
          </Card>

          {selected.concepts.length > 0 && (
            <Card className="border bg-card p-4 space-y-2">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Concepts</p>
              <div className="flex flex-wrap gap-1">
                {selected.concepts.map((c, i) => (
                  <Badge key={i} variant="outline" className="rounded-full text-[10px]">{c}</Badge>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
