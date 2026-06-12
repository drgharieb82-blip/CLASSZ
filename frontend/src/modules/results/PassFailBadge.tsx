import { AlertCircle, CheckCircle2 } from "lucide-react";

export function PassFailBadge({ passed }: { passed: boolean }) {
  const Icon = passed ? CheckCircle2 : AlertCircle;

  return (
    <span
      className={[
        "inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-semibold",
        passed
          ? "border-[#10B981]/30 bg-[#10B981]/12 text-[#6EE7B7]"
          : "border-[#EF4444]/30 bg-[#EF4444]/12 text-[#FCA5A5]",
      ].join(" ")}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      {passed ? "Pass" : "Fail"}
    </span>
  );
}
