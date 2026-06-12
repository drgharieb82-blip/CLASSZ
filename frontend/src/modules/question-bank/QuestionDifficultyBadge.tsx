import type { Difficulty } from "./api";

const difficultyStyles = {
  EASY: "border-[#10B981]/30 bg-[#10B981]/12 text-[#6EE7B7]",
  MEDIUM: "border-[#F59E0B]/30 bg-[#F59E0B]/12 text-[#FCD34D]",
  HARD: "border-[#EF4444]/30 bg-[#EF4444]/12 text-[#FCA5A5]",
} satisfies Record<Difficulty, string>;

export function QuestionDifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  return (
    <span
      className={[
        "inline-flex rounded-2xl border px-3 py-1 text-xs font-semibold",
        difficultyStyles[difficulty],
      ].join(" ")}
    >
      {difficulty}
    </span>
  );
}
