import { useMutation, useQuery } from "@tanstack/react-query";
import { AlertCircle, ArrowLeft, ArrowRight } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";

import { AttemptSecurityBadge, FocusWarningBanner, QuizTimer, SecurityNoticeCard } from "../anti-cheating";
import { autoSubmitAttempt, logAntiCheatingEvent, type AntiCheatingEventType } from "../anti-cheating/api";
import { getQuiz } from "../quizzes/api";
import { QuestionCard } from "./QuestionCard";
import { QuestionNavigator } from "./QuestionNavigator";
import { QuizHeaderCard } from "./QuizHeaderCard";
import { SubmitQuizDialog } from "./SubmitQuizDialog";
import { startQuizAttempt, submitQuizAttempt, type QuizAttempt } from "./api";

const demoStudentId = "00000000-0000-0000-0000-000000000001";

export function QuizPlayerPage() {
  const { quizId } = useParams();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Record<string, unknown>>>({});
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [focusWarningVisible, setFocusWarningVisible] = useState(false);
  const [focusLossCount, setFocusLossCount] = useState(0);
  const didAutoSubmitRef = useRef(false);

  const { data: quiz, isError, isLoading } = useQuery({
    queryKey: ["quiz", quizId],
    queryFn: () => getQuiz(quizId ?? ""),
    enabled: Boolean(quizId),
  });

  const quizQuestions = useMemo(() => [...(quiz?.questions ?? [])].sort((a, b) => a.position - b.position), [quiz]);
  const currentQuizQuestion = quizQuestions[currentQuestionIndex];
  const currentQuestion = currentQuizQuestion?.question ?? null;
  const answeredQuestionIds = useMemo(
    () => new Set(Object.entries(answers).filter(([, value]) => Object.keys(value).length > 0).map(([questionId]) => questionId)),
    [answers]
  );

  const startAttemptMutation = useMutation({
    mutationFn: () =>
      startQuizAttempt({
        quiz_id: quizId ?? "",
        student_id: demoStudentId,
        time_limit_minutes: quiz?.duration_minutes,
        user_agent: window.navigator.userAgent,
        device_fingerprint: buildDeviceFingerprint(),
      }),
    onSuccess: (nextAttempt) => {
      setAttempt(nextAttempt);
      setIsSubmitted(nextAttempt.status === "SUBMITTED");
      setFocusLossCount(nextAttempt.focus_loss_count);
    },
  });

  const logSecurityEvent = useCallback(
    (eventType: AntiCheatingEventType, metadata: Record<string, unknown> = {}) => {
      if (!attempt || isSubmitted) {
        return;
      }

      void logAntiCheatingEvent({
        attempt_id: attempt.id,
        event_type: eventType,
        metadata_json: {
          ...metadata,
          pathname: window.location.pathname,
          recorded_at: new Date().toISOString(),
        },
      }).catch(() => undefined);
    },
    [attempt, isSubmitted]
  );

  const handleAutoSubmit = useCallback(() => {
    if (!attempt || didAutoSubmitRef.current || isSubmitted) {
      return;
    }

    didAutoSubmitRef.current = true;
    void autoSubmitAttempt(attempt.id)
      .then(({ attempt: submittedAttempt }) => {
        setAttempt(submittedAttempt);
        setIsSubmitted(true);
      })
      .catch(() => {
        setIsSubmitted(true);
      });
  }, [attempt, isSubmitted]);

  useEffect(() => {
    if (!attempt || isSubmitted) {
      return;
    }

    const handleBlur = () => {
      setFocusWarningVisible(true);
      setFocusLossCount((count) => count + 1);
      logSecurityEvent("FOCUS_LOST", { reason: "window_blur" });
    };
    const handleFocus = () => {
      setFocusWarningVisible(false);
      logSecurityEvent("FOCUS_RETURNED", { reason: "window_focus" });
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        setFocusWarningVisible(true);
        logSecurityEvent("TAB_SWITCHED", { visibility_state: document.visibilityState });
      } else {
        logSecurityEvent("FOCUS_RETURNED", { visibility_state: document.visibilityState });
      }
    };
    const handleCopy = () => logSecurityEvent("COPY_ATTEMPT", { selection_length: window.getSelection()?.toString().length ?? 0 });
    const handlePaste = () => logSecurityEvent("PASTE_ATTEMPT");
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        logSecurityEvent("FULLSCREEN_EXIT");
      }
    };

    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("copy", handleCopy);
    document.addEventListener("paste", handlePaste);
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("paste", handlePaste);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [attempt, isSubmitted, logSecurityEvent]);

  if (isLoading) {
    return <div className="h-96 animate-pulse rounded-[20px] bg-white/[0.06]" />;
  }

  if (isError || !quiz) {
    return (
      <section className="rounded-[20px] border border-[#EF4444]/30 bg-[#EF4444]/10 p-8 text-[#FCA5A5]">
        <AlertCircle className="mb-3 h-6 w-6" aria-hidden="true" />
        Quiz could not be loaded.
      </section>
    );
  }

  if (!currentQuestion) {
    return (
      <section className="rounded-[20px] border border-dashed border-white/15 bg-white/[0.06] p-8 text-center text-[#94A3B8]">
        This quiz does not have playable questions yet.
      </section>
    );
  }

  const totalQuestions = quizQuestions.length;
  const answeredCount = answeredQuestionIds.size;

  if (!attempt) {
    return (
      <SecurityNoticeCard
        durationMinutes={quiz.duration_minutes}
        isStarting={startAttemptMutation.isPending}
        onStart={() => startAttemptMutation.mutate()}
      />
    );
  }

  return (
    <div className="space-y-6">
      {isSubmitted && (
        <section className="rounded-[20px] border border-[#10B981]/30 bg-[#10B981]/10 p-5 text-[#6EE7B7]">
          Quiz submitted. Results and grading are reserved for later phases.
        </section>
      )}

      <FocusWarningBanner focusLossCount={focusLossCount} isVisible={focusWarningVisible} />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-3">
          <QuizHeaderCard
            quiz={quiz}
            currentQuestionNumber={currentQuestionIndex + 1}
            totalQuestions={totalQuestions}
          />
          <AttemptSecurityBadge focusLossCount={focusLossCount} isAutoSubmitted={attempt.is_auto_submitted} />
        </div>
        <QuizTimer
          expiresAt={attempt.expires_at}
          durationMinutes={attempt.time_limit_minutes ?? quiz.duration_minutes}
          isSubmitted={isSubmitted}
          onExpire={handleAutoSubmit}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <main className="min-w-0 space-y-5">
          <QuestionCard
            question={currentQuestion}
            answerValue={answers[currentQuestion.id] ?? {}}
            onAnswerChange={(value) => setAnswers((currentAnswers) => ({ ...currentAnswers, [currentQuestion.id]: value }))}
          />

          <nav className="flex flex-col gap-3 rounded-[20px] border border-white/10 bg-white/[0.06] p-4 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              disabled={currentQuestionIndex === 0}
              onClick={() => setCurrentQuestionIndex((index) => Math.max(0, index - 1))}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-3 text-sm font-semibold text-[#CBD5E1] transition hover:bg-white/[0.10] disabled:cursor-not-allowed disabled:opacity-45"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Previous
            </button>
            <button
              type="button"
              onClick={() => setIsSubmitOpen(true)}
              disabled={isSubmitted}
              className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-br from-[#7C3AED] via-[#9333EA] to-[#A855F7] px-6 py-3 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(124,58,237,0.28)] transition hover:brightness-110"
            >
              Submit Quiz
            </button>
            <button
              type="button"
              disabled={currentQuestionIndex === totalQuestions - 1}
              onClick={() => setCurrentQuestionIndex((index) => Math.min(totalQuestions - 1, index + 1))}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-3 text-sm font-semibold text-[#CBD5E1] transition hover:bg-white/[0.10] disabled:cursor-not-allowed disabled:opacity-45"
            >
              Next
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </nav>
        </main>

        <QuestionNavigator
          questions={quizQuestions}
          currentIndex={currentQuestionIndex}
          answeredQuestionIds={answeredQuestionIds}
          onSelectQuestion={setCurrentQuestionIndex}
        />
      </div>

      <SubmitQuizDialog
        isOpen={isSubmitOpen}
        answeredCount={answeredCount}
        totalQuestions={totalQuestions}
        onCancel={() => setIsSubmitOpen(false)}
        onConfirm={() => {
          setIsSubmitOpen(false);
          void submitQuizAttempt(attempt.id)
            .then((submittedAttempt) => {
              setAttempt(submittedAttempt);
              setIsSubmitted(true);
            })
            .catch(() => setIsSubmitted(true));
        }}
      />
    </div>
  );
}

function buildDeviceFingerprint(): string {
  return [
    window.navigator.platform,
    window.navigator.language,
    window.screen.width,
    window.screen.height,
    window.devicePixelRatio,
  ].join(":");
}
