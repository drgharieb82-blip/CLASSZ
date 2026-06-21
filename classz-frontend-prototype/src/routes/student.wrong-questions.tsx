import { useState, useCallback } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { DashPage } from "@/components/common/DashPage";
import { ROLES } from "@/lib/roles";
import {
  wrongQuestionsList as initialWrongQuestions,
  getWrongSubjectSummaries,
  getWrongQuestionsForSubject,
  type WrongQuestion,
} from "@/lib/wrongQuestionsMock";
import type { QBQuestion } from "@/lib/questionBankMock";
import { WrongQHome } from "@/components/student/wrong-questions/WrongQHome";
import { WrongQSubjectDetail } from "@/components/student/wrong-questions/WrongQSubjectDetail";
import { WrongQPrintView } from "@/components/student/wrong-questions/WrongQPrintView";
import {
  QuestionPractice,
  type AnswerRecord,
} from "@/components/student/question-bank/QuestionPractice";
import { PracticeResult } from "@/components/student/question-bank/PracticeResult";

export const Route = createFileRoute("/student/wrong-questions")({
  component: Page,
});

type ViewState =
  | { view: "home" }
  | { view: "subject"; subjectId: string }
  | { view: "print"; questions: WrongQuestion[] }
  | { view: "practice"; questions: QBQuestion[]; title: string; returnSubjectId: string }
  | { view: "result"; answers: AnswerRecord[]; questions: QBQuestion[]; title: string; returnSubjectId: string };

function wrongToQB(wq: WrongQuestion): QBQuestion {
  return {
    id: wq.id,
    type: wq.type,
    subjectId: wq.subjectId,
    chapterId: "",
    lessonId: "",
    conceptId: "",
    difficulty: wq.difficulty,
    body: wq.body,
    diagramDescription: wq.diagramDescription,
    options: wq.options,
    correctAnswer: wq.correctAnswer,
    explanation: wq.explanation,
    relatedConcept: wq.conceptName,
    commonMistakes: "",
    hint: "",
  };
}

