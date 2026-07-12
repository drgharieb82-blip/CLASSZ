import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { UserPlus } from "lucide-react";
import { GradientButton } from "@/components/premium/GradientButton";
import { listLinkedChildren, type LinkedChildRead } from "@/lib/api/parents";
import { useParentSelectedChildStore } from "@/lib/stores/parent-selected-child-store";
import { cn } from "@/lib/utils";

/** Fetches the parent's linked children, keeps the shared selected-child
 * store in sync, and renders a pill switcher. Every parent page that shows
 * per-child data renders this at the top and reads `useParentSelectedChildStore`
 * for which child is currently active. */
export function ChildSwitcher() {
  const [children, setChildren] = useState<LinkedChildRead[]>([]);
  const [loading, setLoading] = useState(true);
  const selectedChildId = useParentSelectedChildStore((s) => s.selectedChildId);
  const setSelectedChildId = useParentSelectedChildStore((s) => s.setSelectedChildId);

  useEffect(() => {
    void (async () => {
      try {
        const all = await listLinkedChildren();
        const active = all.filter((child) => child.status === "active");
        setChildren(active);
        if (active.length > 0 && !active.some((child) => child.student_id === selectedChildId)) {
          setSelectedChildId(active[0].student_id);
        } else if (active.length === 0) {
          setSelectedChildId(null);
        }
      } finally {
        setLoading(false);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    })();
  }, []);

  if (loading) {
    return <div className="h-11 w-full animate-pulse rounded-xl bg-white/[0.04]" />;
  }

  if (children.length === 0) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <p className="text-sm text-slate-300">You don't have any linked children yet.</p>
        <GradientButton asChild size="sm">
          <Link to="/parent/link-child">
            <UserPlus className="h-3.5 w-3.5" /> Link a child
          </Link>
        </GradientButton>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {children.map((child) => (
        <button
          key={child.student_id}
          onClick={() => setSelectedChildId(child.student_id)}
          className={cn(
            "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
            selectedChildId === child.student_id
              ? "border-violet-500/40 bg-violet-500/15 text-violet-200"
              : "border-white/10 bg-white/[0.03] text-slate-400 hover:text-slate-200",
          )}
        >
          {child.full_name}
        </button>
      ))}
    </div>
  );
}
