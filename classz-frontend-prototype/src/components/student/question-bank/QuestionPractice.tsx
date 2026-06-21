import { useState, useCallback, useEffect, useRef } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Bot,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Grid3X3,
  Image as ImageIcon,
  Send,
  StickyNote,
  X,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GradientButton } from "@/components/premium/GradientButton";
import { QuestionPalette, type PaletteQuestionState } from "./QuestionPalette";
import type { QBQuestion } from "@/lib/questionBankMock";

// ── Public types ────────────────────────────────────────────────────

export type Confidence = "sure" | "not-sure" | "guessing";

export interface AnswerRecord {
  questionId: string;
  studentAnswer: number | string;
  isCorrect: boolean;
  relatedConcept: string;
  confidence: Confidence | null;
  bookmarked: boolean;
  timeSpentMs: number;
}

interface PerQuestionState {
  selectedOption: number | null;
  essayText: string;
  submitted: boolean;
  isCorrect: boolean;
  bookmarked: boolean;
  notes: string;
  confidence: Confidence | null;
  startedAt: number;
  timeSpentMs: number;
}

function freshState(): PerQuestionState {
  return {
    selectedOption: null,
    essayText: "",
    submitted: false,
    isCorrect: false,
    bookmarked: false,
    notes: "",
    confidence: null,
    startedAt: Date.now(),
    timeSpentMs: 0,
  };
}

// ── Props ───────────────────────────────────────────────────────────

interface Props {
  questions: QBQuestion[];
  title: string;
  mode: string;
  onFinish: (answers: AnswerRecord[]) => void;
  onBack: () => void;
}

// ── Component ───────────────────────────────────────────────────────

