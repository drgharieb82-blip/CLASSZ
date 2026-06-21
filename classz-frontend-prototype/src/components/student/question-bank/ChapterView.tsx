import {
  ArrowLeft,
  BookOpen,
  Brain,
  Layers,
  Play,
  Shuffle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GradientButton } from "@/components/premium/GradientButton";
import type { QBChapter } from "@/lib/questionBankMock";

interface Props {
  chapter: QBChapter;
  chapterIndex: number;
  subjectName: string;
  onBack: () => void;
  onPracticeConcept: (conceptId: string) => void;
  onPracticeLesson: (lessonId: string) => void;
  onPracticeChapter: () => void;
}

export function ChapterView({
  chapter,
  chapterIndex,
  subjectName,
  onBack,
  onPracticeConcept,
  onPracticeLesson,
  onPracticeChapter,
}: Props) {
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
        <div>
          <p className="text-xs text-slate-500">
            {subjectName} / Chapter {chapterIndex + 1}
          </p>
          <h2 className="text-xl font-bold text-white">{chapter.title}</h2>
        </div>
      </div>

      {/* Chapter stats bar */}
      <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-3.5">
        <div className="flex items-center gap-2 text-sm text-slate-300">
          <BookOpen className="h-4 w-4 text-violet-400" />
          {chapter.lessons.length} lessons
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-300">
          <Layers className="h-4 w-4 text-cyan-400" />
          {chapter.lessons.reduce((a, l) => a + l.concepts.length, 0)} concepts
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-300">
          <Brain className="h-4 w-4 text-amber-400" />
          {chapter.totalQuestions} questions
        </div>
        <div className="ml-auto">
          <GradientButton size="sm" onClick={onPracticeChapter}>
            <Shuffle className="h-3.5 w-3.5" /> Practice All Chapter
          </GradientButton>
        </div>
      </div>

      {/* Lessons */}
      <div className="space-y-4">
        {chapter.lessons.map((lesson, li) => (
          <div
            key={lesson.id}
            className="overflow-hidden rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,24,42,0.96),rgba(10,14,28,0.92))] p-5 shadow-lg"
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-violet-400">
                  Lesson {li + 1}
                </p>
                <h4 className="mt-0.5 text-base font-semibold text-white">
                  {lesson.title}
                </h4>
              </div>
              <GradientButton
                variant="outline"
                size="sm"
                onClick={() => onPracticeLesson(lesson.id)}
              >
                <Shuffle className="h-3.5 w-3.5" /> Mixed Practice
              </GradientButton>
            </div>

            <div className="space-y-2">
              {lesson.concepts.map((concept) => (
                <div
                  key={concept.id}
                  className={cn(
                    "flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3",
                  )}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-200">
                      {concept.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {concept.questionCount} questions
                    </p>
                  </div>
                  <GradientButton
                    variant="outline"
                    size="sm"
                    onClick={() => onPracticeConcept(concept.id)}
                  >
                    <Play className="h-3.5 w-3.5" /> Practice
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
