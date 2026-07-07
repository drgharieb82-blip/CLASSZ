import { useMemo, useState, type ReactNode } from "react";
import {
  AlertCircle,
  Bell,
  CheckCircle2,
  CreditCard,
  Download,
  FileText,
  MessageSquareReply,
  PhoneCall,
  Plus,
  Printer,
  Receipt,
  Send,
  Sparkles,
  TriangleAlert,
  Wallet,
  X,
} from "lucide-react";

import { DashPage } from "@/components/common/DashPage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { useApp } from "@/lib/app-context";
import {
  linkableParentChildren,
  parentPortalChildren,
  parentPortalParent,
  type ParentResultType,
  type ParentSeverity,
  type ParentStatus,
  type PaymentStatus,
  type TimelineType,
} from "@/lib/parent-portal-mock-data";
import { cn } from "@/lib/utils";

type ModalType = "link" | "report" | "contact" | "pay" | null;
type LinkStatus = "idle" | "code_sent" | "invalid" | "expired" | "success";
type ViewMode = "selected" | "all";

const statusKeys: Record<ParentStatus, string> = {
  on_track: "parentPortal.status.onTrack",
  needs_support: "parentPortal.status.needsSupport",
  watch_closely: "parentPortal.status.watchClosely",
  getting_started: "parentPortal.status.gettingStarted",
};

const paymentStatusKeys: Record<PaymentStatus, string> = {
  paid: "parentPortal.paymentStatus.paid",
  payment_due: "parentPortal.paymentStatus.paymentDue",
  renew_soon: "parentPortal.paymentStatus.renewSoon",
  pending_first_installment: "parentPortal.paymentStatus.pendingFirstInstallment",
};

const severityKeys: Record<ParentSeverity, string> = {
  critical: "parentPortal.severity.critical",
  warning: "parentPortal.severity.warning",
  info: "parentPortal.severity.info",
  positive: "parentPortal.severity.positive",
};

const resultTypeKeys: Record<ParentResultType, string> = {
  quiz: "parentPortal.resultCategory.quiz",
  homework: "parentPortal.resultCategory.homework",
  exam: "parentPortal.resultCategory.exam",
};

const alertTypeKeys = {
  missing_homework: "parentPortal.alertType.missingHomework",
  no_login: "parentPortal.alertType.noLogin",
  score_dropped: "parentPortal.alertType.scoreDropped",
  upcoming_exam: "parentPortal.alertType.upcomingExam",
  payment_due: "parentPortal.alertType.paymentDue",
  teacher_note: "parentPortal.alertType.teacherNote",
} as const;

const timelineTypeKeys: Record<TimelineType, string> = {
  watched_session: "parentPortal.timelineType.watchedSession",
  solved_quiz: "parentPortal.timelineType.solvedQuiz",
  missed_homework: "parentPortal.timelineType.missedHomework",
  teacher_note: "parentPortal.timelineType.teacherNote",
  payment_completed: "parentPortal.timelineType.paymentCompleted",
};

const paymentCourseStatusKeys = {
  active: "parentPortal.paymentCourseStatus.active",
  renew_soon: "parentPortal.paymentCourseStatus.renewSoon",
  trial_access: "parentPortal.paymentCourseStatus.trialAccess",
} as const;

const messageRoleKeys = {
  teacher: "parentPortal.messageRole.teacher",
  assistant_teacher: "parentPortal.messageRole.assistantTeacher",
} as const;

const severityClasses: Record<ParentSeverity, string> = {
  critical: "border-red-500/30 bg-red-500/10 text-red-300",
  warning: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  info: "border-sky-500/30 bg-sky-500/10 text-sky-300",
  positive: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
};

function moneyToNumber(value: string) {
  return Number.parseInt(value.replace(/[^0-9]/g, "") || "0", 10);
}

