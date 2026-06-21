import { useState, useMemo } from "react";
import {
  ArrowLeft,
  Bookmark,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Filter,
  Printer,
  RotateCcw,
  Search,
  StickyNote,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GradientButton } from "@/components/premium/GradientButton";
import type { WrongQuestion } from "@/lib/wrongQuestionsMock";

type SortKey = "newest" | "oldest" | "most-retried";
type DifficultyFilter = "all" | "Easy" | "Medium" | "Hard";
type SourceFilter = "all" | "quiz" | "practice" | "chapter-exam" | "final-exam";
type RetryFilter = "all" | "corrected" | "still-wrong" | "not-retried";

interface Props {
  subjectName: string;
  subjectEmoji: string;
  subjectColor: string;
  questions: WrongQuestion[];
  onBack: () => void;
  onRetryQuestions: (ids: string[]) => void;
  onPrint: (questions: WrongQuestion[]) => void;
  onToggleBookmark: (id: string) => void;
  onUpdateNotes: (id: string, notes: string) => void;
}

const sourceLabels: Record<string, string> = {
  quiz: "Quiz",
  practice: "Practice",
  "chapter-exam": "Chapter Exam",
  "final-exam": "Final Exam",
};

const diffColor = {
  Easy: "text-emerald-400 border-emerald-500/30 bg-emerald-500/15",
  Medium: "text-amber-400 border-amber-500/30 bg-amber-500/15",
  Hard: "text-red-400 border-red-500/30 bg-red-500/15",
};

