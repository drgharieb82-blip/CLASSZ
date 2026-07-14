import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, CheckCircle2, Clock, HelpCircle, Loader2, XCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ApiError } from "@/lib/api/client";
import { getQuiz, type QuizRead, type QuizQuestionRead } from "@/lib/api/quizzes";
import {
  getLatestQuizAttempt,
  saveQuizAnswer,
  startQuizAttempt,
  submitQuizAttempt,
  type QuizAttemptRead,
} from "@/lib/api/quiz-attempts";
import { getQuizResult, type QuizResultRead } from "@/lib/api/results";

export const Route = createFileRoute("/student/quizzes/$quizId")({
  component: StudentQuizPage,
});

type Phase = "loading" | "intro" | "active" | "result";

function StudentQuizPage() {
  const { quizId } = Route.useParams();
  const [phase, setPhase] = useState<Phase>("loading");
  const [quiz, setQuiz] = useState<QuizRead | null>(null);
  const [attempt, setAttempt] = useState<QuizAttemptRead | null>(null);
  const [result, setResult] = useState<QuizResultRead | null>(null);
  const [answers, setAnswers] = useState<Record<string, Record<string, unknown>>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadingError, setLoadingError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const quizData = await getQuiz(quizId);
        if (!active) return;
        setQuiz(quizData);

        try {
          const latestAttempt = await getLatestQuizAttempt(quizId);
          if (!active) return;
          setAttempt(latestAttempt);
          setAnswers(
            Object.fromEntries(
              latestAttempt.answers.map((answer) => [answer.question_id, answer.answer_data]),
            ),
          );
          if (latestAttempt.status === "SUBMITTED") {
            const resultData = await getQuizResult(latestAttempt.id);
            if (!active) return;
            setResult(resultData);
            setPhase("result");
          } else {
            setPhase("active");
          }
        } catch (err) {
          if (!active) return;
          if (err instanceof ApiError && err.status === 404) {
            setPhase("intro");
            return;
          }
          throw err;
        }
      } catch (err) {
        if (!active) return;
        setLoadingError(
          err instanceof ApiError && typeof err.body === "object" && err.body !== null && "detail" in err.body
            ? String((err.body as { detail: string }).detail)
            : "Failed to load quiz.",
        );
        setPhase("intro");
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [quizId]);

  const questions = useMemo(
    () => (quiz?.questions ?? []).filter((item) => item.question !== null),
    [quiz],
  ) as QuizQuestionRead[];

  const currentQ = questions[currentIndex] ?? null;

  const setAnswerDraft = (questionId: string, answerData: Record<string, unknown>) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answerData }));
  };

  const persistAnswer = async (quizQuestion: QuizQuestionRead | null) => {
    if (!attempt || !quizQuestion?.question) return;
    const answerData = answers[quizQuestion.question.id];
    if (!answerData) return;
    setSaving(true);
    try {
      await saveQuizAnswer(attempt.id, {
        question_id: quizQuestion.question.id,
        answer_data: answerData,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleStart = async () => {
    if (!quiz) return;
    setSubmitting(true);
    try {
      const createdAttempt = await startQuizAttempt({
        quiz_id: quiz.id,
        time_limit_minutes: quiz.duration_minutes,
        user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
      });
      setAttempt(createdAttempt);
      setAnswers({});
      setCurrentIndex(0);
      setPhase("active");
      setLoadingError("");
    } catch (err) {
      setLoadingError(
        err instanceof ApiError && typeof err.body === "object" && err.body !== null && "detail" in err.body
          ? String((err.body as { detail: string }).detail)
          : "Failed to start quiz.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = async () => {
    await persistAnswer(currentQ);
    setCurrentIndex((value) => Math.min(value + 1, questions.length - 1));
  };

  const handlePrevious = async () => {
    await persistAnswer(currentQ);
    setCurrentIndex((value) => Math.max(value - 1, 0));
  };

  const handleSubmit = async () => {
    if (!attempt) return;
    setSubmitting(true);
    try {
      await persistAnswer(currentQ);
      const submittedAttempt = await submitQuizAttempt(attempt.id);
      const resultData = await getQuizResult(submittedAttempt.id);
      setAttempt(submittedAttempt);
      setResult(resultData);
      setPhase("result");
      setLoadingError("");
    } catch (err) {
      setLoadingError(
        err instanceof ApiError && typeof err.body === "object" && err.body !== null && "detail" in err.body
          ? String((err.body as { detail: string }).detail)
          : "Failed to submit quiz.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (phase === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading assessment…
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-6">
        <HelpCircle className="h-16 w-16 text-muted-foreground" />
        <h1 className="text-2xl font-bold">{loadingError || "Quiz Not Found"}</h1>
        <Button asChild variant="outline" className="rounded-xl">
          <Link to="/student/courses">Back to Courses</Link>
        </Button>
      </div>
    );
  }

  if (phase === "intro") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background p-6">
        <Card className="max-w-md w-full border bg-card p-8 text-center space-y-4">
          <HelpCircle className="mx-auto h-12 w-12 text-primary" />
          <h1 className="text-2xl font-bold">{quiz.title}</h1>
          {quiz.description && <p className="text-sm text-muted-foreground">{quiz.description}</p>}
          <div className="flex justify-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><HelpCircle className="h-4 w-4" /> {questions.length} questions</span>
            <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {quiz.duration_minutes} min</span>
          </div>
          <p className="text-xs text-muted-foreground">Pass: {quiz.passing_score}%</p>
          {loadingError && <p className="text-sm text-destructive">{loadingError}</p>}
          <Button
            onClick={handleStart}
            disabled={submitting}
            className="w-full rounded-xl gradient-brand border-0 text-white"
            size="lg"
          >
            {submitting ? <><Loader2 className="me-2 h-4 w-4 animate-spin" /> Starting…</> : "Start Quiz"}
          </Button>
          <Button asChild variant="ghost" className="w-full rounded-xl">
            <Link to="/student/courses">Back to Courses</Link>
          </Button>
        </Card>
      </div>
    );
  }

  if (phase === "result" && result) {
    const passed = result.passed;
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background p-6">
        <Card className="max-w-md w-full border bg-card p-8 text-center space-y-4">
          <div className={cn("mx-auto grid h-20 w-20 place-items-center rounded-full", passed ? "bg-emerald-500/15" : "bg-rose-500/15")}>
            {passed ? <CheckCircle2 className="h-10 w-10 text-emerald-500" /> : <XCircle className="h-10 w-10 text-rose-500" />}
          </div>
          <h1 className="text-2xl font-bold">{passed ? "Passed!" : "Submitted"}</h1>
          <p className="text-4xl font-bold">{result.percentage}%</p>
          <p className="text-sm text-muted-foreground">
            Score: {result.score}/{result.max_score}
          </p>
          <p className="text-xs text-muted-foreground">Passing score: {quiz.passing_score}%</p>
          {loadingError && <p className="text-sm text-destructive">{loadingError}</p>}
          <div className="flex gap-2">
            <Button asChild variant="outline" className="flex-1 rounded-xl">
              <Link to="/student/courses">My Courses</Link>
            </Button>
            <Button asChild className="flex-1 rounded-xl gradient-brand border-0 text-white">
              <Link to="/student/courses">Done</Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <Link to="/student/courses" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to Courses
        </Link>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Question {Math.min(currentIndex + 1, questions.length)} of {questions.length}
          </span>
          <Badge variant="outline" className="rounded-full">{quiz.duration_minutes} min</Badge>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div className="h-full bg-gradient-to-r from-violet-500 to-blue-500 transition-all" style={{ width: `${questions.length ? ((currentIndex + 1) / questions.length) * 100 : 0}%` }} />
        </div>

        {currentQ?.question && (
          <Card className="border bg-card p-6 space-y-4">
            <p className="font-medium">{currentQ.question.title}</p>

            {(currentQ.question.question_type === "MCQ" || currentQ.question.question_type === "TRUE_FALSE") && (
              <div className="space-y-2">
                {currentQ.question.choices.map((choice) => {
                  const selectedChoiceId = String(answers[currentQ.question!.id]?.choice_id ?? "");
                  return (
                    <button
                      key={choice.id}
                      onClick={() => {
                        setAnswerDraft(currentQ.question!.id, { choice_id: choice.id });
                        void saveQuizAnswer(attempt!.id, {
                          question_id: currentQ.question!.id,
                          answer_data: { choice_id: choice.id },
                        }).catch(() => undefined);
                      }}
                      className={cn("flex w-full items-center gap-3 rounded-xl border p-3 text-start text-sm transition-colors", selectedChoiceId === choice.id ? "border-primary bg-primary/5" : "hover:bg-accent")}
                    >
                      <div className={cn("h-5 w-5 shrink-0 rounded-full border-2", selectedChoiceId === choice.id ? "border-primary bg-primary" : "border-muted-foreground/30")} />
                      {choice.choice_text}
                    </button>
                  );
                })}
              </div>
            )}

            {currentQ.question.question_type === "MULTIPLE_SELECT" && (
              <div className="space-y-2">
                {currentQ.question.choices.map((choice) => {
                  const selected = new Set(
                    Array.isArray(answers[currentQ.question!.id]?.choice_ids)
                      ? (answers[currentQ.question!.id]?.choice_ids as string[])
                      : [],
                  );
                  const isChecked = selected.has(choice.id);
                  return (
                    <button
                      key={choice.id}
                      onClick={() => {
                        const next = new Set(selected);
                        if (isChecked) next.delete(choice.id);
                        else next.add(choice.id);
                        const payload = { choice_ids: Array.from(next) };
                        setAnswerDraft(currentQ.question!.id, payload);
                        void saveQuizAnswer(attempt!.id, {
                          question_id: currentQ.question!.id,
                          answer_data: payload,
                        }).catch(() => undefined);
                      }}
                      className={cn("flex w-full items-center gap-3 rounded-xl border p-3 text-start text-sm transition-colors", isChecked ? "border-primary bg-primary/5" : "hover:bg-accent")}
                    >
                      <div className={cn("h-5 w-5 shrink-0 rounded-md border-2", isChecked ? "border-primary bg-primary" : "border-muted-foreground/30")} />
                      {choice.choice_text}
                    </button>
                  );
                })}
              </div>
            )}

            {(currentQ.question.question_type === "FILL_BLANK" || currentQ.question.question_type === "ESSAY") && (
              <textarea
                value={String(answers[currentQ.question.id]?.text ?? "")}
                onChange={(e) => setAnswerDraft(currentQ.question!.id, { text: e.target.value })}
                rows={currentQ.question.question_type === "ESSAY" ? 5 : 3}
                placeholder={currentQ.question.question_type === "ESSAY" ? "Write your answer..." : "Enter your answer..."}
                className="w-full rounded-xl border bg-card px-4 py-2 text-sm resize-none"
              />
            )}

            {(currentQ.question.question_type === "MATCHING" || currentQ.question.question_type === "ORDERING") && (
              <div className="space-y-2">
                {currentQ.question.choices.map((choice) => (
                  <div key={choice.id} className="rounded-xl border bg-muted/30 px-3 py-2 text-sm">
                    {choice.choice_text}
                  </div>
                ))}
                <p className="text-xs text-muted-foreground">
                  Matching and ordering answers are preserved using the same backend attempt engine, but this MVP page exposes read-only question content for those advanced types.
                </p>
              </div>
            )}
          </Card>
        )}

        {loadingError && <p className="text-sm text-destructive">{loadingError}</p>}

        <div className="flex justify-between">
          <Button variant="outline" className="rounded-xl" disabled={currentIndex === 0 || submitting || saving} onClick={() => void handlePrevious()}>
            Previous
          </Button>
          {currentIndex < questions.length - 1 ? (
            <Button className="rounded-xl gradient-brand border-0 text-white" disabled={submitting || saving} onClick={() => void handleNext()}>
              {saving ? <><Loader2 className="me-2 h-4 w-4 animate-spin" /> Saving...</> : "Next"}
            </Button>
          ) : (
            <Button className="rounded-xl gradient-brand border-0 text-white" disabled={submitting || saving} onClick={() => void handleSubmit()}>
              {submitting ? <><Loader2 className="me-2 h-4 w-4 animate-spin" /> Submitting...</> : "Submit Quiz"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

