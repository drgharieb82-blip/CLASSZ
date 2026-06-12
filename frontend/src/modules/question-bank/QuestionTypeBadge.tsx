import { HelpCircle } from "lucide-react";

import { formatQuestionType, type QuestionType } from "./api";

export function QuestionTypeBadge({ questionType }: { questionType: QuestionType }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-2xl border border-[#A855F7]/35 bg-[#7C3AED]/16 px-3 py-1 text-xs font-semibold text-[#E9D5FF]">
      <HelpCircle className="h-3.5 w-3.5" aria-hidden="true" />
      {formatQuestionType(questionType)}
    </span>
  );
}