export function ParentPortalDashboard() {
  const { t } = useApp();
  const [children, setChildren] = useState(parentPortalChildren);
  const [selectedChildId, setSelectedChildId] = useState(parentPortalChildren[0]?.id ?? "");
  const [viewMode, setViewMode] = useState<ViewMode>("selected");
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [linkCode, setLinkCode] = useState("");
  const [linkStatus, setLinkStatus] = useState<LinkStatus>("idle");
  const [messageDraft, setMessageDraft] = useState("");
  const [messageSent, setMessageSent] = useState(false);
  const [downloadRequested, setDownloadRequested] = useState(false);
  const [paymentRequested, setPaymentRequested] = useState(false);

  const selectedChild = useMemo(
    () => children.find((child) => child.id === selectedChildId) ?? children[0],
    [children, selectedChildId],
  );

  const familySummary = useMemo(() => {
    const totalPending = children.reduce((sum, child) => sum + moneyToNumber(child.payments.pendingAmount), 0);
    const totalAlerts = children.reduce((sum, child) => sum + child.alerts.length, 0);
    const averageProgress = Math.round(children.reduce((sum, child) => sum + child.summary.courseProgress, 0) / children.length);
    return { totalPending, totalAlerts, averageProgress };
  }, [children]);

  if (!selectedChild) return null;

  const summaryCards = [
    { title: t("parentPortal.summaryCard.averageScore"), value: `${selectedChild.summary.averageScore}%`, helper: t("parentPortal.summaryCard.averageScoreHelp") },
    { title: t("parentPortal.summaryCard.courseProgress"), value: `${selectedChild.summary.courseProgress}%`, helper: t("parentPortal.summaryCard.courseProgressHelp") },
    { title: t("parentPortal.summaryCard.attendance"), value: `${selectedChild.summary.attendanceRate}%`, helper: t("parentPortal.summaryCard.attendanceHelp") },
    { title: t("parentPortal.summaryCard.missingHomework"), value: String(selectedChild.summary.missingHomework), helper: t("parentPortal.summaryCard.missingHomeworkHelp") },
    { title: t("parentPortal.summaryCard.upcomingExams"), value: String(selectedChild.summary.upcomingExams), helper: t("parentPortal.summaryCard.upcomingExamsHelp") },
    { title: t("parentPortal.summaryCard.paymentStatus"), value: t(paymentStatusKeys[selectedChild.summary.paymentStatus]), helper: t("parentPortal.summaryCard.paymentStatusHelp") },
  ];

  const openModal = (modal: ModalType) => {
    setActiveModal(modal);
    setDownloadRequested(false);
    setPaymentRequested(false);
  };

  const closeLinkModal = () => {
    setActiveModal(null);
    setLinkCode("");
    setLinkStatus("idle");
  };

  const verifyCode = () => {
    const normalized = linkCode.trim().toUpperCase();
    if (!normalized) {
      setLinkStatus("invalid");
      return;
    }
    const expired = linkableParentChildren.find((child) => child.expiredCode === normalized);
    if (expired) {
      setLinkStatus("expired");
      return;
    }
    const matched = linkableParentChildren.find((child) => child.linkCode === normalized);
    if (!matched) {
      setLinkStatus("invalid");
      return;
    }
    if (!children.some((child) => child.id === matched.id)) {
      setChildren((current) => [...current, matched]);
    }
    setSelectedChildId(matched.id);
    setViewMode("selected");
    setLinkStatus("success");
  };

  return (
    <>
      <DashPage role="parent" title="parentPortal.pageTitle" subtitle="parentPortal.pageSubtitle">
        <div className="space-y-6">
          <Card className="overflow-hidden rounded-[28px] border-white/10 bg-[linear-gradient(135deg,rgba(15,23,42,0.98),rgba(15,118,110,0.9))] text-white shadow-2xl">
            <CardContent className="space-y-6 p-6 sm:p-8">
              <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-200">{t("parentPortal.headerEyebrow")}</p>
                    <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{t("parentPortal.headerTitle", { parentName: parentPortalParent.name })}</h2>
                    <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-200">{t("parentPortal.headerDescription")}</p>
                  </div>

                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-sm font-bold">{selectedChild.avatar}</div>
                      <div>
                        <label htmlFor="child-selector" className="block text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">{t("parentPortal.childSelector")}</label>
                        <select
                          id="child-selector"
                          value={selectedChildId}
                          onChange={(event) => {
                            setSelectedChildId(event.target.value);
                            setViewMode("selected");
                            setMessageSent(false);
                          }}
                          className="min-w-[220px] bg-transparent text-base font-semibold text-white outline-none"
                        >
                          {children.map((child) => (
                            <option key={child.id} value={child.id} className="text-slate-950">
                              {child.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="inline-flex w-fit rounded-2xl border border-white/10 bg-white/10 p-1">
                      <ToggleButton active={viewMode === "selected"} onClick={() => setViewMode("selected")}>{t("parentPortal.viewSelectedChild")}</ToggleButton>
                      <ToggleButton active={viewMode === "all"} onClick={() => setViewMode("all")}>{t("parentPortal.viewAllChildren")}</ToggleButton>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:w-[360px]">
                  <ActionButton icon={Plus} label={t("parentPortal.action.addChild")} onClick={() => openModal("link")} />
                  <ActionButton icon={FileText} label={t("parentPortal.action.exportPdf")} onClick={() => openModal("report")} />
                  <ActionButton icon={PhoneCall} label={t("parentPortal.action.contactTeacher")} onClick={() => openModal("contact")} />
                  <ActionButton icon={Wallet} label={t("parentPortal.action.payNow")} onClick={() => openModal("pay")} primary />
                </div>
              </div>

              <div className="grid gap-4 xl:grid-cols-3">
                {children.map((child) => (
                  <button
                    key={child.id}
                    type="button"
                    onClick={() => {
                      setSelectedChildId(child.id);
                      setViewMode("selected");
                    }}
                    className={cn(
                      "rounded-[24px] border p-5 text-left transition hover:-translate-y-0.5",
                      selectedChildId === child.id && viewMode === "selected" ? "border-emerald-300/50 bg-white/12 shadow-lg" : "border-white/10 bg-white/6",
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-sm font-bold">{child.avatar}</div>
                        <div>
                          <p className="font-semibold">{child.name}</p>
                          <p className="text-xs text-slate-300">{child.gradeLabel}</p>
                        </div>
                      </div>
                      <Badge className="border-amber-400/30 bg-amber-400/10 text-amber-200">{child.alerts.length} {t("parentPortal.childCard.alertCount")}</Badge>
                    </div>
                    <div className="mt-4 space-y-2 text-sm text-slate-200">
                      <p><span className="font-medium text-white">{t("parentPortal.childCard.mainCourse")}:</span> {child.mainCourse}</p>
                      <p><span className="font-medium text-white">{t("parentPortal.childCard.status")}:</span> {t(statusKeys[child.overallStatus])}</p>
                      <p><span className="font-medium text-white">{t("parentPortal.childCard.progress")}:</span> {child.summary.courseProgress}%</p>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {viewMode === "all" ? (
            <>
              <div className="grid gap-4 lg:grid-cols-3">
                <MetricCard title={t("parentPortal.familySummary.totalChildren")} value={String(children.length)} helper={t("parentPortal.familySummary.totalChildrenHelp")} />
                <MetricCard title={t("parentPortal.familySummary.averageProgress")} value={`${familySummary.averageProgress}%`} helper={t("parentPortal.familySummary.averageProgressHelp")} />
                <MetricCard title={t("parentPortal.familySummary.pendingPayments")} value={`$${familySummary.totalPending}`} helper={t("parentPortal.familySummary.pendingPaymentsHelp", { count: familySummary.totalAlerts })} />
              </div>

              <SectionCard title={t("parentPortal.allChildrenTitle")} description={t("parentPortal.allChildrenDescription")}>
                <div className="grid gap-4 xl:grid-cols-3">
                  {children.map((child) => (
                    <div key={child.id} className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-lg font-semibold">{child.name}</p>
                          <p className="text-sm text-muted-foreground">{child.gradeLabel}</p>
                        </div>
                        <Badge className="border-sky-400/30 bg-sky-400/10 text-sky-200">{t(statusKeys[child.overallStatus])}</Badge>
                      </div>
                      <div className="mt-5 space-y-3 text-sm">
                        <ComparisonRow label={t("parentPortal.summaryCard.courseProgress")} value={`${child.summary.courseProgress}%`} />
                        <ComparisonRow label={t("parentPortal.summaryCard.averageScore")} value={`${child.summary.averageScore}%`} />
                        <ComparisonRow label={t("parentPortal.summaryCard.missingHomework")} value={String(child.summary.missingHomework)} />
                        <ComparisonRow label={t("parentPortal.summaryCard.attendance")} value={`${child.summary.attendanceRate}%`} />
                        <ComparisonRow label={t("parentPortal.summaryCard.paymentStatus")} value={t(paymentStatusKeys[child.summary.paymentStatus])} />
                        <ComparisonRow label={t("parentPortal.latestTeacherNote")} value={child.teacherNotes[0]} />
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>
            </>
          ) : (
            <>
              <Card className="rounded-[28px] border-white/10 bg-[linear-gradient(135deg,rgba(16,185,129,0.12),rgba(15,23,42,0.92))]">
                <CardContent className="p-6 sm:p-8">
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-400/15 text-emerald-300"><Sparkles className="h-6 w-6" /></div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300">{t("parentPortal.smartSummaryEyebrow")}</p>
                      <h3 className="mt-2 text-2xl font-semibold">{t("parentPortal.smartSummaryTitle", { childName: selectedChild.name })}</h3>
                      <p className="mt-2 text-sm text-slate-300">{t("parentPortal.smartSummaryDescription")}</p>
                    </div>
                  </div>
                  <div className="mt-6 grid gap-4 xl:grid-cols-3">
                    <InfoTile title={t("parentPortal.smartSummaryDoingWell")} body={selectedChild.smartSummary.doingWell} tone="emerald" />
                    <InfoTile title={t("parentPortal.smartSummaryProblem")} body={selectedChild.smartSummary.mainProblem} tone="amber" />
                    <InfoTile title={t("parentPortal.smartSummaryAction")} body={selectedChild.smartSummary.actionThisWeek} tone="sky" />
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {summaryCards.map((card) => <MetricCard key={card.title} title={card.title} value={card.value} helper={card.helper} />)}
              </div>

              <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                <SectionCard title={t("parentPortal.alertsTitle")} description={t("parentPortal.alertsDescription")}>
                  <div className="space-y-4">
                    {selectedChild.alerts.map((alert) => (
                      <AlertCard key={alert.id} severity={alert.severity} title={t(alertTypeKeys[alert.type])} message={alert.message} time={alert.time} />
                    ))}
                  </div>
                </SectionCard>

                <SectionCard title={t("parentPortal.attendanceTitle")} description={t("parentPortal.attendanceDescription")}>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <MiniStat title={t("parentPortal.attendancePresent")} value={String(selectedChild.attendance.present)} />
                    <MiniStat title={t("parentPortal.attendanceAbsent")} value={String(selectedChild.attendance.absent)} />
                    <MiniStat title={t("parentPortal.attendanceLate")} value={String(selectedChild.attendance.late)} />
                    <MiniStat title={t("parentPortal.attendanceRate")} value={`${selectedChild.attendance.rate}%`} />
                  </div>
                </SectionCard>
              </div>

              <SectionCard title={t("parentPortal.progressTitle")} description={t("parentPortal.progressDescription")}>
                <div className="grid gap-4 xl:grid-cols-3">
                  {selectedChild.progress.map((course) => (
                    <div key={course.id} className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-lg font-semibold">{course.courseName}</p>
                          <p className="text-sm text-muted-foreground">{t("parentPortal.progressLastActivity")}: {course.lastActivity}</p>
                        </div>
                        <Badge className="border-sky-400/30 bg-sky-400/10 text-sky-200">{course.progress}%</Badge>
                      </div>
                      <div className="mt-4"><Progress value={course.progress} className="h-2" /></div>
                      <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                        <MiniStat title={t("parentPortal.progressSessionsCompleted")} value={course.sessionsCompleted} />
                        <MiniStat title={t("parentPortal.progressWatchTime")} value={course.watchTime} />
                      </div>
                      <div className="mt-4">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{t("parentPortal.progressWeeklyTrend")}</p>
                        <div className="flex h-20 items-end gap-2">
                          {course.weeklyTrend.map((point, index) => (
                            <div key={`${course.id}-${index}`} className="flex-1 rounded-t-full bg-gradient-to-t from-emerald-500 to-sky-400" style={{ height: `${Math.max(point, 10)}%` }} />
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>

              <SectionCard title={t("parentPortal.resultsTitle")} description={t("parentPortal.resultsDescription")}>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px] text-sm">
                    <thead className="text-left text-muted-foreground">
                      <tr className="border-b border-white/10">
                        <th className="px-3 py-3 font-medium">{t("parentPortal.resultsType")}</th>
                        <th className="px-3 py-3 font-medium">{t("parentPortal.resultsTitleLabel")}</th>
                        <th className="px-3 py-3 font-medium">{t("parentPortal.resultsDate")}</th>
                        <th className="px-3 py-3 font-medium">{t("parentPortal.resultsScore")}</th>
                        <th className="px-3 py-3 font-medium">{t("parentPortal.resultsNote")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedChild.results.map((result) => (
                        <tr key={result.id} className="border-b border-white/5 last:border-none">
                          <td className="px-3 py-4">{t(resultTypeKeys[result.type])}</td>
                          <td className="px-3 py-4">{result.title}</td>
                          <td className="px-3 py-4">{result.date}</td>
                          <td className="px-3 py-4">{result.scoreOrStatus}</td>
                          <td className="px-3 py-4 text-muted-foreground">{result.note}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </SectionCard>

              <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
                <SectionCard title={t("parentPortal.weaknessesTitle")} description={t("parentPortal.weaknessesDescription")}>
                  <div className="space-y-4">
                    {selectedChild.weaknesses.map((weakness) => (
                      <div key={weakness.id} className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                        <p className="text-lg font-semibold">{weakness.chapter}</p>
                        <p className="mt-2 text-sm"><span className="font-medium">{t("parentPortal.weaknessTopic")}:</span> {weakness.topic}</p>
                        <p className="mt-2 text-sm"><span className="font-medium">{t("parentPortal.weaknessAction")}:</span> {weakness.action}</p>
                        <p className="mt-2 text-sm text-muted-foreground"><span className="font-medium text-foreground">{t("parentPortal.weaknessPractice")}:</span> {weakness.extraPractice}</p>
                      </div>
                    ))}
                  </div>
                </SectionCard>

                <SectionCard title={t("parentPortal.messagesTitle")} description={t("parentPortal.messagesDescription")}>
                  <div className="space-y-4">
                    {selectedChild.messages.map((message) => (
                      <div key={message.id} className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-base font-semibold">{message.sender}</p>
                            <p className="text-sm text-muted-foreground">{t(messageRoleKeys[message.role])} / {message.time}</p>
                          </div>
                          <Button variant="outline" size="sm" className="rounded-xl border-white/10 bg-transparent">
                            <MessageSquareReply className="h-4 w-4" />
                            {t("parentPortal.reply")}
                          </Button>
                        </div>
                        <p className="mt-4 text-sm leading-6 text-slate-300">{message.note}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-5 rounded-[24px] border border-white/10 bg-white/5 p-5">
                    <label htmlFor="parent-message-box" className="text-sm font-medium">{t("parentPortal.sendMessageLabel")}</label>
                    <Textarea
                      id="parent-message-box"
                      value={messageDraft}
                      onChange={(event) => {
                        setMessageDraft(event.target.value);
                        setMessageSent(false);
                      }}
                      className="mt-3 min-h-[110px] border-white/10 bg-slate-950/30"
                      placeholder={t("parentPortal.sendMessagePlaceholder")}
                    />
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <Button
                        className="rounded-xl bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                        onClick={() => {
                          setMessageDraft("");
                          setMessageSent(true);
                        }}
                      >
                        <Send className="h-4 w-4" />
                        {t("parentPortal.sendMessageAction")}
                      </Button>
                      <Button variant="outline" className="rounded-xl border-white/10 bg-transparent">
                        <PhoneCall className="h-4 w-4" />
                        {t("parentPortal.openWhatsApp")}
                      </Button>
                      {messageSent ? <span className="text-sm text-emerald-300">{t("parentPortal.messageSent")}</span> : null}
                    </div>
                  </div>
                </SectionCard>
              </div>

              <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
                <SectionCard title={t("parentPortal.paymentsTitle")} description={t("parentPortal.paymentsDescription")}>
                  <div className="grid gap-4">
                    {selectedChild.payments.activeCourses.map((course) => (
                      <div key={course.id} className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-base font-semibold">{course.courseName}</p>
                            <p className="text-sm text-muted-foreground">{t("parentPortal.courseExpiry")}: {course.expiryDate}</p>
                          </div>
                          <Badge className="border-sky-400/30 bg-sky-400/10 text-sky-200">{t(paymentCourseStatusKeys[course.status])}</Badge>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-3">
                          <Button className="rounded-xl bg-emerald-500 text-slate-950 hover:bg-emerald-400" onClick={() => openModal("pay")}>
                            <Wallet className="h-4 w-4" />
                            {t("parentPortal.payButton")}
                          </Button>
                          <Button variant="outline" className="rounded-xl border-white/10 bg-transparent">
                            <Receipt className="h-4 w-4" />
                            {t("parentPortal.renewButton")}
                          </Button>
                          <Button variant="outline" className="rounded-xl border-white/10 bg-transparent">
                            <Download className="h-4 w-4" />
                            {t("parentPortal.downloadInvoice")}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <MiniStat title={t("parentPortal.pendingPayment")} value={selectedChild.payments.pendingAmount} />
                    <MiniStat title={t("parentPortal.walletBalance")} value={selectedChild.payments.walletBalance} />
                  </div>
                  <div className="mt-5 grid gap-4 lg:grid-cols-2">
                    <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">{t("parentPortal.installments")}</p>
                      <div className="mt-4 space-y-3">
                        {selectedChild.payments.installments.map((installment) => (
                          <ComparisonRow key={installment.id} label={`${installment.label} / ${installment.dueDate}`} value={`${installment.amount} / ${t(`parentPortal.installmentStatus.${installment.status}`)}`} />
                        ))}
                      </div>
                    </div>
                    <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">{t("parentPortal.purchases")}</p>
                      <div className="mt-4 space-y-3">
                        {selectedChild.payments.purchases.map((purchase) => (
                          <ComparisonRow key={purchase.id} label={`${purchase.item} / ${purchase.date}`} value={purchase.amount} />
                        ))}
                      </div>
                    </div>
                  </div>
                </SectionCard>

                <SectionCard title={t("parentPortal.timelineTitle")} description={t("parentPortal.timelineDescription")}>
                  <div className="space-y-4">
                    {selectedChild.timeline.map((event) => (
                      <div key={event.id} className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-base font-semibold">{event.title}</p>
                          <Badge className="border-white/10 bg-white/10 text-slate-200">{t(timelineTypeKeys[event.type])}</Badge>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-slate-300">{event.description}</p>
                        <p className="mt-3 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{event.time}</p>
                      </div>
                    ))}
                  </div>
                </SectionCard>
              </div>
            </>
          )}
        </div>
      </DashPage>

      <ModalShell open={activeModal === "link"} title={t("parentPortal.linkModalTitle")} onClose={closeLinkModal}>
        <p className="text-sm text-muted-foreground">{t("parentPortal.linkModalDescription")}</p>
        <div className="mt-5 rounded-[24px] border border-white/10 bg-white/5 p-5">
          <label htmlFor="student-link-code" className="text-sm font-medium">{t("parentPortal.studentLinkCode")}</label>
          <Input
            id="student-link-code"
            value={linkCode}
            onChange={(event) => {
              setLinkCode(event.target.value);
              setLinkStatus("idle");
            }}
            className="mt-3 border-white/10 bg-slate-950/30"
            placeholder={t("parentPortal.studentLinkCodePlaceholder")}
          />
          <div className="mt-4 flex flex-wrap gap-3">
            <Button variant="outline" className="rounded-xl border-white/10 bg-transparent" onClick={() => setLinkStatus("code_sent")}>
              {t("parentPortal.codeSentAction")}
            </Button>
            <Button className="rounded-xl bg-emerald-500 text-slate-950 hover:bg-emerald-400" onClick={verifyCode}>
              {t("parentPortal.verifyCode")}
            </Button>
          </div>
        </div>
        {linkStatus !== "idle" ? <StatusBox title={t(`parentPortal.linkStatus.${linkStatus}`)} body={t(`parentPortal.linkStatusDescription.${linkStatus}`)} /> : null}
        <StatusBox title={t("parentPortal.linkingPolicyTitle")} body={t("parentPortal.linkingPolicyRegistration")} />
        <div className="mt-3 rounded-[24px] border border-white/10 bg-white/5 p-5 text-sm text-muted-foreground">
          <p>{t("parentPortal.linkingPolicySelfRegistration")}</p>
          <p className="mt-2">{t("parentPortal.linkingPolicyNoSearch")}</p>
          <p className="mt-4 text-xs uppercase tracking-[0.2em]">{t("parentPortal.demoCodes")}: `CLASSZ-LINK-2040` / `EXPIRE-2040`</p>
        </div>
      </ModalShell>

      <ModalShell open={activeModal === "report"} title={t("parentPortal.reportTitle")} onClose={() => setActiveModal(null)}>
        {viewMode === "all" ? (
          <div className="space-y-4">
            <StatusBox title={t("parentPortal.familyReportTitle")} body={t("parentPortal.familyReportDescription")} />
            {children.map((child) => (
              <div key={child.id} className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold">{child.name}</p>
                    <p className="text-sm text-muted-foreground">{child.gradeLabel} / {child.mainCourse}</p>
                  </div>
                  <Badge className="border-sky-400/30 bg-sky-400/10 text-sky-200">{t(statusKeys[child.overallStatus])}</Badge>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <MiniStat title={t("parentPortal.summaryCard.courseProgress")} value={`${child.summary.courseProgress}%`} />
                  <MiniStat title={t("parentPortal.summaryCard.averageScore")} value={`${child.summary.averageScore}%`} />
                  <MiniStat title={t("parentPortal.summaryCard.paymentStatus")} value={t(paymentStatusKeys[child.summary.paymentStatus])} />
                </div>
                <p className="mt-4 text-sm text-slate-300">{child.teacherNotes[0]}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <StatusBox title={selectedChild.name} body={selectedChild.smartSummary.actionThisWeek} />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {summaryCards.map((card) => <MiniStat key={card.title} title={card.title} value={card.value} />)}
            </div>
            <ReportBlock title={t("parentPortal.reportAlerts")}>
              {selectedChild.alerts.map((alert) => (
                <p key={alert.id}>{t(alertTypeKeys[alert.type])}: {alert.message}</p>
              ))}
            </ReportBlock>
            <ReportBlock title={t("parentPortal.reportAttendance")}>
              <p>{t("parentPortal.attendancePresent")}: {selectedChild.attendance.present}</p>
              <p>{t("parentPortal.attendanceAbsent")}: {selectedChild.attendance.absent}</p>
              <p>{t("parentPortal.attendanceLate")}: {selectedChild.attendance.late}</p>
              <p>{t("parentPortal.attendanceRate")}: {selectedChild.attendance.rate}%</p>
            </ReportBlock>
            <ReportBlock title={t("parentPortal.reportWeaknesses")}>
              {selectedChild.weaknesses.map((weakness) => (
                <p key={weakness.id}>{weakness.chapter}: {weakness.topic} / {weakness.action}</p>
              ))}
            </ReportBlock>
            <ReportBlock title={t("parentPortal.reportPayments")}>
              <p>{t("parentPortal.pendingPayment")}: {selectedChild.payments.pendingAmount}</p>
              <p>{t("parentPortal.walletBalance")}: {selectedChild.payments.walletBalance}</p>
            </ReportBlock>
            <ReportBlock title={t("parentPortal.reportTeacherNotes")}>
              {selectedChild.teacherNotes.map((note) => <p key={note}>{note}</p>)}
            </ReportBlock>
          </div>
        )}
        <div className="mt-6 flex flex-wrap gap-3">
          <Button className="rounded-xl bg-emerald-500 text-slate-950 hover:bg-emerald-400" onClick={() => window.print()}>
            <Printer className="h-4 w-4" />
            {t("parentPortal.print")}
          </Button>
          <Button variant="outline" className="rounded-xl border-white/10 bg-transparent" onClick={() => setDownloadRequested(true)}>
            <Download className="h-4 w-4" />
            {t("parentPortal.downloadPdf")}
          </Button>
          {downloadRequested ? <span className="self-center text-sm text-emerald-300">{t("parentPortal.downloadReady")}</span> : null}
        </div>
      </ModalShell>

      <ModalShell open={activeModal === "contact"} title={t("parentPortal.contactModalTitle")} onClose={() => setActiveModal(null)}>
        <StatusBox title={viewMode === "all" ? t("parentPortal.familyContactTitle") : selectedChild.name} body={viewMode === "all" ? t("parentPortal.familyContactDescription") : selectedChild.messages[0]?.note ?? ""} />
        <div className="mt-4 flex flex-wrap gap-3">
          <Button className="rounded-xl bg-emerald-500 text-slate-950 hover:bg-emerald-400">
            <PhoneCall className="h-4 w-4" />
            {t("parentPortal.openWhatsApp")}
          </Button>
          <Button variant="outline" className="rounded-xl border-white/10 bg-transparent">
            <MessageSquareReply className="h-4 w-4" />
            {t("parentPortal.reply")}
          </Button>
        </div>
      </ModalShell>

      <ModalShell open={activeModal === "pay"} title={t("parentPortal.payModalTitle")} onClose={() => setActiveModal(null)}>
        <StatusBox
          title={viewMode === "all" ? t("parentPortal.familyPaymentTitle") : selectedChild.name}
          body={viewMode === "all" ? t("parentPortal.familyPaymentDescription", { amount: `$${familySummary.totalPending}` }) : t("parentPortal.childPaymentDescription", { amount: selectedChild.payments.pendingAmount })}
        />
        <div className="mt-4 flex flex-wrap gap-3">
          <Button variant="outline" className="rounded-xl border-white/10 bg-transparent">
            <Receipt className="h-4 w-4" />
            {t("parentPortal.downloadInvoice")}
          </Button>
          <Button className="rounded-xl bg-emerald-500 text-slate-950 hover:bg-emerald-400" onClick={() => setPaymentRequested(true)}>
            <CreditCard className="h-4 w-4" />
            {t("parentPortal.payButton")}
          </Button>
        </div>
        {paymentRequested ? <p className="mt-4 text-sm text-emerald-300">{t("parentPortal.paymentRequested")}</p> : null}
      </ModalShell>
    </>
  );
}

function ActionButton({ icon: Icon, label, onClick, primary = false }: { icon: typeof Plus; label: string; onClick: () => void; primary?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn("inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition hover:-translate-y-0.5", primary ? "border-emerald-300 bg-emerald-300 text-slate-950 hover:bg-white" : "border-white/10 bg-white/10 text-white hover:bg-white/15")}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

function ToggleButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return <button type="button" onClick={onClick} className={cn("rounded-xl px-4 py-2 text-sm font-medium transition", active ? "bg-white text-slate-950" : "text-white hover:bg-white/10")}>{children}</button>;
}

function SectionCard({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <Card className="rounded-[28px] border-white/10 bg-slate-950/40">
      <CardContent className="p-6 sm:p-8">
        <div>
          <h3 className="text-2xl font-semibold">{title}</h3>
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="mt-6">{children}</div>
      </CardContent>
    </Card>
  );
}

function MetricCard({ title, value, helper }: { title: string; value: string; helper: string }) {
  return (
    <Card className="rounded-[24px] border-white/10 bg-slate-950/40">
      <CardContent className="p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{title}</p>
        <p className="mt-3 text-3xl font-semibold">{value}</p>
        <p className="mt-2 text-sm text-muted-foreground">{helper}</p>
      </CardContent>
    </Card>
  );
}

function MiniStat({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-[20px] border border-white/10 bg-white/5 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{title}</p>
      <p className="mt-2 text-lg font-semibold">{value}</p>
    </div>
  );
}

function InfoTile({ title, body, tone }: { title: string; body: string; tone: "emerald" | "amber" | "sky" }) {
  const toneClass = tone === "emerald" ? "border-emerald-400/20 bg-emerald-400/10" : tone === "amber" ? "border-amber-400/20 bg-amber-400/10" : "border-sky-400/20 bg-sky-400/10";
  return <div className={cn("rounded-[24px] border p-5", toneClass)}><p className="text-sm font-semibold">{title}</p><p className="mt-3 text-sm leading-7 text-slate-200">{body}</p></div>;
}

function ComparisonRow({ label, value }: { label: string; value: string }) {
  return <div className="flex items-start justify-between gap-4"><span className="text-muted-foreground">{label}</span><span className="max-w-[60%] text-right font-medium">{value}</span></div>;
}

function AlertCard({ severity, title, message, time }: { severity: ParentSeverity; title: string; message: string; time: string }) {
  const { t } = useApp();
  const Icon = severity === "critical" ? AlertCircle : severity === "warning" ? TriangleAlert : severity === "positive" ? CheckCircle2 : Bell;
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10"><Icon className="h-5 w-5" /></div>
          <div>
            <p className="font-semibold">{title}</p>
            <p className="text-sm text-muted-foreground">{time}</p>
          </div>
        </div>
        <Badge className={severityClasses[severity]}>{t(severityKeys[severity])}</Badge>
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-300">{message}</p>
    </div>
  );
}

function StatusBox({ title, body }: { title: string; body: string }) {
  return <div className="mt-5 rounded-[24px] border border-white/10 bg-white/5 p-5"><p className="font-semibold">{title}</p><p className="mt-2 text-sm leading-6 text-slate-300">{body}</p></div>;
}

function ReportBlock({ title, children }: { title: string; children: ReactNode }) {
  return <div className="rounded-[24px] border border-white/10 bg-white/5 p-5"><h4 className="font-semibold">{title}</h4><div className="mt-3 space-y-2 text-sm text-slate-300">{children}</div></div>;
}

function ModalShell({ open, title, onClose, children }: { open: boolean; title: string; onClose: () => void; children: ReactNode }) {
  const { t } = useApp();
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-[28px] border border-white/10 bg-slate-950 p-6 shadow-2xl sm:p-7">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-2xl font-semibold">{title}</h2>
          <Button variant="outline" className="rounded-xl border-white/10 bg-transparent" onClick={onClose}>
            <X className="h-4 w-4" />
            {t("parentPortal.close")}
          </Button>
        </div>
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}
