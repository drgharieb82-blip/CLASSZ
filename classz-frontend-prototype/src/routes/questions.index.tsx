import { useState, useCallback } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { DashPage } from "@/components/common/DashPage";
import { ROLES } from "@/lib/roles";
import {
  qbSubjects,
  qbQuestions,
  getQuestionsForChapter,
  getQuestionsForConcept,
  getQuestionsForSubject,
  type QBQuestion,
} from "@/lib/questionBankMock";
import { QuestionBankHome } from "@/components/student/question-bank/QuestionBankHome";
import { SubjectView } from "@/components/student/question-bank/SubjectView";
import { ChapterView } from "@/components/student/question-bank/ChapterView";
import {
  QuestionPractice,
  type AnswerRecord,
} from "@/components/student/question-bank/QuestionPractice";
import { PracticeResult } from "@/components/student/question-bank/PracticeResult";
import {
  WrongQuestionsView,
  type SavedWrongQuestion,
} from "@/components/student/question-bank/WrongQuestionsView";

export const Route = createFileRoute("/questions/")({
  component: Page,
});

// ── View state machine ──────────────────────────────────────────────

type NavigableView =
  | { view: "home" }
  | { view: "subject"; subjectId: string }
  | { view: "chapter"; subjectId: string; chapterId: string }
  | { view: "wrong" };

type ViewState =
  | NavigableView
  | {
      view: "practice";
      questions: QBQuestion[];
      title: string;
      mode: string;
      returnTo: NavigableView;
    }
  | {
      view: "result";
      answers: AnswerRecord[];
      questions: QBQuestion[];
      title: string;
      mode: string;
      returnTo: NavigableView;
    };

// ── Component ───────────────────────────────────────────────────────

function Page() {
  const [state, setState] = useState<ViewState>({ view: "home" });
  const [wrongBank, setWrongBank] = useState<SavedWrongQuestion[]>([]);

  // ── Navigation helpers ──

  const goHome = useCallback(() => setState({ view: "home" }), []);

  const openSubject = useCallback(
    (subjectId: string) => setState({ view: "subject", subjectId }),
    [],
  );

  const openChapter = useCallback(
    (subjectId: string, chapterId: string) =>
      setState({ view: "chapter", subjectId, chapterId }),
    [],
  );

  const openWrong = useCallback(() => setState({ view: "wrong" }), []);

  const startPractice = useCallback(
    (
      questions: QBQuestion[],
      title: string,
      mode: string,
      returnTo: NavigableView,
    ) => {
      if (questions.length === 0) return;
      setState({ view: "practice", questions, title, mode, returnTo });
    },
    [],
  );

  // ── Finish handler — saves wrong answers ──

  const handleFinish = useCallback(
    (
      answers: AnswerRecord[],
      questions: QBQuestion[],
      title: string,
      mode: string,
      returnTo: NavigableView,
    ) => {
      // Add wrong answers to bank (deduplicate by question id)
      setWrongBank((prev) => {
        const existing = new Map(prev.map((w) => [w.question.id, w]));
        for (const a of answers) {
          if (!a.isCorrect) {
            const q = questions.find((qn) => qn.id === a.questionId);
            if (q) {
              existing.set(q.id, {
                question: q,
                studentAnswer: a.studentAnswer,
                bookmarked: a.bookmarked,
              });
            }
          } else {
            existing.delete(a.questionId);
          }
        }
        return [...existing.values()];
      });
      setState({ view: "result", answers, questions, title, mode, returnTo });
    },
    [],
  );

  // ── Retry helpers ──

  const retryQuestions = useCallback(
    (qs: QBQuestion[], title: string, mode: string, returnTo: NavigableView) => {
      startPractice(qs, title, mode, returnTo);
    },
    [startPractice],
  );

  // ── Subtitle ──
  let subtitle = "Practice thousands of curated questions";
  if (state.view === "subject") {
    const s = qbSubjects.find((s) => s.id === state.subjectId);
    if (s) subtitle = `${s.name} — ${s.totalQuestions} questions`;
  } else if (state.view === "chapter") {
    const s = qbSubjects.find((s) => s.id === state.subjectId);
    const ch = s?.chapters.find((c) => c.id === state.chapterId);
    if (s && ch) subtitle = `${s.name} / ${ch.title}`;
  } else if (state.view === "practice") {
    subtitle = state.title;
  } else if (state.view === "result") {
    subtitle = "Practice complete";
  } else if (state.view === "wrong") {
    subtitle = `${wrongBank.length} wrong questions saved`;
  }

  return (
    <DashPage
      role="student"
      title="Question Bank"
      subtitle={subtitle}
      icon={ROLES.student.icon}
    >
      {state.view === "home" && (
        <QuestionBankHome
          subjects={qbSubjects}
          onOpenSubject={openSubject}
          wrongCount={wrongBank.length}
          onOpenWrong={openWrong}
        />
      )}

      {state.view === "subject" && (
        <SubjectViewWrapper
          subjectId={state.subjectId}
          onBack={goHome}
          openChapter={openChapter}
          startPractice={startPractice}
        />
      )}

      {state.view === "chapter" && (
        <ChapterViewWrapper
          subjectId={state.subjectId}
          chapterId={state.chapterId}
          onBack={() => openSubject(state.subjectId)}
          startPractice={startPractice}
        />
      )}

      {state.view === "practice" && (
        <QuestionPractice
          questions={state.questions}
          title={state.title}
          mode={state.mode}
          onBack={() => setState(state.returnTo)}
          onFinish={(answers) =>
            handleFinish(
              answers,
              state.questions,
              state.title,
              state.mode,
              state.returnTo,
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
            const wrongQs = state.answers
              .filter((a) => !a.isCorrect)
              .map((a) => state.questions.find((q) => q.id === a.questionId)!)
              .filter(Boolean);
            retryQuestions(
              wrongQs,
              "Retry Wrong Questions",
              "Wrong Questions",
              state.returnTo,
            );
          }}
          onRetryBookmarked={() => {
            const bmQs = state.answers
              .filter((a) => a.bookmarked)
              .map((a) => state.questions.find((q) => q.id === a.questionId)!)
              .filter(Boolean);
            retryQuestions(
              bmQs,
              "Retry Bookmarked Questions",
              "Bookmarked",
              state.returnTo,
            );
          }}
        />
      )}

      {state.view === "wrong" && (
        <WrongQuestionsView
          wrongQuestions={wrongBank}
          onBack={goHome}
          onRetryAll={() => {
            const qs = wrongBank.map((w) => w.question);
            retryQuestions(
              qs,
              "Retry All Wrong Questions",
              "Wrong Questions",
              { view: "wrong" },
            );
          }}
          onRetryBookmarked={() => {
            const qs = wrongBank
              .filter((w) => w.bookmarked)
              .map((w) => w.question);
            retryQuestions(
              qs,
              "Retry Bookmarked Questions",
              "Bookmarked",
              { view: "wrong" },
            );
          }}
          onClear={() => setWrongBank([])}
        />
      )}
    </DashPage>
  );
}

