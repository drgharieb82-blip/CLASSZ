import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { TYPE_CATALOG, SECTIONS, type TypeInfo } from "@/components/question/QuestionWorkspaceShared";
import {
  useTeacherQuestionStore, getQuestionById, createDefaultAnswerData,
  type QuestionType, type QuestionDifficulty, type AnswerData, type MCQChoice, type QuestionAcademicLink,
} from "@/lib/teacher/teacher-question-store";
import { useTeacherCourseStore } from "@/lib/teacher/teacher-course-store";
import { useContentTreeStore } from "@/lib/teacher/content-tree-store";
import { QuestionWorkspaceUI } from "./teacher.questions.create";

export const Route = createFileRoute("/teacher/questions/$questionId/edit")({
  component: EditQuestionWorkspace,
});

function EditQuestionWorkspace() {
  const { questionId } = Route.useParams();
  const navigate = useNavigate();
  const updateQuestion = useTeacherQuestionStore((s) => s.updateQuestion);
  const courses = useTeacherCourseStore((s) => s.courses);
  const allTreeNodes = useContentTreeStore((s) => s.nodes);

  const question = useTeacherQuestionStore((s) => s.questions.find((q) => q.id === questionId));

  const [type, setType] = useState<QuestionType>(question?.type || "mcq");
  const [showAllTypes, setShowAllTypes] = useState(false);
  const [typeSearch, setTypeSearch] = useState("");
  const [section, setSection] = useState<typeof SECTIONS[number]>("question");
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
  const [courseId, setCourseId] = useState(question?.courseId || "");
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

  const treeNodes = useMemo(() => courseId ? allTreeNodes.filter((n) => n.courseId === courseId) : [], [allTreeNodes, courseId]);
  const treeChapters = useMemo(() => treeNodes.filter((n) => n.type === "chapter"), [treeNodes]);
  const currentTypeInfo = TYPE_CATALOG.find((t) => t.value === type) || TYPE_CATALOG[0];
  const filteredTypes = useMemo(() => { if (!typeSearch) return TYPE_CATALOG; const q = typeSearch.toLowerCase(); return TYPE_CATALOG.filter((t) => t.label.toLowerCase().includes(q) || t.group.toLowerCase().includes(q)); }, [typeSearch]);
  const typeGroups = useMemo(() => { const g = new Map<string, TypeInfo[]>(); for (const t of filteredTypes) { const a = g.get(t.group) || []; a.push(t); g.set(t.group, a); } return g; }, [filteredTypes]);

  const switchType = (newType: QuestionType) => { setType(newType); setAnswerData(createDefaultAnswerData(newType)); if (newType === "mcq" || newType === "multi_select") setChoices([{ id: "c1", text: "", isCorrect: newType === "mcq" }, { id: "c2", text: "", isCorrect: false }, { id: "c3", text: "", isCorrect: false }, { id: "c4", text: "", isCorrect: false }]); };
  const addTag = () => { if (tagInput.trim() && !tags.includes(tagInput.trim())) { setTags([...tags, tagInput.trim()]); setTagInput(""); } };

  if (!question) {
    return (
      <DashboardLayout role="teacher">
        <div className="flex flex-col items-center gap-4 p-16 text-center">
          <h2 className="text-lg font-semibold">Question not found</h2>
          <Button asChild variant="outline" className="rounded-xl"><Link to="/teacher/questions">Back to Question Bank</Link></Button>
        </div>
      </DashboardLayout>
    );
  }

  const handleSave = (publish: boolean) => {
    if (!text.trim()) return;
    updateQuestion(questionId, {
      type, text: text.trim(), title: title.trim() || "", body: text.trim(), instructions: instructions.trim() || "",
      courseId: courseId || "", difficulty, estimatedTimeSeconds: estimatedTime ? Number(estimatedTime) * 60 : 0,
      source: sourceLabel || source, sourceLabel: sourceLabel || "", sourceType: source || "",
      tags, explanation: explanation.trim(), hint: hint.trim() || "", solution: solution.trim() || "",
      commonMistakes: commonMistakes.filter(Boolean), points: Number(points) || 1, negativeMarks: Number(negativeMarks) || 0,
      partialCreditAllowed: partialCredit, academicLinks: acLinks.filter((l) => l.chapterId || l.conceptId), answerData,
      choices: type === "mcq" || type === "multi_select" ? choices : undefined,
      modelAnswer: type === "essay" && answerData?.kind === "essay" ? answerData.modelAnswer : undefined,
      maxWords: type === "essay" && answerData?.kind === "essay" ? answerData.maxWords : undefined,
      correctAnswer: type === "calculation" && answerData?.kind === "calculation" ? answerData.correctAnswer : undefined,
      unit: type === "calculation" && answerData?.kind === "calculation" ? answerData.unit : undefined,
      tolerance: type === "calculation" && answerData?.kind === "calculation" ? answerData.tolerance : undefined,
      status: publish ? "published" : question.status === "published" ? "published" : "draft",
    });
    navigate({ to: "/teacher/questions" });
  };

  return (
    <DashboardLayout role="teacher">
      <QuestionWorkspaceUI mode="edit" pageTitle="Edit Question" type={type} setType={switchType} showAllTypes={showAllTypes} setShowAllTypes={setShowAllTypes} typeSearch={typeSearch} setTypeSearch={setTypeSearch} section={section} setSection={setSection} title={title} setTitle={setTitle} text={text} setText={setText} instructions={instructions} setInstructions={setInstructions} answerData={answerData} setAnswerData={setAnswerData} choices={choices} setChoices={setChoices} hint={hint} setHint={setHint} explanation={explanation} setExplanation={setExplanation} solution={solution} setSolution={setSolution} commonMistakes={commonMistakes} setCommonMistakes={setCommonMistakes} teacherNotes={teacherNotes} setTeacherNotes={setTeacherNotes} courseId={courseId} setCourseId={setCourseId} acLinks={acLinks} setAcLinks={setAcLinks} difficulty={difficulty} setDifficulty={setDifficulty} estimatedTime={estimatedTime} setEstimatedTime={setEstimatedTime} source={source} setSource={setSource} sourceLabel={sourceLabel} setSourceLabel={setSourceLabel} tagInput={tagInput} setTagInput={setTagInput} tags={tags} setTags={setTags} points={points} setPoints={setPoints} negativeMarks={negativeMarks} setNegativeMarks={setNegativeMarks} partialCredit={partialCredit} setPartialCredit={setPartialCredit} courses={courses} treeNodes={treeNodes} treeChapters={treeChapters} currentTypeInfo={currentTypeInfo} filteredTypes={filteredTypes} typeGroups={typeGroups} addTag={addTag} handleSave={handleSave} questionStatus={question.status} publicCode={question.publicCode} />
    </DashboardLayout>
  );
}
