import { ClipboardCheck } from "lucide-react";
import { Link } from "react-router-dom";

import type { TeacherPendingTask } from "./api";

export function PendingTasksPanel({ tasks }: { tasks: TeacherPendingTask[] }) {
  return (
    <section className="rounded-[20px] border border-white/10 bg-[#111827]/88 p-5 shadow-[0_16px_40px_rgba(0,0,0,0.20)]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#F59E0B]">Pending tasks</p>
          <h2 className="mt-2 font-[Poppins] text-2xl font-semibold text-[#F8FAFC]">Needs review</h2>
        </div>
        <ClipboardCheck className="h-6 w-6 text-[#F59E0B]" aria-hidden="true" />
      </div>

      <div className="mt-5 space-y-3">
        {tasks.length === 0 ? (
          <p className="rounded-[20px] border border-dashed border-white/15 bg-white/[0.06] p-5 text-sm text-[#94A3B8]">
            No grading tasks are waiting right now.
          </p>
        ) : (
          tasks.slice(0, 5).map((task) => (
            <Link key={task.id} to={`/grading/${task.id}`} className="block rounded-[20px] border border-white/10 bg-white/[0.06] p-4 transition hover:border-[#A855F7]/45">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#A855F7]">{task.task_type}</p>
                  <h3 className="mt-2 font-semibold text-[#F8FAFC]">{task.title}</h3>
                </div>
                <span className="rounded-2xl bg-[#3B82F6]/10 px-3 py-1 text-xs font-semibold text-[#BFDBFE]">
                  {task.max_score} pts
                </span>
              </div>
            </Link>
          ))
        )}
      </div>
    </section>
  );
}
