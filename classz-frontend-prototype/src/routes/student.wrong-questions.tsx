import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Bookmark, Loader2, Play, RotateCcw, Search, XCircle } from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { GradientButton } from "@/components/premium/GradientButton";
import { LiveQuestionPractice } from "@/components/student/question-bank/LiveQuestionPractice";
import { PracticeResult } from "@/components/student/question-bank/PracticeResult";
import type { AnswerRecord } from "@/components/student/question-bank/QuestionPractice";
import {
  listStudentWrongQuestions,
  type StudentQuestionRead,
  type StudentWrongQuestionRead,
} from "@/lib/api/student-question-bank";
import { setMyWrongQuestionBookmark } from "@/lib/api/student-memory";
import { ROLES } from "@/lib/roles";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/student/wrong-questions")({
  component: Page,
});

type ViewState =
  | { view: "list" }
  | { view: "practice"; questions: StudentQuestionRead[]; title: string }
  | { view: "result"; answers: AnswerRecord[]; questions: StudentQuestionRead[]; title: string };

function Page() {
  const [view, setView] = useState<ViewState>({ view: "list" });
  const [wrongQuestions, setWrongQuestions] = useState<StudentWrongQuestionRead[]>([]);
  const [bookmarks, setBookmarks] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const items = await listStudentWrongQuestions();
        if (active) {
          setWrongQuestions(items);
          setBookmarks(Object.fromEntries(items.map((item) => [item.question_id, item.bookmarked])));
        }
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Failed to load wrong questions");
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return wrongQuestions;
    return wrongQuestions.filter((item) =>
      item.course_name.toLowerCase().includes(query)
      || item.subject_name.toLowerCase().includes(query)
      || item.question.title.toLowerCase().includes(query)
      || item.chapter_titles.some((title) => title.toLowerCase().includes(query))
      || item.concept_titles.some((title) => title.toLowerCase().includes(query)),
    );
  }, [search, wrongQuestions]);

  const grouped = useMemo(() => {
    const map = new Map<string, StudentWrongQuestionRead[]>();
    for (const item of filtered) {
      const key = item.course_id ?? item.course_name;
      const bucket = map.get(key) ?? [];
      bucket.push(item);
      map.set(key, bucket);
    }
    return [...map.entries()].map(([key, items]) => ({
      key,
      courseName: items[0]?.course_name ?? "Unknown Course",
      subjectName: items[0]?.subject_name ?? "General",
      items,
    }));
  }, [filtered]);

  const subtitle =
    view.view === "practice"
      ? view.title
      : view.view === "result"
        ? "Retry complete"
        : "Review real mistakes from quiz attempts";

  return (
    <DashPage role="student" title="Wrong Questions" subtitle={subtitle} icon={ROLES.student.icon}>
      {loading && <StateShell><Loader2 className="h-6 w-6 animate-spin text-violet-300" />Loading wrong questions…</StateShell>}
      {!loading && error && <StateShell>Wrong questions unavailable: {error}</StateShell>}

      {!loading && !error && view.view === "list" && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-red-500/20 bg-red-500/[0.06] px-5 py-4">
            <XCircle className="h-6 w-6 text-red-400" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-red-200">
                {wrongQuestions.length} live wrong questions
              </p>
              <p className="text-xs text-slate-400">
                Built from real quiz results and filtered by your enrolled content.
              </p>
            </div>
            {wrongQuestions.length > 0 && (
              <GradientButton
                size="sm"
                onClick={() => setView({
                  view: "practice",
                  questions: wrongQuestions.map((item) => item.question),
                  title: "Retry All Wrong Questions",
                })}
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Retry All
              </GradientButton>
            )}
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by course, question, concept, or chapter..."
              className="h-11 w-full rounded-2xl border border-white/10 bg-white/[0.03] pl-10 pr-4 text-sm text-slate-200 outline-none focus:border-violet-500/40"
            />
          </div>

          {grouped.length === 0 ? (
            <StateShell>No wrong questions found.</StateShell>
          ) : (
            <div className="space-y-4">
              {grouped.map((group) => (
                <div
                  key={group.key}
                  className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,24,42,0.96),rgba(10,14,28,0.92))] p-5 shadow-lg"
                >
                  <div className="mb-4 flex flex-wrap items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <h2 className="text-lg font-bold text-white">{group.courseName}</h2>
                      <p className="text-sm text-slate-400">
                        {group.subjectName} · {group.items.length} wrong questions
                      </p>
                    </div>
                    <GradientButton
                      size="sm"
                      onClick={() => setView({
                        view: "practice",
                        questions: group.items.map((item) => item.question),
                        title: `${group.courseName} · Wrong Questions`,
                      })}
                    >
                      <Play className="h-3.5 w-3.5" />
                      Retry Course
                    </GradientButton>
                  </div>

                  <div className="space-y-3">
                    {group.items.map((item, index) => (
                      <div
                        key={item.question_id}
                        className="rounded-2xl border border-white/8 bg-white/[0.03] p-4"
                      >
                        <div className="flex items-start gap-3">
                          <span className="grid h-8 w-8 place-items-center rounded-lg bg-red-500/15 text-xs font-bold text-red-300">
                            {index + 1}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm leading-relaxed text-slate-200">{item.question.title}</p>
                            <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
                              <span>{item.difficulty}</span>
                              {item.chapter_titles[0] ? <span>{item.chapter_titles[0]}</span> : null}
                              {item.concept_titles[0] ? <span>{item.concept_titles[0]}</span> : null}
                              <span>{item.wrong_count} wrong</span>
                              <span>{item.retry_count} retries</span>
                              <span>{new Date(item.last_wrong_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              const bookmarked = !bookmarks[item.question_id];
                              setBookmarks((current) => ({
                                ...current,
                                [item.question_id]: bookmarked,
                              }));
                              void setMyWrongQuestionBookmark(item.question_id, bookmarked).catch(() => {
                                setBookmarks((current) => ({
                                  ...current,
                                  [item.question_id]: !bookmarked,
                                }));
                              });
                            }}
                            className={bookmarks[item.question_id] ? "text-amber-400" : "text-slate-500"}
                          >
                            <Bookmark className={cn("h-4 w-4", bookmarks[item.question_id] && "fill-amber-400")} />
                          </button>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <GradientButton
                            size="sm"
                            onClick={() => setView({
                              view: "practice",
                              questions: [item.question],
                              title: `${group.courseName} · Retry Question`,
                            })}
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                            Retry
                          </GradientButton>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {view.view === "practice" && (
        <LiveQuestionPractice
          questions={view.questions}
          title={view.title}
          mode="Wrong Questions"
          onBack={() => setView({ view: "list" })}
          onFinish={(answers) => setView({
            view: "result",
            answers,
            questions: view.questions,
            title: view.title,
          })}
        />
      )}

      {view.view === "result" && (
        <PracticeResult
          title={view.title}
          answers={view.answers}
          onBackToBank={() => setView({ view: "list" })}
          onRetryWrong={() => {
            const questions = view.questions.filter((question) =>
              view.answers.some((answer) => answer.questionId === question.id && !answer.isCorrect),
            );
            if (questions.length > 0) {
              setView({
                view: "practice",
                questions,
                title: `Retry — ${questions.length} Still Wrong`,
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
                title: `Retry — ${questions.length} Bookmarked`,
              });
            }
          }}
        />
      )}
    </DashPage>
  );
}

function StateShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,24,42,0.96),rgba(10,14,28,0.92))] p-8 text-center shadow-lg">
      <div className="flex items-center justify-center gap-3 text-slate-300">{children}</div>
    </div>
  );
}
