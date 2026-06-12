import { AlertTriangle } from "lucide-react";

type SubmitQuizDialogProps = {
  isOpen: boolean;
  answeredCount: number;
  totalQuestions: number;
  onCancel: () => void;
  onConfirm: () => void;
};

export function SubmitQuizDialog({
  isOpen,
  answeredCount,
  totalQuestions,
  onCancel,
  onConfirm,
}: SubmitQuizDialogProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/80 p-4 backdrop-blur">
      <section className="w-full max-w-md rounded-[20px] border border-white/10 bg-[#111827] p-6 shadow-[0_32px_90px_rgba(0,0,0,0.42)]">
        <AlertTriangle className="h-7 w-7 text-[#F59E0B]" aria-hidden="true" />
        <h2 className="mt-4 font-[Poppins] text-2xl font-semibold text-[#F8FAFC]">Submit quiz?</h2>
        <p className="mt-3 leading-7 text-[#CBD5E1]">
          You answered {answeredCount} of {totalQuestions} questions. This foundation only records submission status.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-3 text-sm font-semibold text-[#CBD5E1] hover:bg-white/[0.10]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-2xl bg-gradient-to-br from-[#7C3AED] via-[#9333EA] to-[#A855F7] px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(124,58,237,0.28)] hover:brightness-110"
          >
            Submit Quiz
          </button>
        </div>
      </section>
    </div>
  );
}
