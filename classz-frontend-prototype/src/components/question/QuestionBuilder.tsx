import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ChevronDown, Image, Plus, Save, Search, Send, Upload, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  AnswerBuilder, AcademicLinksEditor, TYPE_CATALOG, POPULAR_TYPES, DIFFICULTIES,
  DIFF_COLORS, SECTIONS, SECTION_LABELS, type TypeInfo,
} from "@/components/question/QuestionWorkspaceShared";
import {
  useTeacherQuestionStore, createDefaultAnswerData,
  type QuestionType, type QuestionDifficulty, type AnswerData, type MCQChoice, type QuestionAcademicLink,
} from "@/lib/teacher/teacher-question-store";
import { useTeacherCourseStore } from "@/lib/teacher/teacher-course-store";
import { useTeacherChapterStore } from "@/lib/teacher/teacher-chapter-store";
import { useTeacherLessonStore } from "@/lib/teacher/teacher-lesson-store";
import { useTeacherConceptStore } from "@/lib/teacher/teacher-concept-store";
import { useTeacherAtomicConceptStore } from "@/lib/teacher/teacher-atomic-concept-store";

/**
 * The single reusable Question Builder. Used both by the standalone
 * /teacher/questions/create and /teacher/questions/$questionId/edit routes,
 * and embedded directly inside Content Studio's Question Bank tab - same
 * component, same state logic, either way. It never navigates itself; the
 * caller decides what "done" means via onExit (navigate away for standalone
 * pages, or switch back to the list view for an embedded caller).
 */
export interface QuestionBuilderProps {
  mode: "create" | "edit";
  questionId?: string;
  defaultCourseId?: string;
  onExit: () => void;
}

