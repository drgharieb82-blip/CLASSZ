import {
  AlertTriangle,
  ArrowLeft,
  Bookmark,
  Play,
  RotateCcw,
  Trash2,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GradientButton } from "@/components/premium/GradientButton";
import type { QBQuestion } from "@/lib/questionBankMock";

export interface SavedWrongQuestion {
  question: QBQuestion;
  studentAnswer: number | string;
  bookmarked: boolean;
}

interface Props {
  wrongQuestions: SavedWrongQuestion[];
  onBack: () => void;
  onRetryAll: () => void;
  onRetryBookmarked: () => void;
  onClear: () => void;
}

export function WrongQuestionsView({
  wrongQuestions,
  onBack,
  onRetryAll,
  onRetryBookmarked,
  onClear,
}: Props) {
  const bookmarkedCount = wrongQuestions.filter((q) => q.bookmarked).length;

  const diffColor = {
    Easy: "text-emerald-400",
    Medium: "text-amber-400",
    Hard: "text-red-400",
  };

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
        <div className="flex items-center gap-2">
          <XCircle className="h-5 w-5 text-red-400" />
          <h2 className="text-xl font-bold text-white">Wrong Questions</h2>
        </div>
        <span className="ml-auto rounded-full border border-red-500/30 bg-red-500/15 px-3 py-1 text-xs font-semibold text-red-300">
          {wrongQuestions.length} questions
        </span>
      </div>

      {wrongQuestions.length === 0 ? (
        <div className="rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,24,42,0.96),rgba(10,14,28,0.92))] p-8 text-center shadow-lg">
          <AlertTriangle className="mx-auto h-10 w-10 text-slate-600" />
          <p className="mt-3 text-lg font-semibold text-slate-300">
            No wrong questions yet
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Questions you answer incorrectly will appear here for review.
          </p>
        </div>
      ) : (
        <>
          {/* Action bar */}
          <div className="flex flex-wrap gap-2">
            <GradientButton size="sm" onClick={onRetryAll}>
              <RotateCcw className="h-3.5 w-3.5" /> Retry All (
              {wrongQuestions.length})
            </GradientButton>
            {bookmarkedCount > 0 && (
              <GradientButton
                variant="outline"
                size="sm"
                onClick={onRetryBookmarked}
              >
                <Bookmark className="h-3.5 w-3.5" /> Retry Bookmarked (
                {bookmarkedCount})
              </GradientButton>
            )}
            <GradientButton
              variant="ghost"
              size="sm"
              className="ml-auto text-slate-400"
              onClick={onClear}
            >
              <Trash2 className="h-3.5 w-3.5" /> Clear All
            </GradientButton>
          </div>

          {/* Question list */}
          <div className="space-y-3">
            {wrongQuestions.map((wq, idx) => (
              <div
                key={wq.question.id}
                className="overflow-hidden rounded-[18px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,24,42,0.96),rgba(10,14,28,0.92))] p-4 shadow-lg"
              >
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-red-500/15 text-xs font-bold text-red-300">
                    {idx + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm text-slate-200">
                      {wq.question.body}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs">
                      <span
                        className={cn(
                          "font-medium",
                          diffColor[wq.question.difficulty],
                        )}
                      >
                        {wq.question.difficulty}
                      </span>
                      <span className="text-slate-500">
                        {wq.question.relatedConcept}
                      </span>
                      <span className="capitalize text-slate-500">
                        {wq.question.type}
                      </span>
                    </div>
                  </div>
                  {wq.bookmarked && (
                    <Bookmark className="h-4 w-4 shrink-0 fill-amber-400 text-amber-400" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
