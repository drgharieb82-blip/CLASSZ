import { Gauge } from "lucide-react";

import type { TeacherPendingTask } from "./api";

export function GradingWorkloadCard({ tasks }: { tasks: TeacherPendingTask[] }) {
  const essayCount = tasks.filter((task) => task.task_type === "ESSAY").length;
  const assignmentCount = tasks.filter((task) => task.task_type === "ASSIGNMENT").length;
  const totalPoints = tasks.reduce((sum, task) => sum + task.max_score, 0);

  return (
    <section className="rounded-[20px] border border-white/10 bg-[#111827]/88 p-5 shadow-[0_16px_40px_rgba(0,0,0,0.20)]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#A855F7]">Workload</p>
          <h2 className="mt-2 font-[Poppins] text-2xl font-semibold text-[#F8FAFC]">Grading workload</h2>
        </div>
        <Gauge className="h-6 w-6 text-[#3B82F6]" aria-hidden="true" />
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <Metric label="Essays" value={essayCount} />
        <Metric label="Assignments" value={assignmentCount} />
        <Metric label="Points waiting" value={totalPoints} />
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[20px] border border-white/10 bg-white/[0.06] p-4">
      <p className="text-sm text-[#94A3B8]">{label}</p>
      <p className="mt-2 font-[Poppins] text-2xl font-semibold text-[#F8FAFC]">{value}</p>
    </div>
  );
}