export function QuestionBuilder({ mode, questionId, defaultCourseId, onExit }: QuestionBuilderProps) {
  const createQuestion = useTeacherQuestionStore((s) => s.createQuestion);
  const updateQuestion = useTeacherQuestionStore((s) => s.updateQuestion);
  const question = useTeacherQuestionStore((s) => (questionId ? s.questions.find((q) => q.id === questionId) : undefined));
  const courses = useTeacherCourseStore((s) => s.courses);
  const allChapters = useTeacherChapterStore((s) => s.chapters);
  const loadChapters = useTeacherChapterStore((s) => s.loadChapters);
  const allLessons = useTeacherLessonStore((s) => s.lessons);
  const loadLessons = useTeacherLessonStore((s) => s.loadLessons);
  const allConcepts = useTeacherConceptStore((s) => s.concepts);
  const loadConcepts = useTeacherConceptStore((s) => s.loadConcepts);
  const allAtomicConcepts = useTeacherAtomicConceptStore((s) => s.atomicConcepts);
  const loadAtomicConcepts = useTeacherAtomicConceptStore((s) => s.loadAtomicConcepts);

  const [type, setType] = useState<QuestionType>(question?.type || "mcq");
  const [showAllTypes, setShowAllTypes] = useState(false);
  const [typeSearch, setTypeSearch] = useState("");
  const [section, setSection] = useState<typeof SECTIONS[number]>(mode === "edit" ? "question" : "type");
  const [title, setTitle] = useState(question?.title || "");
  const [text, setText] = useState(question?.text || "");
  const [instructions, setInstructions] = useState(question?.instructions || "");
  const [answerData, setAnswerData] = useState<AnswerData | undefined>(question?.answerData || createDefaultAnswerData(question?.type || "mcq"));
  const [choices, setChoices] = useState<MCQChoice[]>(question?.choices || [
    { id: "c1", text: "", isCorrect: true }, { id: "c2", text: "", isCorrect: false },
    { id: "c3", text: "", isCorrect: false }, { id: "c4", text: "", isCorrect: false },
  ]);
  const [hint, setHint] = useState(question?.hint || "");
  const [explanation, setExplanation] = useState(question?.explanation || "");
  const [solution, setSolution] = useState(question?.solution || "");
  const [commonMistakes, setCommonMistakes] = useState<string[]>(question?.commonMistakes || []);
  const [teacherNotes, setTeacherNotes] = useState(question?.teacherNotes || "");
  const [courseId, setCourseId] = useState(question?.courseId || defaultCourseId || "");
  const [acLinks, setAcLinks] = useState<QuestionAcademicLink[]>(question?.academicLinks || []);
  const [difficulty, setDifficulty] = useState<QuestionDifficulty>(question?.difficulty || "medium");
  const [estimatedTime, setEstimatedTime] = useState(question?.estimatedTimeSeconds ? String(Math.round(question.estimatedTimeSeconds / 60)) : "");
  const [source, setSource] = useState(question?.sourceType || question?.source || "");
  const [sourceLabel, setSourceLabel] = useState(question?.sourceLabel || "");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(question?.tags || []);
  const [points, setPoints] = useState(String(question?.points ?? 1));
  const [negativeMarks, setNegativeMarks] = useState(String(question?.negativeMarks ?? 0));
  const [partialCredit, setPartialCredit] = useState(question?.partialCreditAllowed ?? false);

  const chapters = useMemo(() => courseId ? allChapters.filter((c) => c.courseId === courseId) : [], [allChapters, courseId]);
  const lessons = useMemo(() => allLessons.filter((l) => chapters.some((c) => c.id === l.chapterId)), [allLessons, chapters]);
  const concepts = useMemo(() => allConcepts.filter((c) => lessons.some((l) => l.id === c.lessonId)), [allConcepts, lessons]);
  const atomicConcepts = useMemo(() => allAtomicConcepts.filter((a) => concepts.some((c) => c.id === a.conceptId)), [allAtomicConcepts, concepts]);

  useEffect(() => { if (courseId) loadChapters(courseId); }, [courseId]);
  useEffect(() => { for (const c of chapters) loadLessons(c.id); }, [chapters.map((c) => c.id).join(",")]);
  useEffect(() => { for (const l of lessons) loadConcepts(l.id); }, [lessons.map((l) => l.id).join(",")]);
  useEffect(() => { for (const c of concepts) loadAtomicConcepts(c.id); }, [concepts.map((c) => c.id).join(",")]);

  const treeChapters = useMemo(() => chapters.map((c) => ({ id: c.id, title: c.title })), [chapters]);
  const treeNodes = useMemo(() => [
    ...chapters.map((c) => ({ id: c.id, type: "chapter", title: c.title, parentId: "" })),
    ...lessons.map((l) => ({ id: l.id, type: "lesson", title: l.title, parentId: l.chapterId })),
    ...concepts.map((c) => ({ id: c.id, type: "concept", title: c.title, parentId: c.lessonId })),
    ...atomicConcepts.map((a) => ({ id: a.id, type: "atomic_concept", title: a.title, parentId: a.conceptId })),
  ], [chapters, lessons, concepts, atomicConcepts]);
  const currentTypeInfo = TYPE_CATALOG.find((t) => t.value === type) || TYPE_CATALOG[0];
  const filteredTypes = useMemo(() => { if (!typeSearch) return TYPE_CATALOG; const q = typeSearch.toLowerCase(); return TYPE_CATALOG.filter((t) => t.label.toLowerCase().includes(q) || t.group.toLowerCase().includes(q)); }, [typeSearch]);
  const typeGroups = useMemo(() => { const g = new Map<string, TypeInfo[]>(); for (const t of filteredTypes) { const a = g.get(t.group) || []; a.push(t); g.set(t.group, a); } return g; }, [filteredTypes]);

  const switchType = (newType: QuestionType) => { setType(newType); setAnswerData(createDefaultAnswerData(newType)); if (newType === "mcq" || newType === "multi_select") setChoices([{ id: "c1", text: "", isCorrect: newType === "mcq" }, { id: "c2", text: "", isCorrect: false }, { id: "c3", text: "", isCorrect: false }, { id: "c4", text: "", isCorrect: false }]); };
  const addTag = () => { if (tagInput.trim() && !tags.includes(tagInput.trim())) { setTags([...tags, tagInput.trim()]); setTagInput(""); } };

  if (mode === "edit" && !question) {
    return (
      <div className="flex flex-col items-center gap-4 p-16 text-center">
        <h2 className="text-lg font-semibold">Question not found</h2>
        <Button variant="outline" className="rounded-xl" onClick={onExit}>Back to Question Bank</Button>
      </div>
    );
  }

  const handleSave = (publish: boolean) => {
    if (!text.trim()) return;
    const payload = {
      type, text: text.trim(), title: title.trim() || undefined, body: text.trim(), instructions: instructions.trim() || undefined,
      courseId: courseId || undefined, difficulty, estimatedTimeSeconds: estimatedTime ? Number(estimatedTime) * 60 : undefined,
      source: sourceLabel || source, sourceLabel: sourceLabel || undefined, sourceType: source || undefined,
      tags, explanation: explanation.trim(), hint: hint.trim() || undefined, solution: solution.trim() || undefined,
      commonMistakes: commonMistakes.filter(Boolean), points: Number(points) || 1, negativeMarks: Number(negativeMarks) || 0,
      partialCreditAllowed: partialCredit, academicLinks: acLinks.filter((l) => l.chapterId || l.conceptId), answerData,
      choices: type === "mcq" || type === "multi_select" ? choices : undefined,
      modelAnswer: type === "essay" && answerData?.kind === "essay" ? answerData.modelAnswer : undefined,
      maxWords: type === "essay" && answerData?.kind === "essay" ? answerData.maxWords : undefined,
      correctAnswer: type === "calculation" && answerData?.kind === "calculation" ? answerData.correctAnswer : undefined,
      unit: type === "calculation" && answerData?.kind === "calculation" ? answerData.unit : undefined,
      tolerance: type === "calculation" && answerData?.kind === "calculation" ? answerData.tolerance : undefined,
    };
    if (mode === "create") {
      createQuestion({ ...payload, status: publish ? "published" : "draft" });
    } else {
      updateQuestion(questionId!, {
        ...payload,
        courseId: courseId || "", instructions: instructions.trim() || "", hint: hint.trim() || "", solution: solution.trim() || "",
        estimatedTimeSeconds: estimatedTime ? Number(estimatedTime) * 60 : 0, sourceLabel: sourceLabel || "", sourceType: source || "",
        status: publish ? "published" : question!.status === "published" ? "published" : "draft",
      });
    }
    onExit();
  };

  return (
    <QuestionWorkspaceUI
      mode={mode}
      pageTitle={mode === "create" ? "Create Question" : "Edit Question"}
      type={type} setType={switchType} showAllTypes={showAllTypes} setShowAllTypes={setShowAllTypes}
      typeSearch={typeSearch} setTypeSearch={setTypeSearch} section={section} setSection={setSection}
      title={title} setTitle={setTitle} text={text} setText={setText} instructions={instructions} setInstructions={setInstructions}
      answerData={answerData} setAnswerData={setAnswerData} choices={choices} setChoices={setChoices}
      hint={hint} setHint={setHint} explanation={explanation} setExplanation={setExplanation} solution={solution} setSolution={setSolution}
      commonMistakes={commonMistakes} setCommonMistakes={setCommonMistakes} teacherNotes={teacherNotes} setTeacherNotes={setTeacherNotes}
      courseId={courseId} setCourseId={setCourseId} acLinks={acLinks} setAcLinks={setAcLinks}
      difficulty={difficulty} setDifficulty={setDifficulty} estimatedTime={estimatedTime} setEstimatedTime={setEstimatedTime}
      source={source} setSource={setSource} sourceLabel={sourceLabel} setSourceLabel={setSourceLabel}
      tagInput={tagInput} setTagInput={setTagInput} tags={tags} setTags={setTags}
      points={points} setPoints={setPoints} negativeMarks={negativeMarks} setNegativeMarks={setNegativeMarks} partialCredit={partialCredit} setPartialCredit={setPartialCredit}
      courses={courses} treeNodes={treeNodes} treeChapters={treeChapters}
      currentTypeInfo={currentTypeInfo} filteredTypes={filteredTypes} typeGroups={typeGroups}
      addTag={addTag} handleSave={handleSave}
      questionStatus={question?.status || "draft"} publicCode={question?.publicCode || ""}
      onExit={onExit}
    />
  );
}

