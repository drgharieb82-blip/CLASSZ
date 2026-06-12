import { useQuery } from "@tanstack/react-query";
import { AlertCircle, ClipboardList } from "lucide-react";

import { AssignmentCard } from "./AssignmentCard";
import { listAssignments } from "./api";

export function AssignmentsPage() {
  const { data: assignments = [], isError, isLoading } = useQuery({
    queryKey: ["assignments"],
    queryFn: listAssignments,
  });

  if (isLoading) {
    return <div className="h-96 animate-pulse rounded-[20px] bg-white/[0.06]" />;
  }

  if (isError) {
    return (
      <section className="rounded-[20px] border border-[#EF4444]/30 bg-[#EF4444]/10 p-8 text-[#FCA5A5]">
        <AlertCircle className="mb-3 h-6 w-6" aria-hidden="true" />
        Assignments could not be loaded.
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[20px] border border-white/10 bg-[#111827]/88 p-6 shadow-[0_24px_70px_rgba(0,0,0,0.30)]">
        <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-[#A855F7]">
          <ClipboardList className="h-4 w-4" aria-hidden="true" />
          Assignments
        </p>
        <h1 className="mt-3 font-[Poppins] text-4xl font-semibold text-[#F8FAFC]">Submission workspace</h1>
        <p className="mt-3 max-w-2xl leading-7 text-[#CBD5E1]">Review deadlines, read prompts, and submit assignment work.</p>
      </section>

      <section className="grid gap-4">
        {assignments.map((assignment) => (
          <AssignmentCard key={assignment.id} assignment={assignment} />
        ))}
      </section>
    </div>
  );
}
