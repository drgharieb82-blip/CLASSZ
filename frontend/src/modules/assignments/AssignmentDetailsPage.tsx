import { useQuery } from "@tanstack/react-query";
import { AlertCircle, Send } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { DeadlineBadge } from "./DeadlineBadge";
import { SubmissionCard } from "./SubmissionCard";
import { getAssignment } from "./api";

export function AssignmentDetailsPage() {
  const { assignmentId } = useParams();

  const { data: assignment, isError, isLoading } = useQuery({
    queryKey: ["assignment", assignmentId],
    queryFn: () => getAssignment(assignmentId ?? ""),
    enabled: Boolean(assignmentId),
  });

  if (isLoading) {
    return <div className="h-96 animate-pulse rounded-[20px] bg-white/[0.06]" />;
  }

  if (isError || !assignment) {
    return (
      <section className="rounded-[20px] border border-[#EF4444]/30 bg-[#EF4444]/10 p-8 text-[#FCA5A5]">
        <AlertCircle className="mb-3 h-6 w-6" aria-hidden="true" />
        Assignment could not be loaded.
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <Link to="/assignments" className="text-sm font-semibold text-[#A855F7] transition hover:text-[#C084FC]">
        Back to assignments
      </Link>
      <section className="rounded-[20px] border border-white/10 bg-[#111827]/88 p-6 shadow-[0_24px_70px_rgba(0,0,0,0.30)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="font-[Poppins] text-4xl font-semibold text-[#F8FAFC]">{assignment.title}</h1>
            <p className="mt-4 max-w-3xl whitespace-pre-line leading-7 text-[#CBD5E1]">
              {assignment.description ?? "No description provided."}
            </p>
          </div>
          <DeadlineBadge deadlineAt={assignment.deadline_at} />
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          <span className="rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-2 text-sm font-semibold text-[#CBD5E1]">
            {assignment.max_points} points
          </span>
          <span className="rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-2 text-sm font-semibold text-[#CBD5E1]">
            {assignment.allow_multiple_submissions ? "Multiple submissions allowed" : "Single submission"}
          </span>
        </div>
      </section>

      <Link
        to={`/assignments/${assignment.id}/submit`}
        className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-[#7C3AED] via-[#9333EA] to-[#A855F7] px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(124,58,237,0.28)]"
      >
        Submit assignment
        <Send className="h-4 w-4" aria-hidden="true" />
      </Link>

      {assignment.submissions.map((submission) => (
        <SubmissionCard key={submission.id} submission={submission} />
      ))}
    </div>
  );
}
