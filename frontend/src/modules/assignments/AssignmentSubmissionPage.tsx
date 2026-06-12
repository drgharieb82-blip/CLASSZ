import { useMutation, useQuery } from "@tanstack/react-query";
import { AlertCircle, Send } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";

import { DeadlineBadge } from "./DeadlineBadge";
import { FileUploader } from "./FileUploader";
import type { SubmissionFileDraft } from "./api";
import { getAssignment, submitAssignment } from "./api";

const demoStudentId = "00000000-0000-0000-0000-000000000001";

export function AssignmentSubmissionPage() {
  const { assignmentId } = useParams();
  const { t } = useTranslation();
  const [submissionText, setSubmissionText] = useState("");
  const [files, setFiles] = useState<SubmissionFileDraft[]>([]);

  const { data: assignment, isError, isLoading } = useQuery({
    queryKey: ["assignment", assignmentId],
    queryFn: () => getAssignment(assignmentId ?? ""),
    enabled: Boolean(assignmentId),
  });

  const submitMutation = useMutation({
    mutationFn: () =>
      submitAssignment(assignmentId ?? "", {
        student_id: demoStudentId,
        submission_text: submissionText,
        files,
      }),
  });

  if (isLoading) {
    return <div className="h-96 animate-pulse rounded-[20px] bg-white/[0.06]" />;
  }

  if (isError || !assignment) {
    return (
      <section className="rounded-[20px] border border-[#EF4444]/30 bg-[#EF4444]/10 p-8 text-[#FCA5A5]">
        <AlertCircle className="mb-3 h-6 w-6" aria-hidden="true" />
        {t("assignments.submitLoadError")}
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <Link to={`/assignments/${assignment.id}`} className="text-sm font-semibold text-[#A855F7] transition hover:text-[#C084FC]">
        {t("assignments.backToAssignment")}
      </Link>
      <section className="rounded-[20px] border border-white/10 bg-[#111827]/88 p-6 shadow-[0_24px_70px_rgba(0,0,0,0.30)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="font-[Poppins] text-4xl font-semibold text-[#F8FAFC]">{assignment.title}</h1>
            <p className="mt-3 text-[#CBD5E1]">{t("assignments.writeAnswer")}</p>
          </div>
          <DeadlineBadge deadlineAt={assignment.deadline_at} />
        </div>
      </section>

      <section className="rounded-[20px] border border-white/10 bg-white/[0.06] p-5 shadow-[0_16px_40px_rgba(0,0,0,0.20)]">
        <label className="text-sm font-semibold text-[#CBD5E1]" htmlFor="submission-text">
          {t("assignments.answerText")}
        </label>
        <textarea
          id="submission-text"
          value={submissionText}
          onChange={(event) => setSubmissionText(event.target.value)}
          rows={9}
          className="mt-3 w-full rounded-[20px] border border-white/10 bg-[#0F172A] p-4 text-sm leading-7 text-[#F8FAFC] outline-none focus:ring-2 focus:ring-[#A855F7]"
          placeholder={t("assignments.answerPlaceholder")}
        />
      </section>

      <FileUploader files={files} onFilesChange={setFiles} />

      <button
        type="button"
        onClick={() => submitMutation.mutate()}
        disabled={submitMutation.isPending}
        className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-[#7C3AED] via-[#9333EA] to-[#A855F7] px-6 py-3 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(124,58,237,0.28)] disabled:opacity-60"
      >
        {t("assignments.submitAssignment")}
        <Send className="h-4 w-4" aria-hidden="true" />
      </button>

      {submitMutation.isSuccess && (
        <section className="rounded-[20px] border border-[#10B981]/30 bg-[#10B981]/10 p-5 text-[#6EE7B7]">
          {t("assignments.submittedNotice")}
        </section>
      )}
    </div>
  );
}
