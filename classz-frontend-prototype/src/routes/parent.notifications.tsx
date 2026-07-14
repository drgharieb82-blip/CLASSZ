import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Bell,
  BellOff,
  BookOpen,
  CheckCheck,
  Mail,
  RefreshCw,
  Search,
  Shield,
  Sparkles,
  Wallet,
} from "lucide-react";
import { useEffect, useMemo, useState, type ElementType } from "react";
import { DashPage } from "@/components/common/DashPage";
import { GradientButton } from "@/components/premium/GradientButton";
import { ROLES } from "@/lib/roles";
import { ApiError } from "@/lib/api/client";
import {
  listMyNotifications,
  markAllNotificationsRead,
  updateMyNotification,
  type NotificationRead,
  type NotificationSummaryRead,
} from "@/lib/api/notifications";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/parent/notifications")({
  component: NotificationsPage,
});

type FilterKey = "all" | "unread" | "important" | "urgent" | "wallet" | "enrollment" | "progress" | "material" | "certificate" | "system";

const categoryMeta: Record<string, { label: string; icon: ElementType; color: string; bg: string }> = {
  system: { label: "System", icon: Shield, color: "text-amber-300", bg: "bg-amber-500/15" },
  enrollment: { label: "Enrollment", icon: BookOpen, color: "text-violet-300", bg: "bg-violet-500/15" },
  wallet: { label: "Wallet", icon: Wallet, color: "text-emerald-300", bg: "bg-emerald-500/15" },
  progress: { label: "Progress", icon: Sparkles, color: "text-cyan-300", bg: "bg-cyan-500/15" },
  material: { label: "Materials", icon: Bell, color: "text-blue-300", bg: "bg-blue-500/15" },
  certificate: { label: "Certificates", icon: Mail, color: "text-pink-300", bg: "bg-pink-500/15" },
};

