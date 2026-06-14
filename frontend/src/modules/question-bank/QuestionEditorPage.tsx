import { useMutation } from "@tanstack/react-query";
import { CheckCircle2, ImagePlus, Plus, Save, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { createQuestion, type Difficulty, type QuestionCreatePayload, type QuestionType } from "./api";

const questionTypes: QuestionType[] = ["MCQ", "TRUE_FALSE", "MULTIPLE_SELECT", "SHORT_ANSWER", "ESSAY"];
const difficulties: Difficulty[] = ["EASY", "MEDIUM", "HARD"];

type DraftChoice = { choice_text: string; is_correct: boolean };

export function QuestionEditorPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [questionType, setQuestionType] = useState<QuestionType>("MCQ");
  const [difficulty, setDifficulty] = useState<Difficulty>("MEDIUM");
  const [categoryName, setCategoryName] = useState("Chemistry");
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [explanation, setExplanation] = useState("");
  const [source, setSource] = useState("Manual builder");
  const [tags, setTags] = useState("Grade 12, Chemistry");
  const [keywords, setKeywords] = useState("");
  const [commonMistakes, setCommonMistakes] = useState("");
  const [bloomLevel, setBloomLevel] = useState("Apply");
  const [thinkingSkill, setThinkingSkill] = useState("Concept reasoning");
  const [estimatedTimeSeconds, setEstimatedTimeSeconds] = useState(90);
  const [mediaUrl, setMediaUrl] = useState("");
  const [choices, setChoices] = useState<DraftChoice[]>([
    { choice_text: "", is_correct: true },
    { choice_text: "", is_correct: false },
    { choice_text: "", is_correct: false },
    { choice_text: "", is_correct: false },
  ]);

  const isObjective = questionType === "MCQ" || questionType === "TRUE_FALSE" || questionType === "MULTIPLE_SELECT";
  const validationError = useMemo(() => {
    if (!title.trim()) return "Question text is required.";
    if (!correctAnswer.trim()) return "Correct answer is required.";
    if (!explanation.trim()) return "Explanation is required.";
    if (isObjective) {
      const filledChoices = choices.filter((choice) => choice.choice_text.trim());
      if (filledChoices.length < 2) return "At least two choices are required.";
      if (!filledChoices.some((choice) => choice.is_correct)) return "Mark at least one correct choice.";
    }
    return null;
  }, [choices, correctAnswer, explanation, isObjective, title]);

  const createMutation = useMutation({
    mutationFn: createQuestion,
    onSuccess: (question) => navigate(`/question-bank/${question.id}`),
  });

  function submit() {
    if (validationError) return;
    const payload: QuestionCreatePayload = {
      category_name: categoryName,
      title,
      question_type: questionType,
      difficulty,
      correct_answer: correctAnswer,
      explanation,
      source,
      bloom_level: bloomLevel,
      thinking_skill: thinkingSkill,
      estimated_time_seconds: estimatedTimeSeconds,
      common_mistakes: commonMistakes.split(",").map((item) => item.trim()).filter(Boolean),
      keywords: keywords.split(",").map((item) => item.trim()).filter(Boolean),
      tags: tags.split(",").map((item) => item.trim()).filter(Boolean),
      choices: isObjective
        ? choices
            .filter((choice) => choice.choice_text.trim())
            .map((choice, position) => ({ ...choice, choice_text: choice.choice_text.trim(), position }))
        : [],
    };
    createMutation.mutate(payload);
  }

  return (
    <div className="space-y-6">
      <Link to="/question-bank" className="text-sm font-semibold text-[#A855F7] transition hover:text-[#C084FC]">
        Back to question bank
      </Link>

      <section className="rounded-[20px] border border-white/10 bg-[#111827]/88 p-6 shadow-[0_24px_70px_rgba(0,0,0,0.30)]">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#34D399]">Manual question builder</p>
          <h1 className="font-[Poppins] text-3xl font-semibold text-[#F8FAFC]">Create a production-ready question</h1>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-4 rounded-[20px] border border-white/10 bg-white/[0.06] p-5">
          <label className="block text-sm font-semibold text-[#CBD5E1]">
            Question
            <textarea
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              rows={4}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-[#0F172A] px-4 py-3 text-[#F8FAFC] outline-none focus:ring-2 focus:ring-[#A855F7]"
            />
          </label>

          <div className="grid gap-3 md:grid-cols-3">
            <select value={questionType} onChange={(event) => setQuestionType(event.target.value as QuestionType)} className="rounded-2xl border border-white/10 bg-[#0F172A] px-4 py-3 text-[#CBD5E1]">
              {questionTypes.map((type) => <option key={type}>{type}</option>)}
            </select>
            <select value={difficulty} onChange={(event) => setDifficulty(event.target.value as Difficulty)} className="rounded-2xl border border-white/10 bg-[#0F172A] px-4 py-3 text-[#CBD5E1]">
              {difficulties.map((level) => <option key={level}>{level}</option>)}
            </select>
            <input value={categoryName} onChange={(event) => setCategoryName(event.target.value)} className="rounded-2xl border border-white/10 bg-[#0F172A] px-4 py-3 text-[#CBD5E1]" placeholder="Category" />
          </div>

          {isObjective && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-[Poppins] text-lg font-semibold text-[#F8FAFC]">Choices</h2>
                <button type="button" onClick={() => setChoices([...choices, { choice_text: "", is_correct: false }])} className="inline-flex items-center gap-2 rounded-2xl border border-white/10 px-3 py-2 text-sm text-[#CBD5E1]">
                  <Plus className="h-4 w-4" /> Add
                </button>
              </div>
              {choices.map((choice, index) => (
                <div key={index} className="grid gap-2 md:grid-cols-[40px_minmax(0,1fr)_40px]">
                  <button type="button" onClick={() => setChoices(choices.map((item, choiceIndex) => choiceIndex === index ? { ...item, is_correct: !item.is_correct } : item))} className={["rounded-xl border", choice.is_correct ? "border-[#10B981] bg-[#10B981]/20 text-[#6EE7B7]" : "border-white/10 bg-[#0F172A] text-[#94A3B8]"].join(" ")}>
                    <CheckCircle2 className="mx-auto h-4 w-4" />
                  </button>
                  <input value={choice.choice_text} onChange={(event) => setChoices(choices.map((item, choiceIndex) => choiceIndex === index ? { ...item, choice_text: event.target.value } : item))} className="rounded-xl border border-white/10 bg-[#0F172A] px-4 py-3 text-[#CBD5E1]" placeholder={`Choice ${index + 1}`} />
                  <button type="button" onClick={() => setChoices(choices.filter((_, choiceIndex) => choiceIndex !== index))} className="rounded-xl border border-white/10 bg-[#0F172A] text-[#FCA5A5]">
                    <Trash2 className="mx-auto h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <label className="block text-sm font-semibold text-[#CBD5E1]">
            Correct answer
            <input value={correctAnswer} onChange={(event) => setCorrectAnswer(event.target.value)} className="mt-2 w-full rounded-2xl border border-white/10 bg-[#0F172A] px-4 py-3 text-[#F8FAFC]" />
          </label>
          <label className="block text-sm font-semibold text-[#CBD5E1]">
            Explanation
            <textarea value={explanation} onChange={(event) => setExplanation(event.target.value)} rows={4} className="mt-2 w-full rounded-2xl border border-white/10 bg-[#0F172A] px-4 py-3 text-[#F8FAFC]" />
          </label>
        </div>

        <aside className="space-y-4 rounded-[20px] border border-white/10 bg-white/[0.06] p-5">
          <input value={source} onChange={(event) => setSource(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-[#0F172A] px-4 py-3 text-[#CBD5E1]" placeholder="Source" />
          <input value={bloomLevel} onChange={(event) => setBloomLevel(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-[#0F172A] px-4 py-3 text-[#CBD5E1]" placeholder="Bloom level" />
          <input value={thinkingSkill} onChange={(event) => setThinkingSkill(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-[#0F172A] px-4 py-3 text-[#CBD5E1]" placeholder="Thinking skill" />
          <input type="number" value={estimatedTimeSeconds} onChange={(event) => setEstimatedTimeSeconds(Number(event.target.value))} className="w-full rounded-2xl border border-white/10 bg-[#0F172A] px-4 py-3 text-[#CBD5E1]" />
          <input value={tags} onChange={(event) => setTags(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-[#0F172A] px-4 py-3 text-[#CBD5E1]" placeholder="Tags" />
          <input value={keywords} onChange={(event) => setKeywords(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-[#0F172A] px-4 py-3 text-[#CBD5E1]" placeholder="Keywords" />
          <textarea value={commonMistakes} onChange={(event) => setCommonMistakes(event.target.value)} rows={3} className="w-full rounded-2xl border border-white/10 bg-[#0F172A] px-4 py-3 text-[#CBD5E1]" placeholder="Common mistakes" />
          <label className="block rounded-2xl border border-dashed border-white/15 bg-[#0F172A] p-4 text-sm text-[#94A3B8]">
            <ImagePlus className="mb-2 h-5 w-5 text-[#38BDF8]" />
            Image URL is staged for media attachment after save.
            <input value={mediaUrl} onChange={(event) => setMediaUrl(event.target.value)} className="mt-3 w-full rounded-xl border border-white/10 bg-[#111827] px-3 py-2 text-[#CBD5E1]" placeholder="https://..." />
          </label>
          {validationError && <p className="rounded-2xl border border-[#EF4444]/30 bg-[#EF4444]/10 p-3 text-sm text-[#FCA5A5]">{validationError}</p>}
          {mediaUrl && <p className="text-xs text-[#94A3B8]">Attach this image from the details page after creation.</p>}
          <button type="button" onClick={submit} disabled={Boolean(validationError) || createMutation.isPending} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#A855F7] px-4 py-3 font-semibold text-white transition hover:bg-[#9333EA] disabled:cursor-not-allowed disabled:opacity-50">
            <Save className="h-4 w-4" />
            {createMutation.isPending ? "Saving..." : "Save question"}
          </button>
        </aside>
      </section>
    </div>
  );
}