export function QuestionPractice({
  questions,
  title,
  mode,
  onFinish,
  onBack,
}: Props) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [states, setStates] = useState<Map<number, PerQuestionState>>(
    () => new Map([[0, freshState()]]),
  );
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [explainTab, setExplainTab] = useState(0);

  const sessionStartRef = useRef(Date.now());

  const q = questions[currentIdx];
  const st = states.get(currentIdx) ?? freshState();

  const updateState = useCallback(
    (idx: number, patch: Partial<PerQuestionState>) => {
      setStates((prev) => {
        const next = new Map(prev);
        const cur = next.get(idx) ?? freshState();
        next.set(idx, { ...cur, ...patch });
        return next;
      });
    },
    [],
  );

  // ── Timer display ──
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - sessionStartRef.current) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, []);
  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;

  // ── Derived state ──
  const isMcq = q.type === "mcq" || q.type === "diagram";
  const canSubmit =
    !st.submitted &&
    st.confidence !== null &&
    (isMcq ? st.selectedOption !== null : st.essayText.trim().length > 0);

  const answeredCount = [...states.values()].filter((s) => s.submitted).length;
  const correctCount = [...states.values()].filter(
    (s) => s.submitted && s.isCorrect,
  ).length;

  // ── Handlers ──

  const handleSubmit = useCallback(() => {
    if (!canSubmit) return;
    const correct = isMcq ? st.selectedOption === q.correctAnswer : true;
    const time = Date.now() - st.startedAt;
    updateState(currentIdx, {
      submitted: true,
      isCorrect: correct,
      timeSpentMs: time,
    });
    setExplainTab(0);
  }, [canSubmit, isMcq, st, q, currentIdx, updateState]);

  const navigateTo = useCallback(
    (idx: number) => {
      if (idx < 0 || idx >= questions.length) return;
      setCurrentIdx(idx);
      setNotesOpen(false);
      setExplainTab(0);
      if (!states.has(idx)) {
        updateState(idx, freshState());
      }
    },
    [questions.length, states, updateState],
  );

  const handleFinish = useCallback(() => {
    const answers: AnswerRecord[] = questions.map((qn, idx) => {
      const s = states.get(idx) ?? freshState();
      return {
        questionId: qn.id,
        studentAnswer:
          qn.type === "mcq" || qn.type === "diagram"
            ? s.selectedOption ?? -1
            : s.essayText,
        isCorrect: s.isCorrect,
        relatedConcept: qn.relatedConcept,
        confidence: s.confidence,
        bookmarked: s.bookmarked,
        timeSpentMs: s.timeSpentMs,
      };
    });
    onFinish(answers);
  }, [questions, states, onFinish]);

  // ── Palette data ──
  const paletteData: PaletteQuestionState[] = questions.map((_, idx) => {
    const s = states.get(idx);
    return {
      status: !s || !s.submitted
        ? "unanswered"
        : s.isCorrect
          ? "correct"
          : "wrong",
      bookmarked: s?.bookmarked ?? false,
    };
  });

  // ── Difficulty color ──
  const diffColor = {
    Easy: "text-emerald-400 border-emerald-500/30 bg-emerald-500/15",
    Medium: "text-amber-400 border-amber-500/30 bg-amber-500/15",
    Hard: "text-red-400 border-red-500/30 bg-red-500/15",
  };

  // ── Explain tabs (only after submit) ──
  const explainTabs = [
    "Answer",
    "Explanation",
    "Concept",
    "Common Mistakes",
    "Hint",
  ];

  return (
    <div className="space-y-4">
      {/* ════════ TOP BAR ════════ */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
        <button
          onClick={onBack}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        <div className="min-w-0 flex-1">
          <p className="truncate text-xs text-slate-500">
            {mode} — {title}
          </p>
          <p className="text-sm font-semibold text-white">
            Question {currentIdx + 1} / {questions.length}
          </p>
        </div>

        {/* Live stats */}
        <div className="hidden items-center gap-4 text-xs sm:flex">
          <span className="text-slate-400">
            {questions.length - answeredCount} remaining
          </span>
          <span className="text-emerald-400">{correctCount} correct</span>
          <span className="font-mono text-slate-300">
            {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
          </span>
        </div>

        {/* Palette toggle */}
        <button
          onClick={() => setPaletteOpen(true)}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
        >
          <Grid3X3 className="h-4 w-4" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-violet-500 transition-all duration-300"
          style={{
            width: `${((answeredCount) / questions.length) * 100}%`,
          }}
        />
      </div>

      {/* ════════ QUESTION CARD ════════ */}
      <div className="overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,24,42,0.96),rgba(10,14,28,0.92))] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.26)] backdrop-blur-xl md:p-7">
        {/* Badge row + bookmark */}
        <div className="mb-4 flex items-center justify-between gap-2">
          <div className="flex flex-wrap gap-2">
            <span
              className={cn(
                "rounded-full border px-2.5 py-0.5 text-xs font-semibold",
                diffColor[q.difficulty],
              )}
            >
              {q.difficulty}
            </span>
            <span className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-0.5 text-xs font-semibold capitalize text-slate-300">
              {q.type === "mcq"
                ? "Multiple Choice"
                : q.type === "essay"
                  ? "Essay"
                  : "Diagram"}
            </span>
          </div>
          <div className="flex gap-1.5">
            <button
              onClick={() =>
                updateState(currentIdx, { bookmarked: !st.bookmarked })
              }
              className={cn(
                "grid h-8 w-8 place-items-center rounded-lg transition-colors",
                st.bookmarked
                  ? "bg-amber-500/15 text-amber-400"
                  : "text-slate-500 hover:bg-white/10 hover:text-slate-300",
              )}
              title="Bookmark"
            >
              <Bookmark
                className={cn("h-4 w-4", st.bookmarked && "fill-amber-400")}
              />
            </button>
            <button
              onClick={() => setNotesOpen(!notesOpen)}
              className={cn(
                "grid h-8 w-8 place-items-center rounded-lg transition-colors",
                notesOpen || st.notes
                  ? "bg-violet-500/15 text-violet-400"
                  : "text-slate-500 hover:bg-white/10 hover:text-slate-300",
              )}
              title="Notes"
            >
              <StickyNote className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Diagram */}
        {q.type === "diagram" && q.diagramDescription && (
          <div className="mb-5 overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 p-5">
            <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-400">
              <ImageIcon className="h-4 w-4" /> Diagram
            </div>
            <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-slate-300">
              {q.diagramDescription}
            </pre>
          </div>
        )}

        {/* Question body */}
        <p className="mb-6 text-base leading-7 text-slate-100 md:text-lg">
          {q.body}
        </p>

        {/* ── MCQ options ── */}
        {isMcq && q.options && (
          <div className="mb-5 space-y-2.5">
            {q.options.map((opt, idx) => {
              const isSelected = st.selectedOption === idx;
              const isCorrectOpt = idx === q.correctAnswer;
              let style =
                "border-white/8 bg-white/[0.03] hover:bg-white/[0.06]";
              if (st.submitted) {
                if (isCorrectOpt)
                  style = "border-emerald-500/40 bg-emerald-500/10";
                else if (isSelected && !isCorrectOpt)
                  style = "border-red-500/40 bg-red-500/10";
                else style = "border-white/5 bg-white/[0.01] opacity-50";
              } else if (isSelected) {
                style =
                  "border-violet-500/40 bg-violet-500/15 ring-1 ring-violet-500/30";
              }
              return (
                <button
                  key={idx}
                  disabled={st.submitted}
                  onClick={() =>
                    updateState(currentIdx, { selectedOption: idx })
                  }
                  className={cn(
                    "flex w-full items-start gap-3 rounded-2xl border px-4 py-3.5 text-left transition-colors",
                    style,
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg text-xs font-bold",
                      st.submitted && isCorrectOpt
                        ? "bg-emerald-500/20 text-emerald-300"
                        : st.submitted && isSelected && !isCorrectOpt
                          ? "bg-red-500/20 text-red-300"
                          : isSelected
                            ? "bg-violet-500/20 text-violet-300"
                            : "bg-white/10 text-slate-400",
                    )}
                  >
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span
                    className={cn(
                      "text-sm",
                      st.submitted && isCorrectOpt
                        ? "font-medium text-emerald-200"
                        : st.submitted && isSelected && !isCorrectOpt
                          ? "text-red-200 line-through"
                          : "text-slate-200",
                    )}
                  >
                    {opt}
                  </span>
                  {st.submitted && isCorrectOpt && (
                    <CheckCircle2 className="ml-auto h-5 w-5 shrink-0 text-emerald-400" />
                  )}
                  {st.submitted && isSelected && !isCorrectOpt && (
                    <XCircle className="ml-auto h-5 w-5 shrink-0 text-red-400" />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* ── Essay textarea ── */}
        {q.type === "essay" && (
          <div className="mb-5">
            <textarea
              disabled={st.submitted}
              rows={5}
              placeholder="Write your answer here..."
              value={st.essayText}
              onChange={(e) =>
                updateState(currentIdx, { essayText: e.target.value })
              }
              className="w-full resize-y rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-200 placeholder-slate-600 outline-none transition-colors focus:border-violet-500/40 focus:ring-1 focus:ring-violet-500/30 disabled:opacity-60"
            />
          </div>
        )}

        {/* ── Notes panel ── */}
        {notesOpen && (
          <div className="mb-5 rounded-2xl border border-violet-500/20 bg-violet-500/[0.04] p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-violet-400">
              Your Notes
            </p>
            <textarea
              rows={3}
              placeholder="Add personal notes for this question..."
              value={st.notes}
              onChange={(e) =>
                updateState(currentIdx, { notes: e.target.value })
              }
              className="w-full resize-y rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-violet-500/40"
            />
          </div>
        )}

        {/* ── Confidence + Submit (before submit) ── */}
        {!st.submitted && (
          <div className="space-y-3">
            {/* Confidence selector */}
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                How confident are you?
              </p>
              <div className="flex gap-2">
                {(
                  [
                    { key: "sure", label: "Sure", color: "emerald" },
                    { key: "not-sure", label: "Not Sure", color: "amber" },
                    { key: "guessing", label: "Guessing", color: "red" },
                  ] as const
                ).map(({ key, label, color }) => (
                  <button
                    key={key}
                    onClick={() =>
                      updateState(currentIdx, { confidence: key })
                    }
                    className={cn(
                      "flex-1 rounded-xl border py-2.5 text-sm font-medium transition-colors",
                      st.confidence === key
                        ? `border-${color}-500/40 bg-${color}-500/15 text-${color}-300`
                        : "border-white/8 bg-white/[0.03] text-slate-400 hover:bg-white/[0.06]",
                      // Tailwind safelist via explicit classes
                      st.confidence === key && color === "emerald" && "border-emerald-500/40 bg-emerald-500/15 text-emerald-300",
                      st.confidence === key && color === "amber" && "border-amber-500/40 bg-amber-500/15 text-amber-300",
                      st.confidence === key && color === "red" && "border-red-500/40 bg-red-500/15 text-red-300",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <GradientButton
              size="sm"
              className="w-full justify-center"
              disabled={!canSubmit}
              onClick={handleSubmit}
            >
              <Send className="h-3.5 w-3.5" /> Submit Answer
            </GradientButton>
          </div>
        )}

        {/* ── Post-submit feedback ── */}
        {st.submitted && (
          <div className="space-y-4">
            {/* Correct / Wrong banner */}
            <div
              className={cn(
                "flex items-center gap-3 rounded-2xl border px-5 py-4",
                st.isCorrect
                  ? "border-emerald-500/30 bg-emerald-500/10"
                  : q.type === "essay"
                    ? "border-cyan-500/30 bg-cyan-500/10"
                    : "border-red-500/30 bg-red-500/10",
              )}
            >
              {st.isCorrect ? (
                <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-400" />
              ) : q.type === "essay" ? (
                <CheckCircle2 className="h-6 w-6 shrink-0 text-cyan-400" />
              ) : (
                <XCircle className="h-6 w-6 shrink-0 text-red-400" />
              )}
              <div>
                <p
                  className={cn(
                    "font-semibold",
                    st.isCorrect
                      ? "text-emerald-200"
                      : q.type === "essay"
                        ? "text-cyan-200"
                        : "text-red-200",
                  )}
                >
                  {st.isCorrect
                    ? "Correct!"
                    : q.type === "essay"
                      ? "Answer Submitted"
                      : "Incorrect"}
                </p>
                {st.confidence && (
                  <p className="mt-0.5 text-xs text-slate-500">
                    Confidence: {st.confidence === "sure" ? "Sure" : st.confidence === "not-sure" ? "Not Sure" : "Guessing"}
                  </p>
                )}
              </div>
            </div>

            {/* ── Explanation Tabs ── */}
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
              <div className="flex overflow-x-auto border-b border-white/10">
                {explainTabs.map((tab, i) => (
                  <button
                    key={tab}
                    onClick={() => setExplainTab(i)}
                    className={cn(
                      "shrink-0 px-4 py-2.5 text-xs font-medium transition-colors",
                      explainTab === i
                        ? "border-b-2 border-violet-500 text-violet-300"
                        : "text-slate-500 hover:text-slate-300",
                    )}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <div className="p-4 text-sm leading-relaxed text-slate-200">
                {explainTab === 0 && (
                  <div>
                    {q.type === "essay" ? (
                      <>
                        <p className="mb-1 text-xs font-semibold uppercase text-violet-400">
                          Model Answer
                        </p>
                        <p>{String(q.correctAnswer)}</p>
                      </>
                    ) : (
                      <p>
                        The correct answer is{" "}
                        <span className="font-semibold text-emerald-300">
                          {String.fromCharCode(65 + (q.correctAnswer as number))}
                          .{" "}
                          {q.options?.[q.correctAnswer as number]}
                        </span>
                      </p>
                    )}
                  </div>
                )}
                {explainTab === 1 && <p>{q.explanation}</p>}
                {explainTab === 2 && (
                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase text-cyan-400">
                      Related Concept
                    </p>
                    <p className="font-medium">{q.relatedConcept}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      Difficulty: {q.difficulty}
                    </p>
                  </div>
                )}
                {explainTab === 3 && <p>{q.commonMistakes}</p>}
                {explainTab === 4 && <p>{q.hint}</p>}
              </div>
            </div>

            {/* AI Explain button */}
            <button
              onClick={() => setAiModalOpen(true)}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-cyan-500/20 bg-cyan-500/[0.06] px-4 py-3 text-sm font-medium text-cyan-300 transition-colors hover:bg-cyan-500/10"
            >
              <Bot className="h-4 w-4" /> Explain More with AI
            </button>

            {/* Navigation after submit */}
            <div className="flex gap-2">
              {currentIdx > 0 && (
                <GradientButton
                  variant="outline"
                  size="sm"
                  className="justify-center"
                  onClick={() => navigateTo(currentIdx - 1)}
                >
                  <ChevronLeft className="h-3.5 w-3.5" /> Previous
                </GradientButton>
              )}
              <GradientButton
                size="sm"
                className="flex-1 justify-center"
                onClick={() => {
                  if (currentIdx === questions.length - 1) {
                    handleFinish();
                  } else {
                    navigateTo(currentIdx + 1);
                  }
                }}
              >
                {currentIdx === questions.length - 1 ? (
                  <>
                    View Results <CheckCircle2 className="h-3.5 w-3.5" />
                  </>
                ) : (
                  <>
                    Next Question <ArrowRight className="h-3.5 w-3.5" />
                  </>
                )}
              </GradientButton>
            </div>
          </div>
        )}

        {/* ── Pre-submit navigation (prev only, to review answered) ── */}
        {!st.submitted && currentIdx > 0 && (
          <div className="mt-3">
            <GradientButton
              variant="outline"
              size="sm"
              className="justify-center"
              onClick={() => navigateTo(currentIdx - 1)}
            >
              <ChevronLeft className="h-3.5 w-3.5" /> Previous Question
            </GradientButton>
          </div>
        )}
      </div>

      {/* ════════ QUESTION PALETTE DRAWER ════════ */}
      <QuestionPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        questions={paletteData}
        currentIdx={currentIdx}
        onJump={navigateTo}
      />

      {/* ════════ AI MODAL ════════ */}
      {aiModalOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={() => setAiModalOpen(false)}
          />
          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-[22px] border border-white/10 bg-[rgba(10,14,28,0.98)] p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-cyan-400" />
                <h3 className="text-base font-semibold text-white">
                  AI Explanation
                </h3>
              </div>
              <button
                onClick={() => setAiModalOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/[0.04] p-5 text-center">
              <Bot className="mx-auto h-10 w-10 text-cyan-400/60" />
              <p className="mt-3 text-sm text-slate-300">
                AI explanation will be connected later.
              </p>
              <p className="mt-1 text-xs text-slate-500">
                This feature will use the CLASSZ AI Assistant to provide
                personalized explanations.
              </p>
            </div>
            <GradientButton
              variant="outline"
              size="sm"
              className="mt-4 w-full justify-center"
              onClick={() => setAiModalOpen(false)}
            >
              Close
            </GradientButton>
          </div>
        </>
      )}
    </div>
  );
}