function Page() {
  const [state, setState] = useState<ViewState>({ view: "home" });
  const [wrongQs, setWrongQs] = useState<WrongQuestion[]>(() => [
    ...initialWrongQuestions,
  ]);

  const goHome = useCallback(() => setState({ view: "home" }), []);

  const openSubject = useCallback(
    (subjectId: string) => setState({ view: "subject", subjectId }),
    [],
  );

  const subjectQs = useCallback(
    (subjectId: string) => wrongQs.filter((q) => q.subjectId === subjectId),
    [wrongQs],
  );

  const toggleBookmark = useCallback((id: string) => {
    setWrongQs((prev) =>
      prev.map((q) =>
        q.id === id ? { ...q, bookmarked: !q.bookmarked } : q,
      ),
    );
  }, []);

  const updateNotes = useCallback((id: string, notes: string) => {
    setWrongQs((prev) =>
      prev.map((q) => (q.id === id ? { ...q, notes } : q)),
    );
  }, []);

  const startRetry = useCallback(
    (ids: string[], returnSubjectId: string) => {
      const selected = wrongQs.filter((q) => ids.includes(q.id));
      if (selected.length === 0) return;
      const qbQs = selected.map(wrongToQB);
      setState({
        view: "practice",
        questions: qbQs,
        title: `Retry — ${selected.length} Wrong Questions`,
        returnSubjectId,
      });
    },
    [wrongQs],
  );

  const handleFinish = useCallback(
    (
      answers: AnswerRecord[],
      questions: QBQuestion[],
      title: string,
      returnSubjectId: string,
    ) => {
      setWrongQs((prev) =>
        prev.map((wq) => {
          const answer = answers.find((a) => a.questionId === wq.id);
          if (!answer) return wq;
          return {
            ...wq,
            retryCount: wq.retryCount + 1,
            lastRetryDate: new Date().toISOString().slice(0, 10),
            retryCorrected: answer.isCorrect,
          };
        }),
      );
      setState({ view: "result", answers, questions, title, returnSubjectId });
    },
    [],
  );

  const summaries = (() => {
    const subjects = [
      { id: "sub-chem", name: "Chemistry", emoji: "🧪", color: "from-emerald-500 to-teal-500" },
      { id: "sub-phys", name: "Physics", emoji: "⚛️", color: "from-blue-500 to-cyan-500" },
      { id: "sub-bio", name: "Biology", emoji: "🧬", color: "from-green-500 to-emerald-500" },
      { id: "sub-math", name: "Mathematics", emoji: "📐", color: "from-violet-500 to-blue-500" },
      { id: "sub-arabic", name: "Arabic", emoji: "🕌", color: "from-amber-500 to-orange-500" },
      { id: "sub-eng", name: "English", emoji: "📚", color: "from-pink-500 to-rose-500" },
    ];
    return subjects.map((s) => {
      const qs = wrongQs.filter((q) => q.subjectId === s.id);
      const retried = qs.filter((q) => q.retryCount > 0);
      const corrected = qs.filter((q) => q.retryCorrected);
      const stillWeak = qs.filter((q) => !q.retryCorrected);
      const dates = qs.map((q) => q.dateAnsweredWrong).sort().reverse();
      return {
        subjectId: s.id,
        subjectName: s.name,
        emoji: s.emoji,
        color: s.color,
        totalWrong: qs.length,
        retriedCount: retried.length,
        stillWeakCount: stillWeak.length,
        accuracyAfterRetry: retried.length > 0 ? Math.round((corrected.length / retried.length) * 100) : 0,
        lastMistakeDate: dates[0] ?? "—",
      };
    });
  })();

  let subtitle = "Review and master your mistakes";
  if (state.view === "subject") {
    const s = summaries.find((s) => s.subjectId === state.subjectId);
    if (s) subtitle = `${s.subjectName} — ${s.totalWrong} wrong questions`;
  } else if (state.view === "practice") {
    subtitle = state.title;
  } else if (state.view === "result") {
    subtitle = "Retry complete";
  } else if (state.view === "print") {
    subtitle = `Print — ${state.questions.length} questions`;
  }

  return (
    <DashPage
      role="student"
      title="Wrong Questions"
      subtitle={subtitle}
      icon={ROLES.student.icon}
    >
      {state.view === "home" && (
        <WrongQHome summaries={summaries} onOpenSubject={openSubject} />
      )}

      {state.view === "subject" && (() => {
        const s = summaries.find((s) => s.subjectId === state.subjectId);
        if (!s) return null;
        return (
          <WrongQSubjectDetail
            subjectName={s.subjectName}
            subjectEmoji={s.emoji}
            subjectColor={s.color}
            questions={subjectQs(state.subjectId)}
            onBack={goHome}
            onRetryQuestions={(ids) => startRetry(ids, state.subjectId)}
            onPrint={(qs) => setState({ view: "print", questions: qs })}
            onToggleBookmark={toggleBookmark}
            onUpdateNotes={updateNotes}
          />
        );
      })()}

      {state.view === "print" && (
        <WrongQPrintView
          questions={state.questions}
          onBack={() => setState({ view: "home" })}
        />
      )}

      {state.view === "practice" && (
        <QuestionPractice
          questions={state.questions}
          title={state.title}
          mode="Wrong Questions"
          onBack={() => openSubject(state.returnSubjectId)}
          onFinish={(answers) =>
            handleFinish(
              answers,
              state.questions,
              state.title,
              state.returnSubjectId,
            )
          }
        />
      )}

      {state.view === "result" && (
        <PracticeResult
          title={state.title}
          answers={state.answers}
          onBackToBank={goHome}
          onRetryWrong={() => {
            const wrongIds = state.answers
              .filter((a) => !a.isCorrect)
              .map((a) => a.questionId);
            const qs = state.questions.filter((q) => wrongIds.includes(q.id));
            if (qs.length > 0) {
              setState({
                view: "practice",
                questions: qs,
                title: `Retry — ${qs.length} Still Wrong`,
                returnSubjectId: state.returnSubjectId,
              });
            }
          }}
          onRetryBookmarked={() => {
            const bmIds = state.answers
              .filter((a) => a.bookmarked)
              .map((a) => a.questionId);
            const qs = state.questions.filter((q) => bmIds.includes(q.id));
            if (qs.length > 0) {
              setState({
                view: "practice",
                questions: qs,
                title: `Retry — ${qs.length} Bookmarked`,
                returnSubjectId: state.returnSubjectId,
              });
            }
          }}
        />
      )}
    </DashPage>
  );
}
