import { useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  Clock,
  FileText,
  Lock,
  Play,
  Trophy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GradientButton } from "@/components/premium/GradientButton";
import type { QBSubject, QBExam, QBChapter } from "@/lib/questionBankMock";

type Tab = "chapters" | "periodic" | "final" | "all";

interface Props {
  subject: QBSubject;
  onBack: () => void;
  onOpenChapter: (chapterId: string) => void;
  onStartExam: (examId: string) => void;
  onPracticeAll: () => void;
  onPracticeChapterExam: (chapterId: string) => void;
}

export function SubjectView({
  subject,
  onBack,
  onOpenChapter,
  onStartExam,
  onPracticeAll,
  onPracticeChapterExam,
}: Props) {
  const [tab, setTab] = useState<Tab>("chapters");

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: "chapters", label: "Chapters", icon: BookOpen },
    { key: "periodic", label: "Periodic Exams", icon: ClipboardList },
    { key: "final", label: "Final Exams", icon: Trophy },
    { key: "all", label: "All Questions", icon: FileText },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div
          className={cn(
            "grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br text-xl shadow-lg",
            subject.color,
          )}
        >
          {subject.emoji}
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">{subject.name}</h2>
          <p className="text-sm text-slate-400">
            {subject.solvedQuestions}/{subject.totalQuestions} solved
            {subject.accuracy > 0 && ` · ${subject.accuracy}% accuracy`}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors",
                tab === t.key
                  ? "border-violet-500/40 bg-violet-500/15 text-violet-200"
                  : "border-white/8 bg-white/[0.03] text-slate-400 hover:bg-white/[0.06] hover:text-slate-200",
              )}
            >
              <Icon className="h-4 w-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {tab === "chapters" && (
        <ChaptersTab
          chapters={subject.chapters}
          onOpenChapter={onOpenChapter}
          onPracticeChapterExam={onPracticeChapterExam}
        />
      )}
      {tab === "periodic" && (
        <ExamsTab exams={subject.periodicExams} onStartExam={onStartExam} />
      )}
      {tab === "final" && (
        <ExamsTab exams={subject.finalExams} onStartExam={onStartExam} />
      )}
      {tab === "all" && (
        <AllQuestionsTab
          totalQuestions={subject.totalQuestions}
          solvedQuestions={subject.solvedQuestions}
          onPracticeAll={onPracticeAll}
        />
      )}
    </div>
  );
}

function ChaptersTab({
  chapters,
  onOpenChapter,
  onPracticeChapterExam,
}: {
  chapters: QBChapter[];
  onOpenChapter: (id: string) => void;
  onPracticeChapterExam: (id: string) => void;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {chapters.map((ch, idx) => {
        const lessonCount = ch.lessons.length;
        const conceptCount = ch.lessons.reduce(
          (acc, l) => acc + l.concepts.length,
          0,
        );
        return (
          <div
            key={ch.id}
            className="overflow-hidden rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,24,42,0.96),rgba(10,14,28,0.92))] p-5 shadow-lg"
          >
            <div className="mb-3 flex items-start justify-between gap-2">
              <div>
                <p className="text-xs font-medium text-violet-400">
                  Chapter {idx + 1}
                </p>
                <h4 className="mt-0.5 text-base font-semibold text-white">
                  {ch.title}
                </h4>
              </div>
              <span className="shrink-0 rounded-lg bg-violet-500/15 px-2.5 py-1 text-xs font-semibold text-violet-300">
                {ch.progress}%
              </span>
            </div>

            <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-violet-500"
                style={{ width: `${ch.progress}%` }}
              />
            </div>

            <div className="mb-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
              <span>{lessonCount} lessons</span>
              <span>{conceptCount} concepts</span>
              <span>{ch.totalQuestions} questions</span>
            </div>

            <div className="flex gap-2">
              <GradientButton
                size="sm"
                className="flex-1 justify-center"
                onClick={() => onOpenChapter(ch.id)}
              >
                <BookOpen className="h-3.5 w-3.5" /> Open
              </GradientButton>
              <GradientButton
                variant="outline"
                size="sm"
                className="justify-center"
                onClick={() => onPracticeChapterExam(ch.id)}
              >
                <ClipboardList className="h-3.5 w-3.5" /> Chapter Exam
              </GradientButton>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ExamsTab({
  exams,
  onStartExam,
}: {
  exams: QBExam[];
  onStartExam: (id: string) => void;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {exams.map((exam) => (
        <div
          key={exam.id}
          className={cn(
            "overflow-hidden rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,24,42,0.96),rgba(10,14,28,0.92))] p-5 shadow-lg",
            exam.status === "locked" && "opacity-50",
          )}
        >
          <div className="mb-3 flex items-start justify-between gap-2">
            <h4 className="text-base font-semibold text-white">{exam.title}</h4>
            <ExamBadge status={exam.status} score={exam.score} />
          </div>

          <div className="mb-4 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-400">
            <span className="inline-flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5" /> {exam.questionCount}{" "}
              questions
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" /> {exam.duration}
            </span>
          </div>

          {exam.status === "locked" ? (
            <GradientButton
              variant="outline"
              size="sm"
              className="w-full justify-center"
              disabled
            >
              <Lock className="h-3.5 w-3.5" /> Locked
            </GradientButton>
          ) : exam.status === "completed" ? (
            <div className="flex gap-2">
              <GradientButton
                variant="outline"
                size="sm"
                className="flex-1 justify-center"
                onClick={() => onStartExam(exam.id)}
              >
                <Play className="h-3.5 w-3.5" /> Retake
              </GradientButton>
              <GradientButton
                variant="outline"
                size="sm"
                className="justify-center"
              >
                <CheckCircle2 className="h-3.5 w-3.5" /> Review
              </GradientButton>
            </div>
          ) : (
            <GradientButton
              size="sm"
              className="w-full justify-center"
              onClick={() => onStartExam(exam.id)}
            >
              <Play className="h-3.5 w-3.5" /> Start Exam
            </GradientButton>
          )}
        </div>
      ))}
    </div>
  );
}

function AllQuestionsTab({
  totalQuestions,
  solvedQuestions,
  onPracticeAll,
}: {
  totalQuestions: number;
  solvedQuestions: number;
  onPracticeAll: () => void;
}) {
  const remaining = totalQuestions - solvedQuestions;
  return (
    <div className="overflow-hidden rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,24,42,0.96),rgba(10,14,28,0.92))] p-6 text-center shadow-lg">
      <FileText className="mx-auto h-10 w-10 text-violet-400" />
      <h4 className="mt-3 text-lg font-bold text-white">
        Full Question Bank Practice
      </h4>
      <p className="mt-1 text-sm text-slate-400">
        {totalQuestions} total questions · {solvedQuestions} solved · {remaining}{" "}
        remaining
      </p>
      <GradientButton
        size="sm"
        className="mx-auto mt-5 justify-center"
        onClick={onPracticeAll}
      >
        <Play className="h-3.5 w-3.5" /> Practice All Questions
      </GradientButton>
    </div>
  );
}

function ExamBadge({
  status,
  score,
}: {
  status: QBExam["status"];
  score?: number;
}) {
  if (status === "completed") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-300">
        <CheckCircle2 className="h-3 w-3" /> {score}%
      </span>
    );
  }
  if (status === "locked") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-slate-500/30 bg-slate-500/15 px-2.5 py-1 text-xs font-semibold text-slate-400">
        <Lock className="h-3 w-3" /> Locked
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-cyan-500/30 bg-cyan-500/15 px-2.5 py-1 text-xs font-semibold text-cyan-300">
      Available
    </span>
  );
}
