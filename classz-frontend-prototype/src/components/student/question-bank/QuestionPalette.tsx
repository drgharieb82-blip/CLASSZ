import { Bookmark, CheckCircle2, X, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PaletteQuestionState {
  status: "unanswered" | "correct" | "wrong";
  bookmarked: boolean;
}

interface Props {
  open: boolean;
  onClose: () => void;
  questions: PaletteQuestionState[];
  currentIdx: number;
  onJump: (idx: number) => void;
}

export function QuestionPalette({
  open,
  onClose,
  questions,
  currentIdx,
  onJump,
}: Props) {
  const unanswered = questions.filter((q) => q.status === "unanswered").length;
  const correct = questions.filter((q) => q.status === "correct").length;
  const wrong = questions.filter((q) => q.status === "wrong").length;

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={cn(
          "fixed right-0 top-0 z-50 flex h-full w-80 max-w-[90vw] flex-col border-l border-white/10 bg-[rgba(10,14,28,0.98)] shadow-2xl transition-transform duration-300",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h3 className="text-base font-semibold text-white">
            Question Palette
          </h3>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 border-b border-white/10 px-5 py-3">
          <LegendItem color="bg-white/10" label="Unanswered" count={unanswered} />
          <LegendItem color="bg-emerald-500/30" label="Correct" count={correct} />
          <LegendItem color="bg-red-500/30" label="Wrong" count={wrong} />
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className="grid grid-cols-5 gap-2">
            {questions.map((q, idx) => {
              const isCurrent = idx === currentIdx;
              let bg = "bg-white/10 text-slate-400";
              if (q.status === "correct")
                bg = "bg-emerald-500/20 text-emerald-300";
              if (q.status === "wrong") bg = "bg-red-500/20 text-red-300";

              return (
                <button
                  key={idx}
                  onClick={() => {
                    onJump(idx);
                    onClose();
                  }}
                  className={cn(
                    "relative grid h-10 w-full place-items-center rounded-xl text-sm font-semibold transition-all hover:scale-105",
                    bg,
                    isCurrent && "ring-2 ring-violet-500",
                  )}
                >
                  {idx + 1}
                  {q.bookmarked && (
                    <Bookmark className="absolute -right-0.5 -top-0.5 h-3 w-3 fill-amber-400 text-amber-400" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer summary */}
        <div className="border-t border-white/10 px-5 py-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">
              {correct + wrong} / {questions.length} answered
            </span>
            <span className="text-slate-400">
              {unanswered} remaining
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

function LegendItem({
  color,
  label,
  count,
}: {
  color: string;
  label: string;
  count: number;
}) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-slate-400">
      <span className={cn("h-3 w-3 rounded", color)} />
      {label}: {count}
    </div>
  );
}
