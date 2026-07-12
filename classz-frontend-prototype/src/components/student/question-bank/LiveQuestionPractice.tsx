import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Send,
  XCircle,
} from "lucide-react";
import { GradientButton } from "@/components/premium/GradientButton";
import { cn } from "@/lib/utils";
import {
  evaluateStudentQuestion,
  type StudentPracticeResultRead,
  type StudentQuestionRead,
} from "@/lib/api/student-question-bank";
import type { AnswerRecord, Confidence } from "./QuestionPractice";

interface Props {
  questions: StudentQuestionRead[];
  title: string;
  mode: string;
  onBack: () => void;
  onFinish: (answers: AnswerRecord[]) => void;
}

interface PerQuestionState {
  choiceId: string | null;
  choiceIds: string[];
  text: string;
  texts: string[];
  pairs: Record<string, string>;
  order: string[];
  confidence: Confidence | null;
  bookmarked: boolean;
  submitted: boolean;
  timeSpentMs: number;
  startedAt: number;
  result: StudentPracticeResultRead | null;
}

function makeState(question: StudentQuestionRead): PerQuestionState {
  const answerData = question.answer_data_json ?? {};
  const items = Array.isArray(answerData.items)
    ? (answerData.items as Array<Record<string, unknown>>)
    : [];
  const blanks = Array.isArray(answerData.blanks) ? answerData.blanks : [];
  return {
    choiceId: null,
    choiceIds: [],
    text: "",
    texts: blanks.map(() => ""),
    pairs: {},
    order: items.map((item) => String(item.id ?? "")).filter(Boolean),
    confidence: null,
    bookmarked: false,
    submitted: false,
    timeSpentMs: 0,
    startedAt: Date.now(),
    result: null,
  };
}

