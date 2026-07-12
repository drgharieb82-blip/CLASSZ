import { useEffect, useMemo, useState } from "react";
import { useNavigate, createFileRoute } from "@tanstack/react-router";
import { BookOpen, ChevronLeft, Loader2, Play, Target } from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { GradientButton } from "@/components/premium/GradientButton";
import { QuestionBankHome } from "@/components/student/question-bank/QuestionBankHome";
import { LiveQuestionPractice } from "@/components/student/question-bank/LiveQuestionPractice";
import { PracticeResult } from "@/components/student/question-bank/PracticeResult";
import type { AnswerRecord } from "@/components/student/question-bank/QuestionPractice";
import {
  listStudentQuestionBankCourses,
  listStudentQuestionBankQuestions,
  listStudentWrongQuestions,
  type StudentQuestionCourseRead,
  type StudentQuestionRead,
} from "@/lib/api/student-question-bank";
import type { QBSubject } from "@/lib/questionBankMock";
import { ROLES } from "@/lib/roles";

export const Route = createFileRoute("/questions/")({
  component: Page,
});

type HomeView = { view: "home" };
type CourseView = { view: "course"; courseId: string };
type ChapterView = { view: "chapter"; courseId: string; chapterId: string };
type ReturnView = HomeView | CourseView | ChapterView;
type ViewState =
  | HomeView
  | CourseView
  | ChapterView
  | {
      view: "practice";
      questions: StudentQuestionRead[];
      title: string;
      mode: string;
      returnTo: ReturnView;
    }
  | {
      view: "result";
      answers: AnswerRecord[];
      questions: StudentQuestionRead[];
      title: string;
      mode: string;
      returnTo: ReturnView;
    };

