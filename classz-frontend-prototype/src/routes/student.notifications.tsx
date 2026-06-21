import { useState, useMemo, useCallback } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  BellOff,
  BookOpen,
  Check,
  CheckCheck,
  ChevronDown,
  ChevronUp,
  GraduationCap,
  Mail,
  MailOpen,
  MessageSquare,
  Pin,
  PinOff,
  Search,
  Send,
  Shield,
  Sparkles,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DashPage } from "@/components/common/DashPage";
import { GradientButton } from "@/components/premium/GradientButton";
import { ROLES } from "@/lib/roles";
import {
  initialNotifications,
  senderConfig,
  priorityConfig,
  type StudentNotification,
  type NotifSender,
} from "@/lib/notificationsMock";

export const Route = createFileRoute("/student/notifications")({
  component: NotificationsPage,
});

type FilterKey = "all" | "unread" | "needs-reply" | "urgent" | NotifSender;

const senderIcons: Record<NotifSender, React.ElementType> = {
  classz: Sparkles,
  teacher: GraduationCap,
  assistant: Users,
  parent: MessageSquare,
  system: Shield,
};

function NotificationsPage() {
  const [notifs, setNotifs] = useState<StudentNotification[]>(() => [...initialNotifications]);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [search, setSearch] = useState("");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  // ── Counts ──
  const totalCount = notifs.filter((n) => !n.archived).length;
  const unreadCount = notifs.filter((n) => !n.read && !n.archived).length;
  const needsReplyCount = notifs.filter((n) => n.replyAllowed && !n.replySent && !n.archived).length;
  const urgentCount = notifs.filter((n) => n.priority === "urgent" && !n.archived).length;

  // ── Filtered list ──
  const filtered = useMemo(() => {
    let list = notifs.filter((n) => !n.archived);

    if (filter === "unread") list = list.filter((n) => !n.read);
    else if (filter === "needs-reply") list = list.filter((n) => n.replyAllowed && !n.replySent);
    else if (filter === "urgent") list = list.filter((n) => n.priority === "urgent");
    else if (filter !== "all") list = list.filter((n) => n.sender === filter);

    if (search.trim()) {
      const s = search.toLowerCase();
      list = list.filter(
        (n) =>
          n.title.toLowerCase().includes(s) ||
          n.message.toLowerCase().includes(s) ||
          n.senderName.toLowerCase().includes(s) ||
          (n.course?.toLowerCase().includes(s) ?? false),
      );
    }

    list.sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return b.dateTime.localeCompare(a.dateTime);
    });

    return list;
  }, [notifs, filter, search]);

  // ── Actions ──
  const markRead = useCallback((id: string) => {
    setNotifs((p) => p.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const markAllRead = useCallback(() => {
    setNotifs((p) => p.map((n) => ({ ...n, read: true })));
  }, []);

  const togglePin = useCallback((id: string) => {
    setNotifs((p) => p.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n)));
  }, []);

  const archive = useCallback((id: string) => {
    setNotifs((p) => p.map((n) => (n.id === id ? { ...n, archived: true } : n)));
  }, []);

  const toggleExpand = useCallback((id: string) => {
    setExpandedIds((p) => {
      const s = new Set(p);
      if (s.has(id)) s.delete(id);
      else s.add(id);
      return s;
    });
  }, []);

  const sendReply = useCallback(() => {
    if (!replyingId || !replyText.trim()) return;
    setNotifs((p) =>
      p.map((n) =>
        n.id === replyingId ? { ...n, replySent: replyText.trim(), read: true } : n,
      ),
    );
    setReplyingId(null);
    setReplyText("");
  }, [replyingId, replyText]);

  const filters: { key: FilterKey; label: string; count?: number }[] = [
    { key: "all", label: "All", count: totalCount },
    { key: "unread", label: "Unread", count: unreadCount },
    { key: "needs-reply", label: "Needs Reply", count: needsReplyCount },
    { key: "urgent", label: "Urgent", count: urgentCount },
    { key: "classz", label: "CLASSZ" },
    { key: "teacher", label: "Teacher" },
    { key: "assistant", label: "Assistant" },
    { key: "parent", label: "Parent" },
    { key: "system", label: "System" },
  ];

  return (
    <DashPage
      role="student"
      title="Notifications Center"
      subtitle="Stay updated with CLASSZ, teachers, assistants, and parents"
      icon={ROLES.student.icon}
    >
      {/* ═══ SUMMARY CARDS ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.06, duration: 0.45 }}
        className="grid grid-cols-2 gap-3 lg:grid-cols-4"
      >
        <SummaryCard icon={Bell} label="Total" value={totalCount} color="text-violet-400" bg="bg-violet-500/15" />
        <SummaryCard icon={Mail} label="Unread" value={unreadCount} color="text-cyan-400" bg="bg-cyan-500/15" />
        <SummaryCard icon={MessageSquare} label="Needs Reply" value={needsReplyCount} color="text-amber-400" bg="bg-amber-500/15" />
        <SummaryCard icon={AlertTriangle} label="Urgent" value={urgentCount} color="text-red-400" bg="bg-red-500/15" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.45 }}
        className="space-y-4"
      >
        {/* ═══ TOOLBAR ═══ */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-0 flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notifications..."
              className="h-9 w-full rounded-xl border bg-card/60 pl-9 pr-3 text-sm outline-none focus:border-primary/40"
            />
          </div>
          {unreadCount > 0 && (
            <GradientButton variant="outline" size="sm" onClick={markAllRead}>
              <CheckCheck className="h-3.5 w-3.5" /> Mark All Read
            </GradientButton>
          )}
        </div>

        {/* ═══ FILTERS ═══ */}
        <div className="flex flex-wrap gap-1.5">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition-colors",
                filter === f.key
                  ? "border-violet-500/40 bg-violet-500/15 text-violet-200"
                  : "border-white/8 bg-white/[0.03] text-slate-400 hover:text-slate-200",
              )}
            >
              {f.label}
              {f.count !== undefined && (
                <span className="rounded-md bg-white/10 px-1.5 py-0.5 text-[10px] font-bold">
                  {f.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ═══ NOTIFICATION LIST ═══ */}
        {filtered.length === 0 ? (
          <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,24,42,0.96),rgba(10,14,28,0.92))] p-10 text-center shadow-lg">
            <BellOff className="mx-auto h-10 w-10 text-muted-foreground/40" />
            <p className="mt-3 text-lg font-semibold text-muted-foreground">
              {filter === "unread" ? "No unread notifications" : filter === "needs-reply" ? "No notifications needing reply" : "No notifications"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground/60">
              {filter === "all" ? "Notifications from teachers, assistants, and CLASSZ will appear here." : "Try changing your filter."}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((n) => {
              const cfg = senderConfig[n.sender];
              const pri = priorityConfig[n.priority];
              const SenderIcon = senderIcons[n.sender];
              const isExpanded = expandedIds.has(n.id);
              const isReplying = replyingId === n.id;

              return (
                <div
                  key={n.id}
                  className={cn(
                    "overflow-hidden rounded-[22px] border bg-[linear-gradient(180deg,rgba(18,24,42,0.96),rgba(10,14,28,0.92))] shadow-lg transition-colors",
                    pri.border,
                    !n.read && "ring-1 ring-violet-500/20",
                  )}
                >
                  {/* Header row */}
                  <button
                    onClick={() => {
                      toggleExpand(n.id);
                      if (!n.read) markRead(n.id);
                    }}
                    className="flex w-full items-start gap-3 p-4 text-left"
                  >
                    {/* Sender icon */}
                    <div className={cn("mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-2xl", cfg.bg)}>
                      <SenderIcon className={cn("h-5 w-5", cfg.color)} />
                    </div>

                    <div className="min-w-0 flex-1">
                      {/* Sender + time */}
                      <div className="mb-0.5 flex flex-wrap items-center gap-2 text-xs">
                        <span className={cn("font-semibold", cfg.color)}>{cfg.label}</span>
                        <span className="text-slate-600">·</span>
                        <span className="text-slate-500">{n.senderName}</span>
                        <span className="text-slate-600">·</span>
                        <span className="text-slate-500">{formatTime(n.dateTime)}</span>
                      </div>

                      {/* Title */}
                      <p className={cn("text-sm font-semibold", n.read ? "text-slate-300" : "text-white")}>
                        {n.title}
                      </p>

                      {/* Preview (collapsed) */}
                      {!isExpanded && (
                        <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">{n.message}</p>
                      )}
                    </div>

                    {/* Right badges */}
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      {!n.read && <span className="h-2.5 w-2.5 rounded-full bg-violet-500" />}
                      {n.pinned && <Pin className="h-3 w-3 text-primary" />}
                      {n.priority !== "normal" && (
                        <span className={cn("rounded-full px-1.5 py-0.5 text-[9px] font-bold", pri.color === "text-amber-400" ? "bg-amber-500/15 text-amber-400" : "bg-red-500/15 text-red-400")}>
                          {pri.label}
                        </span>
                      )}
                      {n.replyAllowed && !n.replySent && (
                        <span className="rounded-full bg-cyan-500/15 px-1.5 py-0.5 text-[9px] font-bold text-cyan-400">Needs Reply</span>
                      )}
                      {n.replyAllowed && n.replySent && (
                        <span className="rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[9px] font-bold text-emerald-400">Replied</span>
                      )}
                      {isExpanded ? <ChevronUp className="h-3.5 w-3.5 text-slate-500" /> : <ChevronDown className="h-3.5 w-3.5 text-slate-500" />}
                    </div>
                  </button>

                  {/* Expanded content */}
                  {isExpanded && (
                    <div className="space-y-3 border-t border-white/8 px-4 pb-4 pt-3">
                      {/* Full message */}
                      <p className="text-sm leading-relaxed text-slate-300">{n.message}</p>

                      {/* Course tag */}
                      {n.course && (
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <BookOpen className="h-3.5 w-3.5" />
                          {n.course}
                          {n.subject && <span>· {n.subject}</span>}
                        </div>
                      )}

                      {/* Sent reply */}
                      {n.replySent && (
                        <div className="rounded-xl border border-emerald-500/15 bg-emerald-500/[0.04] px-4 py-3">
                          <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                            <Check className="h-3 w-3" /> Reply sent
                          </div>
                          <p className="text-sm text-slate-300">{n.replySent}</p>
                        </div>
                      )}

                      {/* Reply composer */}
                      {n.replyAllowed && !n.replySent && (
                        isReplying ? (
                          <div className="space-y-2">
                            <textarea
                              rows={3}
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder="Write your reply..."
                              className="w-full resize-y rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-violet-500/40"
                            />
                            <div className="flex gap-2">
                              <GradientButton size="sm" disabled={!replyText.trim()} onClick={sendReply}>
                                <Send className="h-3.5 w-3.5" /> Send Reply
                              </GradientButton>
                              <GradientButton variant="outline" size="sm" onClick={() => { setReplyingId(null); setReplyText(""); }}>
                                Cancel
                              </GradientButton>
                            </div>
                          </div>
                        ) : (
                          <GradientButton variant="outline" size="sm" onClick={() => setReplyingId(n.id)}>
                            <MessageSquare className="h-3.5 w-3.5" /> Reply
                          </GradientButton>
                        )
                      )}

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2">
                        <button onClick={() => togglePin(n.id)} className={cn("inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors", n.pinned ? "bg-primary/15 text-primary" : "text-slate-500 hover:bg-white/[0.05] hover:text-slate-300")}>
                          {n.pinned ? <PinOff className="h-3 w-3" /> : <Pin className="h-3 w-3" />}
                          {n.pinned ? "Unpin" : "Pin"}
                        </button>
                        {!n.read && (
                          <button onClick={() => markRead(n.id)} className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-500 transition-colors hover:bg-white/[0.05] hover:text-slate-300">
                            <MailOpen className="h-3 w-3" /> Mark Read
                          </button>
                        )}
                        <button onClick={() => archive(n.id)} className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-500 transition-colors hover:bg-white/[0.05] hover:text-slate-300">
                          <BellOff className="h-3 w-3" /> Archive
                        </button>
                        {n.actionRoute && (
                          <Link to={n.actionRoute} className="inline-flex items-center gap-1 rounded-lg bg-violet-500/10 px-2.5 py-1.5 text-xs font-medium text-violet-300 transition-colors hover:bg-violet-500/20">
                            <ArrowRight className="h-3 w-3" /> {n.actionLabel}
                          </Link>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </motion.div>
    </DashPage>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────

function SummaryCard({ icon: Icon, label, value, color, bg }: {
  icon: React.ElementType; label: string; value: number; color: string; bg: string;
}) {
  return (
    <div className="overflow-hidden rounded-[18px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,24,42,0.96),rgba(10,14,28,0.92))] p-4 shadow-lg">
      <div className={cn("mb-2 grid h-9 w-9 place-items-center rounded-xl", bg)}>
        <Icon className={cn("h-4 w-4", color)} />
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffH = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffH < 1) return "Just now";
  if (diffH < 24) return `${diffH}h ago`;
  const diffD = Math.floor(diffH / 24);
  if (diffD === 1) return "Yesterday";
  if (diffD < 7) return `${diffD} days ago`;
  return d.toLocaleDateString();
}