export function WrongQSubjectDetail({
  subjectName,
  subjectEmoji,
  subjectColor,
  questions,
  onBack,
  onRetryQuestions,
  onPrint,
  onToggleBookmark,
  onUpdateNotes,
}: Props) {
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState<DifficultyFilter>("all");
  const [source, setSource] = useState<SourceFilter>("all");
  const [retryFilter, setRetryFilter] = useState<RetryFilter>("all");
  const [sort, setSort] = useState<SortKey>("newest");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [noteEditId, setNoteEditId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    let list = [...questions];

    if (search.trim()) {
      const s = search.toLowerCase();
      list = list.filter(
        (q) =>
          q.body.toLowerCase().includes(s) ||
          q.conceptName.toLowerCase().includes(s) ||
          q.chapterName.toLowerCase().includes(s) ||
          q.lessonName.toLowerCase().includes(s) ||
          q.atomicConcept.toLowerCase().includes(s),
      );
    }

    if (difficulty !== "all") list = list.filter((q) => q.difficulty === difficulty);
    if (source !== "all") list = list.filter((q) => q.source === source);
    if (retryFilter === "corrected") list = list.filter((q) => q.retryCorrected);
    if (retryFilter === "still-wrong") list = list.filter((q) => !q.retryCorrected && q.retryCount > 0);
    if (retryFilter === "not-retried") list = list.filter((q) => q.retryCount === 0);

    list.sort((a, b) => {
      if (sort === "newest") return b.dateAnsweredWrong.localeCompare(a.dateAnsweredWrong);
      if (sort === "oldest") return a.dateAnsweredWrong.localeCompare(b.dateAnsweredWrong);
      return b.retryCount - a.retryCount;
    });

    return list;
  }, [questions, search, difficulty, source, retryFilter, sort]);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-4">
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
            subjectColor,
          )}
        >
          {subjectEmoji}
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">
            {subjectName} — Wrong Questions
          </h2>
          <p className="text-sm text-slate-400">
            {filtered.length} question{filtered.length !== 1 ? "s" : ""}
            {filtered.length !== questions.length &&
              ` (filtered from ${questions.length})`}
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        {/* Search + action buttons */}
        <div className="flex flex-wrap gap-2">
          <div className="relative min-w-0 flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search questions, concepts, chapters..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-full rounded-xl border border-white/10 bg-white/[0.03] pl-9 pr-3 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-violet-500/40"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "inline-flex h-9 items-center gap-1.5 rounded-xl border px-3 text-sm font-medium transition-colors",
              showFilters
                ? "border-violet-500/40 bg-violet-500/15 text-violet-300"
                : "border-white/10 bg-white/[0.03] text-slate-400 hover:text-slate-200",
            )}
          >
            <Filter className="h-3.5 w-3.5" /> Filters
          </button>
          <GradientButton
            variant="outline"
            size="sm"
            onClick={() => onPrint(filtered)}
          >
            <Printer className="h-3.5 w-3.5" /> Print
          </GradientButton>
          <GradientButton
            size="sm"
            disabled={filtered.length === 0}
            onClick={() => onRetryQuestions(filtered.map((q) => q.id))}
          >
            <RotateCcw className="h-3.5 w-3.5" /> Retry All ({filtered.length})
          </GradientButton>
        </div>

        {/* Filter row */}
        {showFilters && (
          <div className="flex flex-wrap gap-2 border-t border-white/10 pt-3">
            <FilterSelect
              label="Difficulty"
              value={difficulty}
              onChange={(v) => setDifficulty(v as DifficultyFilter)}
              options={[
                { value: "all", label: "All" },
                { value: "Easy", label: "Easy" },
                { value: "Medium", label: "Medium" },
                { value: "Hard", label: "Hard" },
              ]}
            />
            <FilterSelect
              label="Source"
              value={source}
              onChange={(v) => setSource(v as SourceFilter)}
              options={[
                { value: "all", label: "All" },
                { value: "quiz", label: "Quiz" },
                { value: "practice", label: "Practice" },
                { value: "chapter-exam", label: "Chapter Exam" },
                { value: "final-exam", label: "Final Exam" },
              ]}
            />
            <FilterSelect
              label="Retry"
              value={retryFilter}
              onChange={(v) => setRetryFilter(v as RetryFilter)}
              options={[
                { value: "all", label: "All" },
                { value: "corrected", label: "Corrected" },
                { value: "still-wrong", label: "Still Wrong" },
                { value: "not-retried", label: "Not Retried" },
              ]}
            />
            <FilterSelect
              label="Sort"
              value={sort}
              onChange={(v) => setSort(v as SortKey)}
              options={[
                { value: "newest", label: "Newest" },
                { value: "oldest", label: "Oldest" },
                { value: "most-retried", label: "Most Retried" },
              ]}
            />
          </div>
        )}
      </div>

      {/* Questions list */}
      {filtered.length === 0 ? (
        <div className="rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,24,42,0.96),rgba(10,14,28,0.92))] p-8 text-center shadow-lg">
          <CheckCircle2 className="mx-auto h-10 w-10 text-slate-600" />
          <p className="mt-3 text-lg font-semibold text-slate-300">
            No matching questions
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Try adjusting your filters or search query.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((q, idx) => {
            const isExpanded = expandedIds.has(q.id);
            const isEditingNotes = noteEditId === q.id;

            return (
              <div
                key={q.id}
                className="overflow-hidden rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,24,42,0.96),rgba(10,14,28,0.92))] shadow-lg"
              >
                {/* Card header */}
                <div className="p-5">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span
                        className={cn(
                          "mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg text-xs font-bold",
                          q.retryCorrected
                            ? "bg-emerald-500/15 text-emerald-300"
                            : "bg-red-500/15 text-red-300",
                        )}
                      >
                        {idx + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm leading-relaxed text-slate-200">
                          {q.body}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <button
                        onClick={() => onToggleBookmark(q.id)}
                        className={cn(
                          "grid h-7 w-7 place-items-center rounded-lg transition-colors",
                          q.bookmarked
                            ? "bg-amber-500/15 text-amber-400"
                            : "text-slate-600 hover:text-slate-400",
                        )}
                      >
                        <Bookmark
                          className={cn(
                            "h-3.5 w-3.5",
                            q.bookmarked && "fill-amber-400",
                          )}
                        />
                      </button>
                      <button
                        onClick={() => toggleExpand(q.id)}
                        className="grid h-7 w-7 place-items-center rounded-lg text-slate-500 transition-colors hover:text-slate-300"
                      >
                        {isExpanded ? (
                          <EyeOff className="h-3.5 w-3.5" />
                        ) : (
                          <Eye className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-1.5">
                    <span
                      className={cn(
                        "rounded-full border px-2 py-0.5 text-[10px] font-semibold",
                        diffColor[q.difficulty],
                      )}
                    >
                      {q.difficulty}
                    </span>
                    <Badge>{sourceLabels[q.source] ?? q.source}</Badge>
                    <Badge>{q.type.toUpperCase()}</Badge>
                    {q.retryCorrected ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                        <CheckCircle2 className="h-2.5 w-2.5" /> Corrected
                      </span>
                    ) : q.retryCount > 0 ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-red-500/30 bg-red-500/15 px-2 py-0.5 text-[10px] font-semibold text-red-300">
                        <XCircle className="h-2.5 w-2.5" /> Still Wrong
                      </span>
                    ) : (
                      <Badge>Not Retried</Badge>
                    )}
                    {q.retryCount > 0 && (
                      <Badge>
                        <RotateCcw className="mr-0.5 inline h-2.5 w-2.5" />
                        {q.retryCount}x
                      </Badge>
                    )}
                  </div>

                  {/* Metadata line */}
                  <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-500">
                    <span>{q.courseName}</span>
                    <span>Ch: {q.chapterName}</span>
                    <span>Ls: {q.lessonName}</span>
                    <span>{q.conceptName}</span>
                    <span>{q.dateAnsweredWrong}</span>
                  </div>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="space-y-3 border-t border-white/10 bg-white/[0.01] p-5">
                    {/* Atomic concept */}
                    <MetaRow label="Atomic Concept" value={q.atomicConcept} />
                    <MetaRow label="Concept" value={q.conceptName} />

                    {/* Student answer vs correct */}
                    <div className="grid gap-2 sm:grid-cols-2">
                      <div className="rounded-xl border border-red-500/15 bg-red-500/[0.04] px-4 py-3">
                        <p className="mb-1 text-xs font-semibold text-red-400">
                          Your Answer
                        </p>
                        <p className="text-sm text-slate-200">
                          {q.type === "mcq" && q.options
                            ? `${String.fromCharCode(65 + (q.studentAnswer as number))}. ${q.options[q.studentAnswer as number]}`
                            : String(q.studentAnswer)}
                        </p>
                      </div>
                      <div className="rounded-xl border border-emerald-500/15 bg-emerald-500/[0.04] px-4 py-3">
                        <p className="mb-1 text-xs font-semibold text-emerald-400">
                          Correct Answer
                        </p>
                        <p className="text-sm text-slate-200">
                          {q.type === "mcq" && q.options
                            ? `${String.fromCharCode(65 + (q.correctAnswer as number))}. ${q.options[q.correctAnswer as number]}`
                            : String(q.correctAnswer)}
                        </p>
                      </div>
                    </div>

                    {/* Explanation */}
                    <div className="rounded-xl border border-white/8 bg-white/[0.02] px-4 py-3">
                      <p className="mb-1 text-xs font-semibold text-cyan-400">
                        Explanation
                      </p>
                      <p className="text-sm leading-relaxed text-slate-300">
                        {q.explanation}
                      </p>
                    </div>

                    {/* Retry info */}
                    {q.retryCount > 0 && (
                      <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                        <span>Retried {q.retryCount}x</span>
                        {q.lastRetryDate && (
                          <span>Last retry: {q.lastRetryDate}</span>
                        )}
                        <span>
                          Status:{" "}
                          {q.retryCorrected ? (
                            <span className="text-emerald-400">Corrected</span>
                          ) : (
                            <span className="text-red-400">Still Wrong</span>
                          )}
                        </span>
                      </div>
                    )}

                    {/* Notes */}
                    <div className="rounded-xl border border-violet-500/15 bg-violet-500/[0.03] px-4 py-3">
                      <div className="mb-2 flex items-center justify-between">
                        <p className="flex items-center gap-1.5 text-xs font-semibold text-violet-400">
                          <StickyNote className="h-3 w-3" /> Notes
                        </p>
                        <button
                          onClick={() =>
                            setNoteEditId(isEditingNotes ? null : q.id)
                          }
                          className="text-xs text-violet-400 hover:text-violet-300"
                        >
                          {isEditingNotes ? "Done" : "Edit"}
                        </button>
                      </div>
                      {isEditingNotes ? (
                        <textarea
                          rows={2}
                          value={q.notes}
                          onChange={(e) => onUpdateNotes(q.id, e.target.value)}
                          className="w-full resize-y rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-violet-500/40"
                          placeholder="Add your notes..."
                        />
                      ) : (
                        <p className="text-sm text-slate-400">
                          {q.notes || "No notes yet"}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2">
                      <GradientButton
                        size="sm"
                        onClick={() => onRetryQuestions([q.id])}
                      >
                        <RotateCcw className="h-3.5 w-3.5" /> Retry
                      </GradientButton>
                      <GradientButton
                        variant="outline"
                        size="sm"
                        onClick={() => onPrint([q])}
                      >
                        <Printer className="h-3.5 w-3.5" /> Print
                      </GradientButton>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-white/10 bg-white/[0.05] px-2 py-0.5 text-[10px] font-semibold text-slate-400">
      {children}
    </span>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-slate-500">{label}:</span>
      <span className="text-slate-300">{value}</span>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-slate-500">{label}:</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 rounded-lg border border-white/10 bg-white/[0.05] px-2 text-xs text-slate-300 outline-none focus:border-violet-500/40"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
