import { FileText, MessageSquareText, Paperclip } from "lucide-react";

import { QuestionMediaGallery } from "../question-bank/QuestionMediaGallery";
import type { ManualGrade } from "./api";

export function EssayReviewCard({ grade }: { grade: ManualGrade }) {
  const question = grade.question_result?.question;
  const assignment = grade.assignment_submission;

  if (assignment) {
    return (
      <section className="rounded-[20px] border border-white/10 bg-[#111827]/88 p-5 shadow-[0_16px_40px_rgba(0,0,0,0.20)]">
        <div className="flex items-center gap-3">
          <FileText className="h-5 w-5 text-[#A855F7]" aria-hidden="true" />
          <h2 className="font-[Poppins] text-xl font-semibold text-[#F8FAFC]">Assignment submission</h2>
        </div>
        <div className="mt-5 rounded-[20px] border border-white/10 bg-white/[0.06] p-4">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#94A3B8]">Student answer</p>
          <p className="mt-3 whitespace-pre-wrap leading-7 text-[#CBD5E1]">
            {assignment.submission_text || "No written answer was submitted."}
          </p>
        </div>

        {assignment.files.length > 0 && (
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {assignment.files.map((file) => (
              <a
                key={file.id}
                href={file.file_url}
                className="rounded-[20px] border border-white/10 bg-white/[0.06] p-4 transition hover:border-[#A855F7]/45"
              >
                <Paperclip className="h-5 w-5 text-[#3B82F6]" aria-hidden="true" />
                <p className="mt-3 font-semibold text-[#F8FAFC]">{file.file_name}</p>
                <p className="mt-1 text-sm text-[#94A3B8]">{formatFileSize(file.file_size)}</p>
              </a>
            ))}
          </div>
        )}
      </section>
    );
  }

  return (
    <section className="rounded-[20px] border border-white/10 bg-[#111827]/88 p-5 shadow-[0_16px_40px_rgba(0,0,0,0.20)]">
      <div className="flex items-center gap-3">
        <MessageSquareText className="h-5 w-5 text-[#A855F7]" aria-hidden="true" />
        <h2 className="font-[Poppins] text-xl font-semibold text-[#F8FAFC]">Essay review</h2>
      </div>
      <h3 className="mt-5 font-[Poppins] text-2xl font-semibold text-[#F8FAFC]">{question?.title ?? "Essay question"}</h3>

      {question?.media && question.media.length > 0 && (
        <div className="mt-5">
          <QuestionMediaGallery media={question.media} compact />
        </div>
      )}

      <div className="mt-5 rounded-[20px] border border-white/10 bg-white/[0.06] p-4">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#94A3B8]">Student answer</p>
        <p className="mt-3 whitespace-pre-wrap leading-7 text-[#CBD5E1]">{formatAnswer(grade.student_answer)}</p>
      </div>

      {question?.explanation && (
        <div className="mt-4 rounded-[20px] border border-[#3B82F6]/30 bg-[#3B82F6]/10 p-4">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#93C5FD]">Reference explanation</p>
          <p className="mt-3 leading-7 text-[#BFDBFE]">{question.explanation}</p>
        </div>
      )}
    </section>
  );
}

function formatAnswer(answer: Record<string, unknown> | null | undefined): string {
  if (!answer) {
    return "No answer was submitted.";
  }

  const essay = answer.essay ?? answer.text ?? answer.answer;
  if (typeof essay === "string" && essay.trim()) {
    return essay;
  }

  return JSON.stringify(answer, null, 2);
}

function formatFileSize(fileSize: number): string {
  if (fileSize < 1024) {
    return `${fileSize} B`;
  }

  if (fileSize < 1024 * 1024) {
    return `${Math.round(fileSize / 1024)} KB`;
  }

  return `${(fileSize / (1024 * 1024)).toFixed(1)} MB`;
}