function Page() {
  const navigate = useNavigate();
  const [view, setView] = useState<ViewState>({ view: "home" });
  const [courses, setCourses] = useState<StudentQuestionCourseRead[]>([]);
  const [wrongCount, setWrongCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [courseItems, wrongItems] = await Promise.all([
          listStudentQuestionBankCourses(),
          listStudentWrongQuestions(),
        ]);
        if (!active) return;
        setCourses(courseItems);
        setWrongCount(wrongItems.length);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Failed to load question bank");
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, []);

  const course = useMemo(
    () => (view.view === "course" || view.view === "chapter"
      ? courses.find((item) => item.id === view.courseId) ?? null
      : null),
    [courses, view],
  );

  const chapter = useMemo(
    () => (view.view === "chapter"
      ? course?.chapters.find((item) => item.id === view.chapterId) ?? null
      : null),
    [course, view],
  );

  const subjects = useMemo<QBSubject[]>(
    () => courses.map((item, index) => ({
      id: item.id,
      name: `${item.subject} · ${item.name}`,
      emoji: COURSE_EMOJIS[index % COURSE_EMOJIS.length],
      color: COURSE_COLORS[index % COURSE_COLORS.length],
      totalQuestions: item.total_questions,
      solvedQuestions: item.solved_questions,
      accuracy: item.accuracy,
      availableExams: item.available_quizzes,
      chapters: item.chapters.map((chapterItem) => ({
        id: chapterItem.id,
        title: chapterItem.title,
        totalQuestions: chapterItem.total_questions,
        solvedQuestions: chapterItem.solved_questions,
        progress: chapterItem.progress,
        lessons: chapterItem.lessons.map((lesson) => ({
          id: lesson.id,
          title: lesson.title,
          concepts: lesson.concepts.map((concept) => ({
            id: concept.id,
            name: concept.name,
            questionCount: concept.question_count,
          })),
        })),
      })),
      periodicExams: [],
      finalExams: [],
    })),
    [courses],
  );

  let subtitle = "Practice from your enrolled courses";
  if (view.view === "course" && course) subtitle = `${course.subject} · ${course.name}`;
  if (view.view === "chapter" && chapter) subtitle = `${course?.name ?? "Course"} / ${chapter.title}`;
  if (view.view === "practice") subtitle = view.title;
  if (view.view === "result") subtitle = "Practice complete";

  return (
    <DashPage role="student" title="Question Bank" subtitle={subtitle} icon={ROLES.student.icon}>
      {loading && <StateCard icon={<Loader2 className="h-6 w-6 animate-spin text-violet-300" />}>Loading your live question bank…</StateCard>}
      {!loading && error && <StateCard>Question bank unavailable: {error}</StateCard>}

      {!loading && !error && view.view === "home" && (
        <QuestionBankHome
          subjects={subjects}
          onOpenSubject={(courseId) => setView({ view: "course", courseId })}
          wrongCount={wrongCount}
          onOpenWrong={() => void navigate({ to: "/student/wrong-questions" })}
        />
      )}

      {!loading && !error && view.view === "course" && course && (
        <CourseViewPanel
          course={course}
          onBack={() => setView({ view: "home" })}
          onOpenChapter={(chapterId) => setView({ view: "chapter", courseId: course.id, chapterId })}
          onPracticeAll={() => void startPractice({
            returnTo: { view: "course", courseId: course.id },
            title: `${course.name} · All Questions`,
            mode: "Course Practice",
            fetcher: () => listStudentQuestionBankQuestions({ courseId: course.id }),
            setView,
          })}
        />
      )}

      {!loading && !error && view.view === "chapter" && course && chapter && (
        <ChapterViewPanel
          courseName={course.name}
          chapter={chapter}
          onBack={() => setView({ view: "course", courseId: course.id })}
          onPracticeChapter={() => void startPractice({
            returnTo: { view: "chapter", courseId: course.id, chapterId: chapter.id },
            title: `${chapter.title} · Mixed Practice`,
            mode: "Chapter Practice",
            fetcher: () => listStudentQuestionBankQuestions({ courseId: course.id, chapterId: chapter.id }),
            setView,
          })}
          onPracticeLesson={(lessonId, lessonTitle) => void startPractice({
            returnTo: { view: "chapter", courseId: course.id, chapterId: chapter.id },
            title: lessonTitle,
            mode: "Lesson Practice",
            fetcher: () => listStudentQuestionBankQuestions({ courseId: course.id, chapterId: chapter.id, lessonId }),
            setView,
          })}
          onPracticeConcept={(conceptId, conceptTitle) => void startPractice({
            returnTo: { view: "chapter", courseId: course.id, chapterId: chapter.id },
            title: conceptTitle,
            mode: "Concept Practice",
            fetcher: () => listStudentQuestionBankQuestions({ courseId: course.id, chapterId: chapter.id, conceptId }),
            setView,
          })}
        />
      )}

      {view.view === "practice" && (
        <LiveQuestionPractice
          questions={view.questions}
          title={view.title}
          mode={view.mode}
          onBack={() => setView(view.returnTo)}
          onFinish={(answers) => setView({
            view: "result",
            answers,
            questions: view.questions,
            title: view.title,
            mode: view.mode,
            returnTo: view.returnTo,
          })}
        />
      )}

      {view.view === "result" && (
        <PracticeResult
          title={view.title}
          answers={view.answers}
          onBackToBank={() => setView({ view: "home" })}
          onRetryWrong={() => {
            const questions = view.questions.filter((question) =>
              view.answers.some((answer) => answer.questionId === question.id && !answer.isCorrect),
            );
            if (questions.length > 0) {
              setView({
                view: "practice",
                questions,
                title: "Retry Wrong Questions",
                mode: "Wrong Questions",
                returnTo: view.returnTo,
              });
            }
          }}
          onRetryBookmarked={() => {
            const questions = view.questions.filter((question) =>
              view.answers.some((answer) => answer.questionId === question.id && answer.bookmarked),
            );
            if (questions.length > 0) {
              setView({
                view: "practice",
                questions,
                title: "Retry Bookmarked Questions",
                mode: "Bookmarked",
                returnTo: view.returnTo,
              });
            }
          }}
        />
      )}
    </DashPage>
  );
}

async function startPractice(args: {
  fetcher: () => Promise<StudentQuestionRead[]>;
  title: string;
  mode: string;
  returnTo: ReturnView;
  setView: React.Dispatch<React.SetStateAction<ViewState>>;
}) {
  const questions = await args.fetcher();
  if (questions.length === 0) return;
  args.setView({
    view: "practice",
    questions,
    title: args.title,
    mode: args.mode,
    returnTo: args.returnTo,
  });
}

