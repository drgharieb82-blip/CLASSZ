import type { Question } from "../question-bank/api";

type AnswerPanelProps = {
  question: Question;
  value: Record<string, unknown>;
  onChange: (value: Record<string, unknown>) => void;
};

export function AnswerPanel({ question, value, onChange }: AnswerPanelProps) {
  const selectedChoiceIds = Array.isArray(value.choice_ids) ? (value.choice_ids as string[]) : [];
  const selectedChoiceId = typeof value.choice_id === "string" ? value.choice_id : "";
  const textAnswer = typeof value.text === "string" ? value.text : "";

  if (question.question_type === "ESSAY" || question.question_type === "FILL_BLANK") {
    return (
      <textarea
        value={textAnswer}
        onChange={(event) => onChange({ text: event.target.value })}
        rows={7}
        className="mt-5 w-full rounded-[20px] border border-white/10 bg-[#0F172A] p-4 text-sm leading-7 text-[#F8FAFC] outline-none focus:ring-2 focus:ring-[#A855F7]"
        placeholder="Type your answer"
      />
    );
  }

  if (question.question_type === "MULTIPLE_SELECT") {
    return (
      <div className="mt-5 space-y-3">
        {question.choices.map((choice) => {
          const isChecked = selectedChoiceIds.includes(choice.id);
          return (
            <label key={choice.id} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.06] p-4 text-[#CBD5E1]">
              <input
                type="checkbox"
                checked={isChecked}
                onChange={(event) => {
                  const nextChoiceIds = event.target.checked
                    ? [...selectedChoiceIds, choice.id]
                    : selectedChoiceIds.filter((choiceId) => choiceId !== choice.id);
                  onChange({ choice_ids: nextChoiceIds });
                }}
                className="mt-1 h-4 w-4 accent-[#7C3AED]"
              />
              <span>{choice.choice_text}</span>
            </label>
          );
        })}
      </div>
    );
  }

  return (
    <div className="mt-5 space-y-3">
      {question.choices.map((choice) => (
        <label key={choice.id} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.06] p-4 text-[#CBD5E1]">
          <input
            type="radio"
            name={question.id}
            checked={selectedChoiceId === choice.id}
            onChange={() => onChange({ choice_id: choice.id })}
            className="mt-1 h-4 w-4 accent-[#7C3AED]"
          />
          <span>{choice.choice_text}</span>
        </label>
      ))}
      {question.choices.length === 0 && (
        <p className="rounded-2xl border border-dashed border-white/15 p-5 text-[#94A3B8]">
          Answer choices have not been attached to this question yet.
        </p>
      )}
    </div>
  );
}
