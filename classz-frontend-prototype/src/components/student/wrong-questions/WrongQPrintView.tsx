import { ArrowLeft, Printer } from "lucide-react";
import { GradientButton } from "@/components/premium/GradientButton";
import type { WrongQuestion } from "@/lib/wrongQuestionsMock";

interface Props {
  questions: WrongQuestion[];
  onBack: () => void;
}

export function WrongQPrintView({ questions, onBack }: Props) {
  const handlePrint = () => window.print();

  return (
    <div className="space-y-4">
      {/* Screen-only controls */}
      <div className="flex items-center gap-3 print:hidden">
        <button
          onClick={onBack}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-white">Print Preview</h2>
          <p className="text-sm text-slate-400">
            {questions.length} question{questions.length !== 1 ? "s" : ""}
          </p>
        </div>
        <GradientButton size="sm" onClick={handlePrint}>
          <Printer className="h-3.5 w-3.5" /> Print
        </GradientButton>
      </div>

      {/* Printable content */}
      <div className="space-y-4 print:space-y-6 print:text-black">
        {/* Print header */}
        <div className="hidden print:block">
          <h1 className="text-2xl font-bold">
            CLASSZ — Wrong Questions Review
          </h1>
          <p className="text-sm text-gray-600">
            {questions.length} questions · Printed{" "}
            {new Date().toLocaleDateString()}
          </p>
          <hr className="mt-2" />
        </div>

        {questions.map((q, idx) => (
          <div
            key={q.id}
            className="overflow-hidden rounded-[18px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,24,42,0.96),rgba(10,14,28,0.92))] p-5 shadow-lg print:rounded-none print:border print:border-gray-300 print:bg-white print:shadow-none"
          >
            {/* Question number + body */}
            <div className="mb-3 flex items-start gap-3">
              <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-violet-500/15 text-xs font-bold text-violet-300 print:bg-gray-200 print:text-gray-700">
                {idx + 1}
              </span>
              <p className="text-sm leading-relaxed text-slate-200 print:text-black">
                {q.body}
              </p>
            </div>

            {/* MCQ options */}
            {q.type === "mcq" && q.options && (
              <div className="mb-3 ml-10 space-y-1">
                {q.options.map((opt, oi) => (
                  <p
                    key={oi}
                    className="text-sm text-slate-400 print:text-gray-600"
                  >
                    {String.fromCharCode(65 + oi)}. {opt}
                  </p>
                ))}
              </div>
            )}

            {/* Answers + metadata */}
            <div className="ml-10 space-y-2 border-t border-white/10 pt-3 text-sm print:border-gray-200">
              <div className="flex gap-6">
                <div>
                  <span className="text-xs font-semibold text-red-400 print:text-red-600">
                    Your Answer:{" "}
                  </span>
                  <span className="text-slate-300 print:text-black">
                    {q.type === "mcq" && q.options
                      ? `${String.fromCharCode(65 + (q.studentAnswer as number))}. ${q.options[q.studentAnswer as number]}`
                      : String(q.studentAnswer)}
                  </span>
                </div>
                <div>
                  <span className="text-xs font-semibold text-emerald-400 print:text-green-600">
                    Correct:{" "}
                  </span>
                  <span className="text-slate-300 print:text-black">
                    {q.type === "mcq" && q.options
                      ? `${String.fromCharCode(65 + (q.correctAnswer as number))}. ${q.options[q.correctAnswer as number]}`
                      : String(q.correctAnswer)}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold text-cyan-400 print:text-blue-600">
                  Explanation:{" "}
                </span>
                <span className="text-slate-400 print:text-gray-700">
                  {q.explanation}
                </span>
              </div>

              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 print:text-gray-500">
                <span>Course: {q.courseName}</span>
                <span>Chapter: {q.chapterName}</span>
                <span>Lesson: {q.lessonName}</span>
                <span>Concept: {q.conceptName}</span>
                <span>Atomic: {q.atomicConcept}</span>
                <span>Difficulty: {q.difficulty}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