/* ═══════════════════ Shared workspace UI (presentational only - no routing) ═══════════════════ */

export function QuestionWorkspaceUI(props: {
  mode: "create" | "edit"; pageTitle: string;
  type: QuestionType; setType: (t: QuestionType) => void;
  showAllTypes: boolean; setShowAllTypes: (v: boolean) => void;
  typeSearch: string; setTypeSearch: (v: string) => void;
  section: typeof SECTIONS[number]; setSection: (s: typeof SECTIONS[number]) => void;
  title: string; setTitle: (v: string) => void;
  text: string; setText: (v: string) => void;
  instructions: string; setInstructions: (v: string) => void;
  answerData: AnswerData | undefined; setAnswerData: (d: AnswerData | undefined) => void;
  choices: MCQChoice[]; setChoices: (c: MCQChoice[]) => void;
  hint: string; setHint: (v: string) => void;
  explanation: string; setExplanation: (v: string) => void;
  solution: string; setSolution: (v: string) => void;
  commonMistakes: string[]; setCommonMistakes: (v: string[]) => void;
  teacherNotes: string; setTeacherNotes: (v: string) => void;
  courseId: string; setCourseId: (v: string) => void;
  acLinks: QuestionAcademicLink[]; setAcLinks: (v: QuestionAcademicLink[]) => void;
  difficulty: QuestionDifficulty; setDifficulty: (v: QuestionDifficulty) => void;
  estimatedTime: string; setEstimatedTime: (v: string) => void;
  source: string; setSource: (v: string) => void;
  sourceLabel: string; setSourceLabel: (v: string) => void;
  tagInput: string; setTagInput: (v: string) => void;
  tags: string[]; setTags: (v: string[]) => void;
  points: string; setPoints: (v: string) => void;
  negativeMarks: string; setNegativeMarks: (v: string) => void;
  partialCredit: boolean; setPartialCredit: (v: boolean) => void;
  courses: { id: string; title: string }[];
  treeNodes: { id: string; type: string; title: string; parentId: string }[];
  treeChapters: { id: string; title: string }[];
  currentTypeInfo: TypeInfo;
  filteredTypes: TypeInfo[];
  typeGroups: Map<string, TypeInfo[]>;
  addTag: () => void;
  handleSave: (publish: boolean) => void;
  questionStatus: string;
  publicCode: string;
  onExit: () => void;
}) {
  const { mode, pageTitle, type, setType, showAllTypes, setShowAllTypes, typeSearch, setTypeSearch, section, setSection, title, setTitle, text, setText, instructions, setInstructions, answerData, setAnswerData, choices, setChoices, hint, setHint, explanation, setExplanation, solution, setSolution, commonMistakes, setCommonMistakes, teacherNotes, setTeacherNotes, courseId, setCourseId, acLinks, setAcLinks, difficulty, setDifficulty, estimatedTime, setEstimatedTime, source, setSource, sourceLabel, setSourceLabel, tagInput, setTagInput, tags, setTags, points, setPoints, negativeMarks, setNegativeMarks, partialCredit, setPartialCredit, courses, treeNodes, treeChapters, currentTypeInfo, filteredTypes, typeGroups, addTag, handleSave, questionStatus, publicCode, onExit } = props;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={onExit} className="text-muted-foreground hover:text-foreground transition-colors"><ArrowLeft className="h-4 w-4" /></button>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-semibold">{pageTitle}</h1>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <Badge className={cn("rounded-full text-[10px] border-0 px-1.5 py-0 bg-primary/10 text-primary")}>{currentTypeInfo.label}</Badge>
            <span className={cn("font-medium", DIFF_COLORS[difficulty])}>{difficulty}</span>
            {publicCode && <span className="font-mono">{publicCode}</span>}
            {acLinks.length > 0 && <span>{acLinks.length} links</span>}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" className="rounded-xl text-xs h-8 gap-1.5" onClick={() => handleSave(false)}><Save className="h-3.5 w-3.5" />Save{mode === "edit" ? "" : " Draft"}</Button>
          <Button className="rounded-xl gradient-brand border-0 text-white text-xs h-8 gap-1.5 shadow-md" size="sm" onClick={() => handleSave(true)}><Send className="h-3.5 w-3.5" />Publish</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr_240px] gap-4">
        <Card className="border bg-card p-2"><nav className="space-y-0.5">{SECTIONS.map((s) => (<button key={s} onClick={() => setSection(s)} className={cn("flex items-center gap-2 w-full rounded-lg px-3 py-2 text-xs font-medium transition-colors text-start", section === s ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent")}>{SECTION_LABELS[s]}</button>))}</nav></Card>

        <Card className="border bg-card"><div className="max-h-[calc(100vh-12rem)] overflow-y-auto p-5 space-y-6">
          {section === "type" && (<div className="space-y-4"><h3 className="font-semibold">Question Type</h3><div className="relative"><Search className="absolute start-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" /><Input value={typeSearch} onChange={(e) => setTypeSearch(e.target.value)} placeholder="Search question type..." className="rounded-xl ps-9" /></div>
            {!typeSearch && (<div><p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Popular</p><div className="grid grid-cols-2 sm:grid-cols-3 gap-2">{TYPE_CATALOG.filter((t) => POPULAR_TYPES.includes(t.value)).map((t) => (<button key={t.value} onClick={() => { setType(t.value); setSection("question"); }} className={cn("flex items-center gap-2 rounded-xl border p-3 text-sm font-medium transition-all hover:border-primary/30", type === t.value ? "border-primary bg-primary/5 text-primary" : "")}><t.icon className="h-4 w-4 shrink-0" />{t.label}</button>))}</div></div>)}
            {(showAllTypes || typeSearch) && (<div className="space-y-4">{[...typeGroups.entries()].map(([group, items]) => (<div key={group}><p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{group}</p><div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">{items.map((t) => (<button key={t.value} onClick={() => { setType(t.value); setSection("question"); }} className={cn("flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-all hover:border-primary/30", type === t.value ? "border-primary bg-primary/5 text-primary" : "")}><t.icon className="h-3.5 w-3.5 shrink-0" />{t.label}</button>))}</div></div>))}</div>)}
            {!showAllTypes && !typeSearch && (<Button variant="outline" size="sm" className="rounded-xl text-xs" onClick={() => setShowAllTypes(true)}><ChevronDown className="me-1 h-3 w-3" />Show All 28 Types</Button>)}
          </div>)}

          {section === "question" && (<div className="space-y-4"><h3 className="font-semibold">Question</h3><div className="space-y-1.5"><Label className="text-xs">Title (optional)</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Short descriptive title" className="rounded-xl" /></div><div className="space-y-1.5"><Label className="text-xs">Question Body *</Label><textarea value={text} onChange={(e) => setText(e.target.value)} rows={5} placeholder="Write the question here..." className="w-full rounded-xl border bg-card px-3 py-2 text-sm resize-y min-h-[100px]" /></div><div className="space-y-1.5"><Label className="text-xs">Instructions (optional)</Label><textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} rows={2} placeholder="Special instructions..." className="w-full rounded-xl border bg-card px-3 py-2 text-sm resize-none" /></div><div className="space-y-1.5"><Label className="text-xs">Question Images</Label><div className="rounded-xl border-2 border-dashed p-4 text-center text-xs text-muted-foreground"><Image className="h-5 w-5 mx-auto mb-1" />Drag images or click to upload</div></div></div>)}

          {section === "answer" && (<div className="space-y-4"><div className="flex items-center justify-between"><h3 className="font-semibold">Answer Builder — {currentTypeInfo.label}</h3><Badge variant="outline" className="rounded-full text-[10px]">{type}</Badge></div><AnswerBuilder type={type} answerData={answerData} setAnswerData={setAnswerData} choices={choices} setChoices={setChoices} /></div>)}

          {section === "solution" && (<div className="space-y-4"><h3 className="font-semibold">Solution & Feedback</h3><div className="space-y-1.5"><Label className="text-xs">Hint</Label><Input value={hint} onChange={(e) => setHint(e.target.value)} placeholder="A hint for struggling students" className="rounded-xl" /></div><div className="space-y-1.5"><Label className="text-xs">Explanation</Label><textarea value={explanation} onChange={(e) => setExplanation(e.target.value)} rows={3} placeholder="Why this answer is correct..." className="w-full rounded-xl border bg-card px-3 py-2 text-sm resize-none" /></div><div className="space-y-1.5"><Label className="text-xs">Full Solution</Label><textarea value={solution} onChange={(e) => setSolution(e.target.value)} rows={3} placeholder="Step-by-step solution..." className="w-full rounded-xl border bg-card px-3 py-2 text-sm resize-none" /></div><div className="space-y-1.5"><Label className="text-xs">Common Mistakes</Label>{commonMistakes.map((m, i) => (<div key={i} className="flex gap-1.5"><Input value={m} onChange={(e) => setCommonMistakes(commonMistakes.map((x, j) => j === i ? e.target.value : x))} className="rounded-lg text-xs h-8 flex-1" /><Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => setCommonMistakes(commonMistakes.filter((_, j) => j !== i))}><X className="h-3 w-3" /></Button></div>))}<Button variant="outline" size="sm" className="rounded-lg text-xs h-7" onClick={() => setCommonMistakes([...commonMistakes, ""])}><Plus className="me-1 h-3 w-3" />Add</Button></div><div className="space-y-1.5"><Label className="text-xs">Teacher Notes</Label><textarea value={teacherNotes} onChange={(e) => setTeacherNotes(e.target.value)} rows={2} placeholder="Private notes..." className="w-full rounded-xl border bg-card px-3 py-2 text-sm resize-none" /></div></div>)}

          {section === "academic" && (<div className="space-y-4"><div><h3 className="font-semibold">Academic Mapping</h3><p className="text-[11px] text-muted-foreground mt-0.5">Optional. Link this question to curriculum nodes.</p></div><div className="space-y-1.5"><Label className="text-xs">Course</Label><select value={courseId} onChange={(e) => { setCourseId(e.target.value); setAcLinks([]); }} className="w-full h-9 rounded-xl border bg-card px-3 text-sm"><option value="">No course (unclassified)</option>{courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}</select></div>{courseId ? <AcademicLinksEditor links={acLinks} setLinks={setAcLinks} treeNodes={treeNodes} treeChapters={treeChapters} /> : <p className="text-xs text-muted-foreground italic">Select a course to add academic links, or leave unclassified.</p>}</div>)}

          {section === "metadata" && (<div className="space-y-4"><h3 className="font-semibold">Metadata</h3><div><Label className="text-xs">Difficulty</Label><div className="mt-1.5 flex gap-1.5">{DIFFICULTIES.map((d) => (<button key={d} onClick={() => setDifficulty(d)} className={cn("flex-1 rounded-xl border py-2 text-xs font-medium capitalize transition-colors", difficulty === d ? "border-primary bg-primary/10 text-primary" : "hover:bg-accent")}>{d}</button>))}</div></div><div className="grid gap-3 sm:grid-cols-2"><div className="space-y-1.5"><Label className="text-xs">Estimated Time (min)</Label><Input value={estimatedTime} onChange={(e) => setEstimatedTime(e.target.value)} placeholder="2" type="number" min="0" className="rounded-xl" /></div><div className="space-y-1.5"><Label className="text-xs">Source Label</Label><Input value={sourceLabel} onChange={(e) => setSourceLabel(e.target.value)} placeholder="Exam 2025" className="rounded-xl" /></div></div><div className="space-y-1.5"><Label className="text-xs">Source Type</Label><Input value={source} onChange={(e) => setSource(e.target.value)} placeholder="Textbook" className="rounded-xl" /></div><div className="grid gap-3 sm:grid-cols-3"><div className="space-y-1.5"><Label className="text-xs">Points</Label><Input value={points} onChange={(e) => setPoints(e.target.value)} type="number" min="0" className="rounded-xl" /></div><div className="space-y-1.5"><Label className="text-xs">Negative Marks</Label><Input value={negativeMarks} onChange={(e) => setNegativeMarks(e.target.value)} type="number" min="0" className="rounded-xl" /></div><div className="flex items-end pb-1"><label className="flex items-center gap-2 text-xs cursor-pointer"><input type="checkbox" checked={partialCredit} onChange={(e) => setPartialCredit(e.target.checked)} className="rounded" />Partial Credit</label></div></div><div className="space-y-1.5"><Label className="text-xs">Tags</Label><div className="flex gap-1.5"><Input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }} placeholder="Add tag" className="rounded-xl h-9 flex-1" /><Button variant="outline" size="sm" className="h-9 rounded-xl" onClick={addTag}>+</Button></div>{tags.length > 0 && (<div className="flex flex-wrap gap-1 mt-1.5">{tags.map((t) => (<Badge key={t} variant="outline" className="rounded-full text-xs gap-1">{t}<button onClick={() => setTags(tags.filter((x) => x !== t))}><X className="h-2.5 w-2.5" /></button></Badge>))}</div>)}</div></div>)}

          {section === "preview" && (<div className="space-y-4"><h3 className="font-semibold">Student Preview</h3><Card className="border-2 border-dashed p-6 space-y-3">{title && <p className="text-xs text-muted-foreground font-medium">{title}</p>}<p className="text-sm font-medium whitespace-pre-wrap">{text || "No question text yet."}</p>{instructions && <p className="text-xs text-muted-foreground italic">{instructions}</p>}{(type === "mcq" || type === "multi_select") && choices.length > 0 && (<div className="space-y-1.5 mt-3">{choices.map((c, i) => (<div key={c.id} className={cn("rounded-lg border px-3 py-2 text-sm", c.isCorrect ? "border-emerald-300 bg-emerald-500/5" : "")}>{String.fromCharCode(65 + i)}. {c.text || "..."}</div>))}</div>)}{type === "true_false" && answerData?.kind === "true_false" && (<div className="flex gap-3 mt-3"><div className={cn("flex-1 rounded-lg border px-3 py-2 text-sm text-center", answerData.correctBoolean ? "border-emerald-300 bg-emerald-500/5" : "")}>True</div><div className={cn("flex-1 rounded-lg border px-3 py-2 text-sm text-center", !answerData.correctBoolean ? "border-emerald-300 bg-emerald-500/5" : "")}>False</div></div>)}{type === "essay" && <div className="rounded-lg border border-dashed p-4 text-xs text-muted-foreground mt-3">Student writes essay here...</div>}{type === "calculation" && <div className="flex gap-2 mt-3"><Input disabled placeholder="Answer" className="rounded-lg flex-1" /><Input disabled placeholder="Unit" className="rounded-lg w-20" /></div>}{type === "short_answer" && <Input disabled placeholder="Type your answer..." className="rounded-lg mt-3" />}{type === "coding" && <div className="rounded-lg border bg-slate-900 p-4 text-xs text-emerald-400 font-mono mt-3">{'# Write your code here...'}</div>}{type === "file_upload" && <div className="rounded-lg border-2 border-dashed p-4 text-center text-xs text-muted-foreground mt-3"><Upload className="h-5 w-5 mx-auto mb-1" />Upload your answer</div>}{type === "flashcard" && answerData?.kind === "flashcard" && (<div className="rounded-xl border-2 p-6 text-center mt-3"><p className="text-sm font-medium">{answerData.front || "Front side"}</p><div className="my-3 border-t" /><p className="text-xs text-muted-foreground">{answerData.back || "Back side"}</p></div>)}</Card>{hint && <p className="text-xs"><span className="font-medium">Hint:</span> {hint}</p>}{explanation && <p className="text-xs"><span className="font-medium">Explanation:</span> {explanation}</p>}</div>)}
        </div></Card>

        <div className="space-y-3">
          <Card className="border bg-card p-4 space-y-3"><h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Summary</h4><div className="space-y-2 text-xs"><div className="flex justify-between"><span className="text-muted-foreground">Type</span><Badge className="rounded-full text-[10px] border-0 bg-primary/10 text-primary px-1.5 py-0">{currentTypeInfo.label}</Badge></div><div className="flex justify-between"><span className="text-muted-foreground">Difficulty</span><span className={cn("font-medium capitalize", DIFF_COLORS[difficulty])}>{difficulty}</span></div><div className="flex justify-between"><span className="text-muted-foreground">Est. Time</span><span className="font-medium">{estimatedTime ? `${estimatedTime} min` : "—"}</span></div><div className="flex justify-between"><span className="text-muted-foreground">Source</span><span className="font-medium truncate max-w-[100px]">{sourceLabel || source || "—"}</span></div><div className="flex justify-between"><span className="text-muted-foreground">Academic Links</span><span className="font-medium">{acLinks.filter((l) => l.chapterId || l.conceptId).length || "—"}</span></div><div className="flex justify-between"><span className="text-muted-foreground">Points</span><span className="font-medium">{points}</span></div><div className="flex justify-between"><span className="text-muted-foreground">Tags</span><span className="font-medium">{tags.length || "—"}</span></div><div className="flex justify-between"><span className="text-muted-foreground">Status</span><Badge variant="outline" className={cn("rounded-full text-[10px] px-1.5 py-0", questionStatus === "published" ? "border-emerald-300 text-emerald-600" : "border-amber-300 text-amber-600")}>{questionStatus}</Badge></div></div></Card>
          <Card className="border bg-card p-4 space-y-2"><Button className="w-full rounded-xl gradient-brand border-0 text-white text-xs h-9 gap-1.5" onClick={() => handleSave(true)}><Send className="h-3.5 w-3.5" />Publish</Button><Button variant="outline" className="w-full rounded-xl text-xs h-9 gap-1.5" onClick={() => handleSave(false)}><Save className="h-3.5 w-3.5" />Save{mode === "edit" ? "" : " Draft"}</Button><Button variant="ghost" className="w-full rounded-xl text-xs h-9" onClick={onExit}>Cancel</Button></Card>
        </div>
      </div>
    </div>
  );
}
