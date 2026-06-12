import { ExternalLink, FileText } from "lucide-react";

import type { AssignmentSubmission } from "./api";

export function SubmissionCard({ submission }: { submission: AssignmentSubmission }) {
  return (
    <section className="rounded-[20px] border border-white/10 bg-white/[0.06] p-5 shadow-[0_16px_40px_rgba(0,0,0,0.20)]">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-[Poppins] text-xl font-semibold text-[#F8FAFC]">Submission</h2>
        <span className="rounded-2xl border border-[#10B981]/30 bg-[#10B981]/12 px-3 py-1 text-sm font-semibold text-[#6EE7B7]">
          {submission.status}
        </span>
      </div>
      {submission.submission_text && <p className="mt-4 whitespace-pre-line leading-7 text-[#CBD5E1]">{submission.submission_text}</p>}
      {submission.files.length > 0 && (
        <div className="mt-4 space-y-2">
          {submission.files.map((file) => (
            <a
              key={file.id}
              href={file.file_url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#111827]/72 px-4 py-3 text-sm font-semibold text-[#CBD5E1]"
            >
              <span className="min-w-0 truncate">
                <FileText className="mr-2 inline h-4 w-4 text-[#A855F7]" aria-hidden="true" />
                {file.file_name}
              </span>
              <ExternalLink className="h-4 w-4 shrink-0" aria-hidden="true" />
            </a>
          ))}
        </div>
      )}
    </section>
  );
}