// ── Wrapper components ──────────────────────────────────────────────

function SubjectViewWrapper({
  subjectId,
  onBack,
  openChapter,
  startPractice,
}: {
  subjectId: string;
  onBack: () => void;
  openChapter: (subjectId: string, chapterId: string) => void;
  startPractice: (
    qs: QBQuestion[],
    title: string,
    mode: string,
    returnTo: NavigableView,
  ) => void;
}) {
  const subject = qbSubjects.find((s) => s.id === subjectId);
  if (!subject) return null;

  const returnTo: NavigableView = { view: "subject", subjectId };

  return (
    <SubjectView
      subject={subject}
      onBack={onBack}
      onOpenChapter={(chapterId) => openChapter(subjectId, chapterId)}
      onStartExam={(examId) => {
        const qs = getQuestionsForSubject(subjectId);
        startPractice(
          qs.length > 0 ? qs : qbQuestions.slice(0, 5),
          `${subject.name} — Exam`,
          examId.startsWith("pe") ? "Periodic Exam" : "Final Exam",
          returnTo,
        );
      }}
      onPracticeAll={() => {
        const qs = getQuestionsForSubject(subjectId);
        startPractice(
          qs.length > 0 ? qs : qbQuestions.slice(0, 5),
          `${subject.name} — All Questions`,
          "Mixed Questions",
          returnTo,
        );
      }}
      onPracticeChapterExam={(chapterId) => {
        const qs = getQuestionsForChapter(subjectId, chapterId);
        const ch = subject.chapters.find((c) => c.id === chapterId);
        startPractice(
          qs.length > 0 ? qs : qbQuestions.slice(0, 3),
          `${subject.name} — ${ch?.title ?? "Chapter"} Exam`,
          "Chapter Exam",
          returnTo,
        );
      }}
    />
  );
}

function ChapterViewWrapper({
  subjectId,
  chapterId,
  onBack,
  startPractice,
}: {
  subjectId: string;
  chapterId: string;
  onBack: () => void;
  startPractice: (
    qs: QBQuestion[],
    title: string,
    mode: string,
    returnTo: NavigableView,
  ) => void;
}) {
  const subject = qbSubjects.find((s) => s.id === subjectId);
  const chapter = subject?.chapters.find((c) => c.id === chapterId);
  if (!subject || !chapter) return null;

  const chapterIndex = subject.chapters.indexOf(chapter);
  const returnTo: NavigableView = { view: "chapter", subjectId, chapterId };

  return (
    <ChapterView
      chapter={chapter}
      chapterIndex={chapterIndex}
      subjectName={subject.name}
      onBack={onBack}
      onPracticeChapter={() => {
        const qs = getQuestionsForChapter(subjectId, chapterId);
        startPractice(
          qs.length > 0 ? qs : qbQuestions.slice(0, 3),
          `${subject.name} — ${chapter.title}`,
          "Chapter Exam",
          returnTo,
        );
      }}
      onPracticeLesson={(lessonId) => {
        const lesson = chapter.lessons.find((l) => l.id === lessonId);
        const conceptIds = lesson?.concepts.map((c) => c.id) ?? [];
        const qs = qbQuestions.filter((q) => conceptIds.includes(q.conceptId));
        startPractice(
          qs.length > 0 ? qs : qbQuestions.slice(0, 2),
          `${lesson?.title ?? "Lesson"} — Mixed Practice`,
          "Lesson Practice",
          returnTo,
        );
      }}
      onPracticeConcept={(conceptId) => {
        const concept = chapter.lessons
          .flatMap((l) => l.concepts)
          .find((c) => c.id === conceptId);
        const qs = getQuestionsForConcept(conceptId);
        startPractice(
          qs.length > 0 ? qs : qbQuestions.slice(0, 1),
          `${concept?.name ?? "Concept"} Practice`,
          "Concept Practice",
          returnTo,
        );
      }}
    />
  );
}