function CourseViewPanel({
  course,
  onBack,
  onOpenChapter,
  onPracticeAll,
}: {
  course: StudentQuestionCourseRead;
  onBack: () => void;
  onOpenChapter: (chapterId: string) => void;
  onPracticeAll: () => void;
}) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-bold text-white">{course.name}</h2>
          <p className="text-sm text-slate-400">
            {course.subject} · {course.grade} · {course.total_questions} questions
          </p>
        </div>
        <GradientButton size="sm" onClick={onPracticeAll}>
          <Play className="h-3.5 w-3.5" />
          Practice All
        </GradientButton>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {course.chapters.map((chapter, index) => (
          <div
            key={chapter.id}
            className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,24,42,0.96),rgba(10,14,28,0.92))] p-5 shadow-lg"
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-violet-400">Chapter {index + 1}</p>
                <h3 className="text-base font-semibold text-white">{chapter.title}</h3>
              </div>
              <span className="rounded-lg bg-violet-500/15 px-2.5 py-1 text-xs font-semibold text-violet-300">
                {chapter.progress}%
              </span>
            </div>
            <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-violet-500" style={{ width: `${chapter.progress}%` }} />
            </div>
            <div className="mb-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
              <span>{chapter.lessons.length} lessons</span>
              <span>{chapter.total_questions} questions</span>
              <span>{chapter.solved_questions} solved</span>
            </div>
            <GradientButton size="sm" className="w-full justify-center" onClick={() => onOpenChapter(chapter.id)}>
              <BookOpen className="h-3.5 w-3.5" />
              Open Chapter
            </GradientButton>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChapterViewPanel({
  courseName,
  chapter,
  onBack,
  onPracticeChapter,
  onPracticeLesson,
  onPracticeConcept,
}: {
  courseName: string;
  chapter: StudentQuestionCourseRead["chapters"][number];
  onBack: () => void;
  onPracticeChapter: () => void;
  onPracticeLesson: (lessonId: string, lessonTitle: string) => void;
  onPracticeConcept: (conceptId: string, conceptTitle: string) => void;
}) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-slate-500">{courseName}</p>
          <h2 className="text-xl font-bold text-white">{chapter.title}</h2>
        </div>
        <GradientButton size="sm" onClick={onPracticeChapter}>
          <Target className="h-3.5 w-3.5" />
          Practice Chapter
        </GradientButton>
      </div>

      <div className="space-y-4">
        {chapter.lessons.map((lesson, index) => (
          <div
            key={lesson.id}
            className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,24,42,0.96),rgba(10,14,28,0.92))] p-5 shadow-lg"
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-violet-400">Lesson {index + 1}</p>
                <h3 className="text-base font-semibold text-white">{lesson.title}</h3>
              </div>
              <GradientButton
                variant="outline"
                size="sm"
                onClick={() => onPracticeLesson(lesson.id, lesson.title)}
              >
                <Play className="h-3.5 w-3.5" />
                Practice Lesson
              </GradientButton>
            </div>
            <div className="space-y-2">
              {lesson.concepts.map((concept) => (
                <div
                  key={concept.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-200">{concept.name}</p>
                    <p className="text-xs text-slate-500">{concept.question_count} questions</p>
                  </div>
                  <GradientButton
                    variant="outline"
                    size="sm"
                    onClick={() => onPracticeConcept(concept.id, concept.name)}
                  >
                    <Play className="h-3.5 w-3.5" />
                    Practice
                  </GradientButton>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StateCard({ children, icon }: { children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,24,42,0.96),rgba(10,14,28,0.92))] p-8 text-center shadow-lg">
      {icon ? <div className="mb-3 flex justify-center">{icon}</div> : null}
      <div className="text-slate-300">{children}</div>
    </div>
  );
}

const COURSE_COLORS = [
  "from-emerald-500 to-teal-500",
  "from-blue-500 to-cyan-500",
  "from-violet-500 to-indigo-500",
  "from-amber-500 to-orange-500",
  "from-pink-500 to-rose-500",
  "from-green-500 to-emerald-500",
];

const COURSE_EMOJIS = ["📘", "🧪", "⚛️", "📐", "🧬", "📚"];
