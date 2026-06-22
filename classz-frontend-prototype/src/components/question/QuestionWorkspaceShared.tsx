import {
  BookOpen, Brain, Check, Code, FileText, FlipVertical, GripVertical,
  HelpCircle, Image, Layers, List, Mic, Pencil, Plus, Shuffle,
  Sparkles, StickyNote, Table, Target, Upload, Video, X, Zap,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { QuestionType, QuestionDifficulty, AnswerData, MCQChoice, QuestionAcademicLink } from "@/lib/teacher/teacher-question-store";

export interface TypeInfo { value: QuestionType; label: string; icon: typeof HelpCircle; group: string; }

export const TYPE_CATALOG: TypeInfo[] = [
  { value: "mcq", label: "Multiple Choice", icon: List, group: "Basic" },
  { value: "multi_select", label: "Multi Select", icon: Check, group: "Basic" },
  { value: "true_false", label: "True / False", icon: FlipVertical, group: "Basic" },
  { value: "short_answer", label: "Short Answer", icon: Pencil, group: "Basic" },
  { value: "essay", label: "Essay", icon: FileText, group: "Basic" },
  { value: "calculation", label: "Calculation", icon: Zap, group: "Basic" },
  { value: "fill_blank", label: "Fill Blank", icon: StickyNote, group: "Structured" },
  { value: "matching", label: "Matching", icon: Shuffle, group: "Structured" },
  { value: "ordering", label: "Ordering", icon: List, group: "Structured" },
  { value: "table_completion", label: "Table", icon: Table, group: "Structured" },
  { value: "matrix", label: "Matrix", icon: GripVertical, group: "Structured" },
  { value: "classification", label: "Classification", icon: Layers, group: "Structured" },
  { value: "passage", label: "Passage", icon: BookOpen, group: "Reading" },
  { value: "case_study", label: "Case Study", icon: BookOpen, group: "Reading" },
  { value: "group_question", label: "Group Question", icon: Layers, group: "Reading" },
  { value: "drag_drop", label: "Drag & Drop", icon: GripVertical, group: "Interactive" },
  { value: "hotspot", label: "Hotspot", icon: Target, group: "Interactive" },
  { value: "image_labeling", label: "Image Labeling", icon: Image, group: "Interactive" },
  { value: "graph_plot", label: "Graph Plot", icon: Sparkles, group: "Interactive" },
  { value: "equation_builder", label: "Equation Builder", icon: Brain, group: "Interactive" },
  { value: "chemical_structure", label: "Chemical Structure", icon: Sparkles, group: "Interactive" },
  { value: "file_upload", label: "File Upload", icon: Upload, group: "Submission" },
  { value: "oral_answer", label: "Oral Answer", icon: Mic, group: "Submission" },
  { value: "video_answer", label: "Video Answer", icon: Video, group: "Submission" },
  { value: "coding", label: "Coding", icon: Code, group: "Technical" },
  { value: "flashcard", label: "Flashcard", icon: FlipVertical, group: "Learning" },
  { value: "adaptive", label: "Adaptive", icon: Sparkles, group: "Learning" },
];

export const POPULAR_TYPES: QuestionType[] = ["mcq", "multi_select", "true_false", "short_answer", "essay", "calculation"];
export const DIFFICULTIES: QuestionDifficulty[] = ["easy", "medium", "hard", "advanced"];
export const DIFF_COLORS: Record<string, string> = { easy: "text-emerald-600", medium: "text-amber-600", hard: "text-rose-600", advanced: "text-violet-600" };
export const SECTIONS = ["type", "question", "answer", "solution", "academic", "metadata", "preview"] as const;
export const SECTION_LABELS: Record<string, string> = { type: "Question Type", question: "Question", answer: "Answer Builder", solution: "Solution", academic: "Academic Mapping", metadata: "Metadata", preview: "Preview" };

export function uid() { return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`; }

/* ═══════════════════ Answer Builder ═══════════════════ */

export function AnswerBuilder({ type, answerData, setAnswerData, choices, setChoices }: {
  type: QuestionType; answerData: AnswerData | undefined;
  setAnswerData: (d: AnswerData | undefined) => void;
  choices: MCQChoice[]; setChoices: (c: MCQChoice[]) => void;
}) {
  const patch = (p: Record<string, unknown>) => { if (answerData) setAnswerData({ ...answerData, ...p } as any); };

  if (type === "mcq" || type === "multi_select") {
    const isMulti = type === "multi_select";
    return (<div className="space-y-3"><Label className="text-xs">{isMulti ? "Choices (select all correct)" : "Choices (select one correct)"}</Label>
      {choices.map((c, i) => (<div key={c.id} className="flex items-center gap-2">
        <button onClick={() => { if (isMulti) setChoices(choices.map((x) => x.id === c.id ? { ...x, isCorrect: !x.isCorrect } : x)); else setChoices(choices.map((x) => ({ ...x, isCorrect: x.id === c.id }))); }} className={cn("h-5 w-5 shrink-0 rounded-full border-2 flex items-center justify-center transition-colors", c.isCorrect ? "border-emerald-500 bg-emerald-500" : "border-muted-foreground/30")}>{c.isCorrect && <Check className="h-3 w-3 text-white" />}</button>
        <Input value={c.text} onChange={(e) => setChoices(choices.map((x) => x.id === c.id ? { ...x, text: e.target.value } : x))} placeholder={`Choice ${i + 1}`} className="rounded-lg flex-1 text-sm" />
        {choices.length > 2 && <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => setChoices(choices.filter((x) => x.id !== c.id))}><X className="h-3.5 w-3.5" /></Button>}
      </div>))}
      <Button variant="outline" size="sm" className="rounded-lg text-xs" onClick={() => setChoices([...choices, { id: `c${Date.now()}`, text: "", isCorrect: false }])}><Plus className="me-1 h-3 w-3" />Add Choice</Button></div>);
  }
  if (type === "true_false" && answerData?.kind === "true_false") {
    return (<div className="space-y-2"><Label className="text-xs">Correct Answer</Label><div className="flex gap-3">{[true, false].map((v) => (<button key={String(v)} onClick={() => patch({ correctBoolean: v })} className={cn("flex-1 rounded-xl border-2 py-3 text-sm font-medium transition-colors", answerData.correctBoolean === v ? "border-primary bg-primary/5 text-primary" : "hover:bg-accent")}>{v ? "True" : "False"}</button>))}</div></div>);
  }
  if (type === "short_answer" && answerData?.kind === "short_answer") {
    return (<div className="space-y-3"><Label className="text-xs">Accepted Answers</Label>
      {(answerData.acceptedAnswers || []).map((a, i) => (<div key={i} className="flex gap-1.5"><Input value={a} onChange={(e) => { const arr = [...answerData.acceptedAnswers]; arr[i] = e.target.value; patch({ acceptedAnswers: arr }); }} className="rounded-lg flex-1 text-sm" placeholder={`Answer ${i + 1}`} /><Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => patch({ acceptedAnswers: answerData.acceptedAnswers.filter((_: string, j: number) => j !== i) })}><X className="h-3.5 w-3.5" /></Button></div>))}
      <Button variant="outline" size="sm" className="rounded-lg text-xs" onClick={() => patch({ acceptedAnswers: [...answerData.acceptedAnswers, ""] })}><Plus className="me-1 h-3 w-3" />Add Answer</Button>
      <div className="flex gap-4"><label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={answerData.caseSensitive || false} onChange={(e) => patch({ caseSensitive: e.target.checked })} className="rounded" />Case Sensitive</label><label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={answerData.trimWhitespace !== false} onChange={(e) => patch({ trimWhitespace: e.target.checked })} className="rounded" />Trim Whitespace</label></div></div>);
  }
  if (type === "essay" && answerData?.kind === "essay") {
    return (<div className="space-y-3">
      <div className="space-y-1.5"><Label className="text-xs">Model Answer</Label><textarea value={answerData.modelAnswer || ""} onChange={(e) => patch({ modelAnswer: e.target.value })} rows={4} className="w-full rounded-xl border bg-card px-3 py-2 text-sm resize-y" placeholder="Expected answer..." /></div>
      <div className="grid gap-3 sm:grid-cols-2"><div className="space-y-1.5"><Label className="text-xs">Max Words</Label><Input value={answerData.maxWords || ""} onChange={(e) => patch({ maxWords: Number(e.target.value) || undefined })} type="number" className="rounded-xl" placeholder="500" /></div><div className="flex items-end pb-1"><label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={answerData.manualReviewRequired || false} onChange={(e) => patch({ manualReviewRequired: e.target.checked })} className="rounded" />Manual Review</label></div></div>
      <div className="space-y-1.5"><Label className="text-xs">Keywords</Label><Input value={(answerData.keywords || []).join(", ")} onChange={(e) => patch({ keywords: e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean) })} className="rounded-xl" placeholder="key1, key2, key3" /></div>
      <div className="space-y-1.5"><Label className="text-xs">Rubric</Label><textarea value={answerData.rubric || ""} onChange={(e) => patch({ rubric: e.target.value })} rows={2} className="w-full rounded-xl border bg-card px-3 py-2 text-sm resize-none" placeholder="Grading criteria..." /></div></div>);
  }
  if (type === "calculation" && answerData?.kind === "calculation") {
    return (<div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-3"><div className="space-y-1.5"><Label className="text-xs">Correct Answer *</Label><Input value={answerData.correctAnswer} onChange={(e) => patch({ correctAnswer: e.target.value })} className="rounded-xl" placeholder="42" /></div><div className="space-y-1.5"><Label className="text-xs">Unit</Label><Input value={answerData.unit || ""} onChange={(e) => patch({ unit: e.target.value })} className="rounded-xl" placeholder="m/s" /></div><div className="space-y-1.5"><Label className="text-xs">Tolerance</Label><Input value={answerData.tolerance || ""} onChange={(e) => patch({ tolerance: Number(e.target.value) || undefined })} type="number" className="rounded-xl" placeholder="0.01" /></div></div>
      <div className="space-y-1.5"><Label className="text-xs">Formula Used</Label><Input value={answerData.formulaUsed || ""} onChange={(e) => patch({ formulaUsed: e.target.value })} className="rounded-xl" placeholder="F = ma" /></div>
      <div className="space-y-1.5"><Label className="text-xs">Solution Steps</Label>
        {(answerData.solutionSteps || []).map((s, i) => (<div key={i} className="flex gap-1.5"><span className="text-xs text-muted-foreground mt-2 w-5 shrink-0">{i + 1}.</span><Input value={s} onChange={(e) => { const arr = [...(answerData.solutionSteps || [])]; arr[i] = e.target.value; patch({ solutionSteps: arr }); }} className="rounded-lg flex-1 text-sm" /><Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => patch({ solutionSteps: (answerData.solutionSteps || []).filter((_: string, j: number) => j !== i) })}><X className="h-3.5 w-3.5" /></Button></div>))}
        <Button variant="outline" size="sm" className="rounded-lg text-xs" onClick={() => patch({ solutionSteps: [...(answerData.solutionSteps || []), ""] })}><Plus className="me-1 h-3 w-3" />Add Step</Button></div></div>);
  }
  if (type === "flashcard" && answerData?.kind === "flashcard") {
    return (<div className="space-y-3">
      <div className="space-y-1.5"><Label className="text-xs">Front</Label><textarea value={answerData.front} onChange={(e) => patch({ front: e.target.value })} rows={3} className="w-full rounded-xl border bg-card px-3 py-2 text-sm resize-none" placeholder="What students see first..." /></div>
      <div className="space-y-1.5"><Label className="text-xs">Back</Label><textarea value={answerData.back} onChange={(e) => patch({ back: e.target.value })} rows={3} className="w-full rounded-xl border bg-card px-3 py-2 text-sm resize-none" placeholder="The answer..." /></div>
      <div className="space-y-1.5"><Label className="text-xs">Hint</Label><Input value={answerData.hint || ""} onChange={(e) => patch({ hint: e.target.value })} className="rounded-xl" placeholder="Optional hint" /></div></div>);
  }
  if (type === "coding" && answerData?.kind === "coding") {
    return (<div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2"><div className="space-y-1.5"><Label className="text-xs">Language</Label><Input value={answerData.language} onChange={(e) => patch({ language: e.target.value })} className="rounded-xl" placeholder="python" /></div><div className="space-y-1.5"><Label className="text-xs">Time Limit (s)</Label><Input value={answerData.timeLimitSeconds || ""} onChange={(e) => patch({ timeLimitSeconds: Number(e.target.value) || undefined })} type="number" className="rounded-xl" /></div></div>
      <div className="space-y-1.5"><Label className="text-xs">Starter Code</Label><textarea value={answerData.starterCode || ""} onChange={(e) => patch({ starterCode: e.target.value })} rows={4} className="w-full rounded-xl border bg-slate-900 text-emerald-400 px-3 py-2 text-xs font-mono resize-y" /></div>
      <div className="space-y-2"><Label className="text-xs">Test Cases</Label>
        {(answerData.testCases || []).map((tc, i) => (<div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2"><Input value={tc.input} onChange={(e) => { const c = [...answerData.testCases]; c[i] = { ...tc, input: e.target.value }; patch({ testCases: c }); }} className="rounded-lg text-xs font-mono" placeholder="Input" /><Input value={tc.expectedOutput} onChange={(e) => { const c = [...answerData.testCases]; c[i] = { ...tc, expectedOutput: e.target.value }; patch({ testCases: c }); }} className="rounded-lg text-xs font-mono" placeholder="Output" /><Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => patch({ testCases: answerData.testCases.filter((_: any, j: number) => j !== i) })}><X className="h-3.5 w-3.5" /></Button></div>))}
        <Button variant="outline" size="sm" className="rounded-lg text-xs" onClick={() => patch({ testCases: [...answerData.testCases, { input: "", expectedOutput: "" }] })}><Plus className="me-1 h-3 w-3" />Add Test Case</Button></div></div>);
  }

  // Placeholder for remaining types
  const info = TYPE_CATALOG.find((t) => t.value === type);
  const InfoIcon = info?.icon || HelpCircle;
  return (<div className="rounded-xl border-2 border-dashed p-6 text-center space-y-2"><InfoIcon className="h-8 w-8 text-muted-foreground mx-auto" /><p className="text-sm font-medium">{info?.label || type} Builder</p><p className="text-xs text-muted-foreground max-w-md mx-auto">Full editor for this type coming soon.</p><Badge variant="outline" className="rounded-full text-[10px]">Placeholder</Badge></div>);
}

/* ═══════════════════ Academic Links Editor ═══════════════════ */

export function AcademicLinksEditor({ links, setLinks, treeNodes, treeChapters }: {
  links: QuestionAcademicLink[]; setLinks: (l: QuestionAcademicLink[]) => void;
  treeNodes: { id: string; type: string; title: string; parentId: string }[];
  treeChapters: { id: string; title: string }[];
}) {
  const getLessons = (chId: string) => treeNodes.filter((n) => n.type === "lesson" && n.parentId === chId);
  const getConcepts = (lId: string) => treeNodes.filter((n) => n.type === "concept" && n.parentId === lId);
  const getAtomics = (cId: string) => treeNodes.filter((n) => n.type === "atomic_concept" && n.parentId === cId);
  const update = (id: string, p: Partial<QuestionAcademicLink>) => setLinks(links.map((l) => l.id === id ? { ...l, ...p } : l));
  const remove = (id: string) => setLinks(links.filter((l) => l.id !== id));

  return (
    <div className="space-y-2">
      {links.length === 0 ? (
        <button onClick={() => setLinks([{ id: uid() }])} className="w-full rounded-xl border-2 border-dashed p-4 text-center text-xs text-muted-foreground hover:border-primary/30 hover:bg-primary/5 transition-colors">No academic links. Click to add one.</button>
      ) : links.map((link, idx) => {
        const lessons = link.chapterId ? getLessons(link.chapterId) : [];
        const concepts = link.lessonId ? getConcepts(link.lessonId) : [];
        const atomics = link.conceptId ? getAtomics(link.conceptId) : [];
        return (<div key={link.id} className="rounded-xl border bg-muted/30 p-3 space-y-2">
          <div className="flex items-center justify-between"><span className="text-[11px] font-medium text-muted-foreground">Link {idx + 1}</span><button onClick={() => remove(link.id)} className="text-muted-foreground hover:text-destructive"><X className="h-3.5 w-3.5" /></button></div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <select value={link.chapterId || ""} onChange={(e) => update(link.id, { chapterId: e.target.value || undefined, lessonId: undefined, conceptId: undefined, atomicConceptId: undefined })} className="h-8 rounded-lg border bg-background px-2 text-xs"><option value="">Chapter...</option>{treeChapters.map((n) => <option key={n.id} value={n.id}>{n.title}</option>)}</select>
            <select value={link.lessonId || ""} onChange={(e) => update(link.id, { lessonId: e.target.value || undefined, conceptId: undefined, atomicConceptId: undefined })} disabled={!link.chapterId} className="h-8 rounded-lg border bg-background px-2 text-xs disabled:opacity-50"><option value="">Lesson...</option>{lessons.map((n) => <option key={n.id} value={n.id}>{n.title}</option>)}</select>
            <select value={link.conceptId || ""} onChange={(e) => update(link.id, { conceptId: e.target.value || undefined, atomicConceptId: undefined })} disabled={!link.lessonId} className="h-8 rounded-lg border bg-background px-2 text-xs disabled:opacity-50"><option value="">Concept...</option>{concepts.map((n) => <option key={n.id} value={n.id}>{n.title}</option>)}</select>
            <select value={link.atomicConceptId || ""} onChange={(e) => update(link.id, { atomicConceptId: e.target.value || undefined })} disabled={!link.conceptId} className="h-8 rounded-lg border bg-background px-2 text-xs disabled:opacity-50"><option value="">Atomic...</option>{atomics.map((n) => <option key={n.id} value={n.id}>{n.title}</option>)}</select>
          </div>
        </div>);
      })}
      <Button variant="outline" size="sm" className="rounded-lg text-xs h-7 gap-1" onClick={() => setLinks([...links, { id: uid() }])}><Plus className="h-3 w-3" />Add Academic Link</Button>
    </div>
  );
}