function NotificationsPage() {
  const [items, setItems] = useState<NotificationRead[]>([]);
  const [summary, setSummary] = useState<NotificationSummaryRead | null>(null);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = async () => {
    setLoading(true);
    try {
      const response = await listMyNotifications();
      setItems(response.items);
      setSummary(response.summary);
      setError("");
    } catch (err) {
      setError(extractDetail(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  const filtered = useMemo(() => {
    let list = [...items];
    if (filter === "unread") list = list.filter((item) => !item.is_read);
    else if (filter === "important") list = list.filter((item) => item.priority === "important");
    else if (filter === "urgent") list = list.filter((item) => item.priority === "urgent");
    else if (filter !== "all") list = list.filter((item) => item.category === filter);

    if (search.trim()) {
      const term = search.toLowerCase();
      list = list.filter(
        (item) =>
          item.title.toLowerCase().includes(term) ||
          item.body.toLowerCase().includes(term) ||
          (item.action_label?.toLowerCase().includes(term) ?? false),
      );
    }

    return list.sort((left, right) => right.created_at.localeCompare(left.created_at));
  }, [items, filter, search]);

  const totalCount = summary?.total_count ?? 0;
  const unreadCount = summary?.unread_count ?? 0;
  const importantCount = summary?.important_count ?? 0;
  const urgentCount = summary?.urgent_count ?? 0;

  return (
    <DashPage
      role="parent"
      title="Notifications"
      subtitle="Updates about your linked children and your own requests."
      icon={ROLES.parent.icon}
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.4 }}
        className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
      >
        <SummaryCard icon={Bell} label="Total" value={totalCount} />
        <SummaryCard icon={Mail} label="Unread" value={unreadCount} />
        <SummaryCard icon={RefreshCw} label="Important" value={importantCount} />
        <SummaryCard icon={Shield} label="Urgent" value={urgentCount} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08, duration: 0.4 }}
        className="space-y-4"
      >
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-0 flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search notifications..."
              className="h-10 w-full rounded-xl border border-white/10 bg-white/[0.03] pl-9 pr-3 text-sm text-slate-200 outline-none focus:border-violet-500/40"
            />
          </div>
          <GradientButton variant="outline" size="sm" onClick={() => void refresh()}>
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </GradientButton>
          {unreadCount > 0 && (
            <GradientButton
              size="sm"
              onClick={async () => {
                await markAllNotificationsRead();
                await refresh();
              }}
            >
              <CheckCheck className="h-3.5 w-3.5" /> Mark all read
            </GradientButton>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {[
            ["all", "All"],
            ["unread", "Unread"],
            ["important", "Important"],
            ["urgent", "Urgent"],
            ["wallet", "Wallet"],
            ["enrollment", "Enrollments"],
            ["progress", "Progress"],
            ["material", "Materials"],
            ["certificate", "Certificates"],
            ["system", "System"],
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilter(key as FilterKey)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                filter === key
                  ? "border-violet-500/40 bg-violet-500/15 text-violet-200"
                  : "border-white/10 bg-white/[0.03] text-slate-400 hover:text-slate-200",
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-sm text-slate-400">
            Loading notifications...
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,24,42,0.96),rgba(10,14,28,0.92))] p-10 text-center shadow-lg">
            <BellOff className="mx-auto h-10 w-10 text-slate-600" />
            <p className="mt-3 text-lg font-semibold text-slate-300">No notifications match your filters.</p>
            <p className="mt-1 text-sm text-slate-500">Updates about your children and requests will appear here.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((item) => {
              const meta = categoryMeta[item.category] ?? categoryMeta.system;
              const Icon = meta.icon;

              return (
                <div
                  key={item.id}
                  className={cn(
                    "rounded-[22px] border bg-[linear-gradient(180deg,rgba(18,24,42,0.96),rgba(10,14,28,0.92))] p-4 shadow-lg",
                    item.is_read ? "border-white/8" : "border-violet-500/20 ring-1 ring-violet-500/15",
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-2xl", meta.bg)}>
                      <Icon className={cn("h-5 w-5", meta.color)} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span className={cn("font-semibold", meta.color)}>{meta.label}</span>
                        <span>·</span>
                        <span>{formatTime(item.created_at)}</span>
                        {item.priority !== "normal" && (
                          <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-red-300">
                            {item.priority}
                          </span>
                        )}
                        {!item.is_read && <span className="rounded-full bg-violet-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-violet-200">Unread</span>}
                      </div>
                      <p className="mt-1 text-sm font-semibold text-white">{item.title}</p>
                      <p className="mt-1 text-sm leading-relaxed text-slate-300">{item.body}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {!item.is_read && (
                          <GradientButton
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                              await updateMyNotification(item.id, { is_read: true });
                              await refresh();
                            }}
                          >
                            <Mail className="h-3.5 w-3.5" /> Mark read
                          </GradientButton>
                        )}
                        {!item.is_archived && (
                          <GradientButton
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                              await updateMyNotification(item.id, { is_archived: true });
                              await refresh();
                            }}
                          >
                            Archive
                          </GradientButton>
                        )}
                        {item.action_url && (
                          item.action_url.startsWith("/") ? (
                            <Link to={item.action_url as never} className="inline-flex items-center gap-1 rounded-xl bg-violet-500/10 px-3 py-2 text-sm font-medium text-violet-200 hover:bg-violet-500/20">
                              {item.action_label ?? "Open"}
                            </Link>
                          ) : (
                            <a href={item.action_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-xl bg-violet-500/10 px-3 py-2 text-sm font-medium text-violet-200 hover:bg-violet-500/20">
                              {item.action_label ?? "Open"}
                            </a>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </DashPage>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
}: {
  icon: ElementType;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,24,42,0.96),rgba(10,14,28,0.92))] p-5 shadow-lg">
      <div className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-violet-500/15">
        <Icon className="h-5 w-5 text-violet-300" />
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{label}</p>
    </div>
  );
}

function formatTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
}

function extractDetail(error: unknown): string {
  if (error instanceof ApiError && typeof error.body === "object" && error.body !== null && "detail" in error.body) {
    return String((error.body as { detail: string }).detail);
  }
  return "Unable to load notifications.";
}