export function LiveQuestionPractice({ questions, title, mode, onBack, onFinish }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [states, setStates] = useState<Record<string, PerQuestionState>>(() =>
    Object.fromEntries(questions.map((question) => [question.id, makeState(question)])),
  );
  const [elapsed, setElapsed] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const sessionStartRef = useRef(Date.now());

  const question = questions[currentIndex];
  const state = states[question.id];
  const answerData = question.answer_data_json ?? {};
  const kind = String(answerData.kind ?? question.question_type).toLowerCase();
  const relatedConcept =
    question.concept_titles[0]
    ?? question.atomic_concept_titles[0]
    ?? question.lesson_titles[0]
    ?? question.chapter_titles[0]
    ?? "General";

  useEffect(() => {
    const interval = window.setInterval(() => {
      setElapsed(Math.floor((Date.now() - sessionStartRef.current) / 1000));
    }, 1000);
    return () => window.clearInterval(interval);
  }, []);

  const answeredCount = useMemo(
    () => Object.values(states).filter((item) => item.submitted).length,
    [states],
  );

  const canSubmit = useMemo(() => {
    if (state.submitted || state.confidence === null) return false;
    if (kind === "mcq" || kind === "true_false") return Boolean(state.choiceId);
    if (kind === "multiple_select" || kind === "multi_select") return state.choiceIds.length > 0;
    if (kind === "fill_blank") return state.texts.some((value) => value.trim().length > 0) || state.text.trim().length > 0;
    if (kind === "matching") return Object.keys(state.pairs).length > 0;
    if (kind === "ordering") return state.order.length > 0;
    return state.text.trim().length > 0;
  }, [kind, state]);

  function patchState(questionId: string, patch: Partial<PerQuestionState>) {
    setStates((current) => ({
      ...current,
      [questionId]: {
        ...current[questionId],
        ...patch,
      },
    }));
  }

  async function handleSubmit() {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    try {
      const result = await evaluateStudentQuestion({
        question_id: question.id,
        answer_data: buildAnswerPayload(state, kind),
      });
      patchState(question.id, {
        submitted: true,
        result,
        timeSpentMs: Date.now() - state.startedAt,
      });
    } finally {
      setSubmitting(false);
    }
  }

  function handleFinish() {
    const answers: AnswerRecord[] = questions.map((item) => {
      const itemState = states[item.id];
      return {
        questionId: item.id,
        studentAnswer: buildStudentAnswer(itemState, kind),
        isCorrect: itemState.result?.is_correct ?? false,
        relatedConcept:
          item.concept_titles[0]
          ?? item.atomic_concept_titles[0]
          ?? item.lesson_titles[0]
          ?? item.chapter_titles[0]
          ?? "General",
        confidence: itemState.confidence,
        bookmarked: itemState.bookmarked,
        timeSpentMs: itemState.timeSpentMs,
      };
    });
    onFinish(answers);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
        <button
          onClick={onBack}
          className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs text-slate-500">
            {mode} — {title}
          </p>
          <p className="text-sm font-semibold text-white">
            Question {currentIndex + 1} / {questions.length}
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-400">
          <span>{answeredCount}/{questions.length} submitted</span>
          <span className="inline-flex items-center gap-1 font-mono text-slate-300">
            <Clock className="h-3.5 w-3.5" />
            {String(Math.floor(elapsed / 60)).padStart(2, "0")}:{String(elapsed % 60).padStart(2, "0")}
          </span>
        </div>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-violet-500 transition-all"
          style={{ width: `${(answeredCount / questions.length) * 100}%` }}
        />
      </div>

      <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,24,42,0.96),rgba(10,14,28,0.92))] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.26)]">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-0.5 text-xs font-semibold text-slate-200">
              {question.difficulty}
            </span>
            <span className="rounded-full border border-violet-500/20 bg-violet-500/10 px-2.5 py-0.5 text-xs font-semibold text-violet-200">
              {question.question_type.replaceAll("_", " ")}
            </span>
            {relatedConcept !== "General" && (
              <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2.5 py-0.5 text-xs font-semibold text-cyan-200">
                {relatedConcept}
              </span>
            )}
          </div>
          <button
            onClick={() => patchState(question.id, { bookmarked: !state.bookmarked })}
            className={cn(
              "grid h-8 w-8 place-items-center rounded-lg transition-colors",
              state.bookmarked
                ? "bg-amber-500/15 text-amber-400"
                : "text-slate-500 hover:bg-white/10 hover:text-slate-300",
            )}
          >
            <Bookmark className={cn("h-4 w-4", state.bookmarked && "fill-amber-400")} />
          </button>
        </div>

        <p className="mb-5 text-base leading-7 text-slate-100">{question.title}</p>

        {kind === "fill_blank" && typeof answerData.promptWithBlanks === "string" && (
          <div className="mb-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-300">
            {answerData.promptWithBlanks}
          </div>
        )}

        <div className="space-y-3">
          {renderQuestionInput(question, state, patchState)}
        </div>

        {!state.submitted && (
          <div className="mt-5 space-y-3">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Confidence
              </p>
              <div className="flex gap-2">
                {([
                  ["sure", "Sure"],
                  ["not-sure", "Not Sure"],
                  ["guessing", "Guessing"],
                ] as const).map(([value, label]) => (
                  <button
                    key={value}
                    onClick={() => patchState(question.id, { confidence: value })}
                    className={cn(
                      "flex-1 rounded-xl border py-2 text-sm font-medium transition-colors",
                      state.confidence === value
                        ? "border-violet-500/40 bg-violet-500/15 text-violet-200"
                        : "border-white/10 bg-white/[0.03] text-slate-400 hover:bg-white/[0.06]",
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
              disabled={!canSubmit || submitting}
              onClick={() => void handleSubmit()}
            >
              <Send className="h-3.5 w-3.5" />
              {submitting ? "Submitting..." : "Submit Answer"}
            </GradientButton>
          </div>
        )}

        {state.submitted && state.result && (
          <div className="mt-5 space-y-4">
            <div
              className={cn(
                "flex items-center gap-3 rounded-2xl border px-5 py-4",
                state.result.pending_manual_review
                  ? "border-cyan-500/30 bg-cyan-500/10"
                  : state.result.is_correct
                    ? "border-emerald-500/30 bg-emerald-500/10"
                    : "border-red-500/30 bg-red-500/10",
              )}
            >
              {state.result.pending_manual_review ? (
                <CheckCircle2 className="h-6 w-6 text-cyan-400" />
              ) : state.result.is_correct ? (
                <CheckCircle2 className="h-6 w-6 text-emerald-400" />
              ) : (
                <XCircle className="h-6 w-6 text-red-400" />
              )}
              <div>
                <p className="font-semibold text-white">
                  {state.result.pending_manual_review
                    ? "Submitted for review"
                    : state.result.is_correct
                      ? "Correct"
                      : "Incorrect"}
                </p>
                <p className="text-xs text-slate-400">
                  {state.result.earned_points}/{state.result.max_points} points
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-200">
              {renderResultDetails(question, state.result)}
              {state.result.explanation && (
                <div className="mt-3 border-t border-white/10 pt-3">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-cyan-400">
                    Explanation
                  </p>
                  <p className="text-slate-300">{state.result.explanation}</p>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              {currentIndex > 0 && (
                <GradientButton
                  variant="outline"
                  size="sm"
                  className="justify-center"
                  onClick={() => setCurrentIndex((value) => value - 1)}
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Previous
                </GradientButton>
              )}
              <GradientButton
                size="sm"
                className="flex-1 justify-center"
                onClick={() => {
                  if (currentIndex === questions.length - 1) handleFinish();
                  else setCurrentIndex((value) => value + 1);
                }}
              >
                {currentIndex === questions.length - 1 ? "View Results" : "Next Question"}
                <ArrowRight className="h-3.5 w-3.5" />
              </GradientButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function buildAnswerPayload(state: PerQuestionState, kind: string): Record<string, unknown> {
  if (kind === "mcq") return { choice_id: state.choiceId };
  if (kind === "true_false") return { value: state.choiceId === "true" };
  if (kind === "multiple_select" || kind === "multi_select") return { choice_ids: state.choiceIds };
  if (kind === "fill_blank") {
    const texts = state.texts.filter((value) => value.trim().length > 0);
    return texts.length > 1 ? { texts } : { text: texts[0] ?? state.text };
  }
  if (kind === "matching") {
    return {
      pairs: Object.entries(state.pairs)
        .filter(([, rightId]) => Boolean(rightId))
        .map(([leftId, rightId]) => ({ leftId, rightId })),
    };
  }
  if (kind === "ordering") return { choice_ids: state.order };
  return { text: state.text };
}

function buildStudentAnswer(state: PerQuestionState, kind: string): number | string {
  if (kind === "mcq" || kind === "true_false") return state.choiceId ?? "";
  if (kind === "multiple_select" || kind === "multi_select") return state.choiceIds.join(", ");
  if (kind === "fill_blank") return state.texts.join(" | ") || state.text;
  if (kind === "matching") return JSON.stringify(state.pairs);
  if (kind === "ordering") return state.order.join(" > ");
  return state.text;
}

function renderQuestionInput(
  question: StudentQuestionRead,
  state: PerQuestionState,
  patchState: (questionId: string, patch: Partial<PerQuestionState>) => void,
) {
  const answerData = question.answer_data_json ?? {};
  const kind = String(answerData.kind ?? question.question_type).toLowerCase();

  if (kind === "mcq" || kind === "true_false") {
    const options = kind === "true_false"
      ? [{ id: "true", text: "True" }, { id: "false", text: "False" }]
      : question.options;
    return options.map((option) => (
      <button
        key={option.id}
        disabled={state.submitted}
        onClick={() => patchState(question.id, { choiceId: option.id })}
        className={cn(
          "flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-colors",
          state.choiceId === option.id
            ? "border-violet-500/40 bg-violet-500/15 text-white"
            : "border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/[0.06]",
        )}
      >
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-white/10 text-xs font-bold">
          {kind === "true_false" ? option.text[0] : option.text.slice(0, 1).toUpperCase()}
        </span>
        <span>{option.text}</span>
      </button>
    ));
  }

  if (kind === "multiple_select" || kind === "multi_select") {
    return question.options.map((option) => {
      const selected = state.choiceIds.includes(option.id);
      return (
        <button
          key={option.id}
          disabled={state.submitted}
          onClick={() =>
            patchState(question.id, {
              choiceIds: selected
                ? state.choiceIds.filter((value) => value !== option.id)
                : [...state.choiceIds, option.id],
            })
          }
          className={cn(
            "flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-colors",
            selected
              ? "border-violet-500/40 bg-violet-500/15 text-white"
              : "border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/[0.06]",
          )}
        >
          <input type="checkbox" checked={selected} readOnly className="h-4 w-4" />
          <span>{option.text}</span>
        </button>
      );
    });
  }

  if (kind === "fill_blank") {
    const blanks = Array.isArray(answerData.blanks)
      ? (answerData.blanks as Array<Record<string, unknown>>)
      : [];
    if (blanks.length > 1) {
      return blanks.map((blank, index) => (
        <div key={String(blank.id ?? index)} className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Blank {index + 1}</p>
          <input
            disabled={state.submitted}
            value={state.texts[index] ?? ""}
            onChange={(event) => {
              const next = [...state.texts];
              next[index] = event.target.value;
              patchState(question.id, { texts: next });
            }}
            className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-200 outline-none focus:border-violet-500/40"
            placeholder={`Answer blank ${index + 1}`}
          />
        </div>
      ));
    }
  }

  if (kind === "matching") {
    const leftItems = Array.isArray(answerData.leftItems)
      ? (answerData.leftItems as Array<Record<string, unknown>>)
      : [];
    const rightItems = Array.isArray(answerData.rightItems)
      ? (answerData.rightItems as Array<Record<string, unknown>>)
      : [];
    return leftItems.map((left) => {
      const leftId = String(left.id ?? "");
      return (
        <div key={leftId} className="grid gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 md:grid-cols-[1fr_220px]">
          <p className="text-sm text-slate-200">{String(left.text ?? "")}</p>
          <select
            disabled={state.submitted}
            value={state.pairs[leftId] ?? ""}
            onChange={(event) =>
              patchState(question.id, {
                pairs: {
                  ...state.pairs,
                  [leftId]: event.target.value,
                },
              })
            }
            className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-200 outline-none focus:border-violet-500/40"
          >
            <option value="">Select match</option>
            {rightItems.map((right) => (
              <option key={String(right.id ?? "")} value={String(right.id ?? "")}>
                {String(right.text ?? "")}
              </option>
            ))}
          </select>
        </div>
      );
    });
  }

  if (kind === "ordering") {
    const items = Array.isArray(answerData.items)
      ? (answerData.items as Array<Record<string, unknown>>)
      : [];
    return state.order.map((itemId, index) => {
      const item = items.find((entry) => String(entry.id ?? "") === itemId);
      return (
        <div key={itemId} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-white/10 text-xs font-bold text-slate-200">
            {index + 1}
          </span>
          <div className="min-w-0 flex-1 text-sm text-slate-200">{String(item?.text ?? itemId)}</div>
          {!state.submitted && (
            <div className="flex gap-1">
              <button
                onClick={() => patchState(question.id, { order: moveItem(state.order, index, -1) })}
                disabled={index === 0}
                className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 text-slate-300 disabled:opacity-40"
              >
                <ChevronUp className="h-4 w-4" />
              </button>
              <button
                onClick={() => patchState(question.id, { order: moveItem(state.order, index, 1) })}
                disabled={index === state.order.length - 1}
                className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 text-slate-300 disabled:opacity-40"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      );
    });
  }

  return (
    <textarea
      disabled={state.submitted}
      rows={kind === "essay" ? 6 : 3}
      value={state.text}
      onChange={(event) => patchState(question.id, { text: event.target.value })}
      placeholder={kind === "essay" ? "Write your answer here..." : "Type your answer..."}
      className="w-full resize-y rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-200 outline-none focus:border-violet-500/40"
    />
  );
}

function renderResultDetails(question: StudentQuestionRead, result: StudentPracticeResultRead) {
  const kind = String(question.answer_data_json?.kind ?? question.question_type).toLowerCase();
  if (result.pending_manual_review) {
    return <p className="text-slate-300">Your answer is saved and waiting for manual review.</p>;
  }
  if ((kind === "mcq" || kind === "true_false" || kind === "multiple_select" || kind === "multi_select") && result.correct_choice_texts.length > 0) {
    return (
      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-emerald-400">Correct Answer</p>
        <p className="text-slate-300">{result.correct_choice_texts.join(", ")}</p>
      </div>
    );
  }
  if (kind === "fill_blank" && result.accepted_text_answers.length > 0) {
    return (
      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-emerald-400">Accepted Answer</p>
        <p className="text-slate-300">{result.accepted_text_answers.join(", ")}</p>
      </div>
    );
  }
  if (kind === "ordering" && result.correct_order_ids.length > 0) {
    return (
      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-emerald-400">Correct Order</p>
        <p className="text-slate-300">{result.correct_order_ids.join(" → ")}</p>
      </div>
    );
  }
  if (kind === "matching" && result.correct_pairs.length > 0) {
    return (
      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-emerald-400">Correct Pairs</p>
        <div className="space-y-1 text-slate-300">
          {result.correct_pairs.map((pair, index) => (
            <p key={`${pair.leftId ?? ""}-${pair.rightId ?? ""}-${index}`}>
              {pair.leftId ?? "left"} → {pair.rightId ?? "right"}
            </p>
          ))}
        </div>
      </div>
    );
  }
  return <p className="text-slate-300">Answer evaluated.</p>;
}

function moveItem(values: string[], index: number, direction: -1 | 1) {
  const nextIndex = index + direction;
  if (nextIndex < 0 || nextIndex >= values.length) return values;
  const next = [...values];
  [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
  return next;
}
