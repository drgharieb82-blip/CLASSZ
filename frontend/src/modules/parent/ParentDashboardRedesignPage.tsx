import { type ReactNode, startTransition, useMemo, useState } from "react";
import {
  AlertCircle,
  Bell,
  BookOpen,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  Download,
  FileText,
  GraduationCap,
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
import { useTranslation } from "react-i18next";

import { Card } from "../../components/ui/Card";
import { PageContainer } from "../../components/ui/PageContainer";
import { SectionHeader } from "../../components/ui/SectionHeader";
import { StatCard } from "../../components/ui/StatCard";
import { linkableChildren, parentProfile, type AlertSeverity, type ParentChild } from "./parentMockData";

type LinkStatus = "idle" | "codeSent" | "invalid" | "expired" | "success";
type ModalType = "addChild" | "report" | "contact" | "pay" | null;
type ViewMode = "selected" | "all";
type StatTone = "primary" | "secondary" | "success" | "warning" | "error" | "neutral";

const severityToneMap: Record<AlertSeverity, string> = {
  critical: "ui-badge-error",
  warning: "ui-badge-warning",
  info: "ui-badge-neutral",
  positive: "ui-badge-success",
};

const platformValueKeyMap: Record<string, string> = {
  "On Track": "parentPortal.values.onTrack",
  "Needs Support": "parentPortal.values.needsSupport",
  "Watch Closely": "parentPortal.values.watchClosely",
  "Getting Started": "parentPortal.values.gettingStarted",
  Paid: "parentPortal.values.paid",
  "Payment due": "parentPortal.values.paymentDue",
  "Renew soon": "parentPortal.values.renewSoon",
  "Pending first installment": "parentPortal.values.pendingFirstInstallment",
  Active: "parentPortal.values.active",
  "Trial access": "parentPortal.values.trialAccess",
  Teacher: "parentPortal.values.teacher",
  "Assistant Teacher": "parentPortal.values.assistantTeacher",
  Quiz: "parentPortal.values.quiz",
  Homework: "parentPortal.values.homework",
  Exam: "parentPortal.values.exam",
  "Missing homework": "parentPortal.values.missingHomeworkAlert",
  "No login": "parentPortal.values.noLoginAlert",
  "Score dropped": "parentPortal.values.scoreDroppedAlert",
  "Upcoming exam": "parentPortal.values.upcomingExamAlert",
  "Payment due alert": "parentPortal.values.paymentDueAlert",
  "Teacher note": "parentPortal.values.teacherNote",
  "Watched session": "parentPortal.values.watchedSession",
  "Solved quiz": "parentPortal.values.solvedQuiz",
  "Missed homework": "parentPortal.values.missedHomework",
  "Payment completed": "parentPortal.values.paymentCompleted",
  Missing: "parentPortal.values.missing",
  Submitted: "parentPortal.values.submitted",
  Upcoming: "parentPortal.values.upcoming",
};

export function ParentDashboardRedesignPage() {
  const { t } = useTranslation();
  const [children, setChildren] = useState(parentProfile.children);
  const [selectedChildId, setSelectedChildId] = useState(parentProfile.children[0]?.id ?? "");
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

  const familySnapshot = useMemo(
    () => ({
      totalAlerts: children.reduce((total, child) => total + child.alerts.length, 0),
      totalPending: children.reduce((total, child) => total + Number.parseInt(child.payments.pendingAmount.replace(/[^0-9]/g, "") || "0", 10), 0),
      averageProgress: Math.round(children.reduce((total, child) => total + child.summary.courseProgress, 0) / children.length),
    }),
    [children],
  );

  const translateValue = (value: string) => {
    const key = platformValueKeyMap[value];
    return key ? t(key) : value;
  };

  if (!selectedChild) {
    return null;
  }

  const summaryCards: Array<{
    label: string;
    value: string | number;
    helper: string;
    icon: typeof BookOpen;
    tone: StatTone;
  }> = [
    {
      label: t("parentPortal.summaryCards.averageScore"),
      value: `${selectedChild.summary.averageScore}%`,
      helper: t("parentPortal.summaryCards.averageScoreHelper"),
      icon: GraduationCap,
      tone: "success",
    },
    {
      label: t("parentPortal.summaryCards.courseProgress"),
      value: `${selectedChild.summary.courseProgress}%`,
      helper: t("parentPortal.summaryCards.courseProgressHelper"),
      icon: BookOpen,
      tone: "secondary",
    },
    {
      label: t("parentPortal.summaryCards.attendance"),
      value: `${selectedChild.summary.attendanceRate}%`,
      helper: t("parentPortal.summaryCards.attendanceHelper"),
      icon: CheckCircle2,
      tone: "success",
    },
    {
      label: t("parentPortal.summaryCards.missingHomework"),
      value: selectedChild.summary.missingHomework,
      helper: t("parentPortal.summaryCards.missingHomeworkHelper"),
      icon: AlertCircle,
      tone: selectedChild.summary.missingHomework > 0 ? "warning" : "success",
    },
    {
      label: t("parentPortal.summaryCards.upcomingExams"),
      value: selectedChild.summary.upcomingExams,
      helper: t("parentPortal.summaryCards.upcomingExamsHelper"),
      icon: CalendarClock,
      tone: "warning",
    },
    {
      label: t("parentPortal.summaryCards.paymentStatus"),
      value: translateValue(selectedChild.summary.paymentStatus),
      helper: t("parentPortal.summaryCards.paymentStatusHelper"),
      icon: CircleDollarSign,
      tone: selectedChild.summary.paymentStatus === "Paid" ? "success" : "warning",
    },
  ];

  function openModal(modal: ModalType) {
    setActiveModal(modal);
    setDownloadRequested(false);
    setPaymentRequested(false);
  }

  function handleVerifyCode() {
    const normalizedCode = linkCode.trim().toUpperCase();
    const linkable = linkableChildren.find((child) => child.linkCode === normalizedCode);
    const expired = linkableChildren.find((child) => child.expiredCode === normalizedCode);

    if (!normalizedCode) {
      setLinkStatus("invalid");
      return;
    }

    if (expired) {
      setLinkStatus("expired");
      return;
    }

    if (!linkable) {
      setLinkStatus("invalid");
      return;
    }

    startTransition(() => {
      setChildren((currentChildren) => (currentChildren.some((child) => child.id === linkable.id) ? currentChildren : [...currentChildren, linkable]));
      setSelectedChildId(linkable.id);
      setViewMode("selected");
      setLinkStatus("success");
    });
  }

  function handlePrintReport() {
    window.print();
  }

  return (
    <>
      <PageContainer className="space-y-8">
        <Card className="overflow-hidden border-none bg-[radial-gradient(circle_at_top,rgba(20,184,166,0.18),transparent_28%),linear-gradient(145deg,#0f172a,#132238_48%,#1f2937)] p-6 text-white shadow-[0_28px_80px_rgba(15,23,42,0.28)] sm:p-8">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-200">{t("parentPortal.header.eyebrow")}</p>
              <h2 className="mt-3 font-display text-3xl font-semibold leading-tight sm:text-4xl">
                {t("parentPortal.header.greeting", { parentName: parentProfile.name })}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-200">{t("parentPortal.header.description")}</p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/8 px-4 py-3">
                  <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-teal-200">
                    {t("parentPortal.header.childSelector")}
                  </label>
                  <div className="mt-2 flex items-center gap-2">
                    <select
                      value={selectedChildId}
                      onChange={(event) => {
                        setSelectedChildId(event.target.value);
                        setViewMode("selected");
                        setMessageSent(false);
                      }}
                      className="min-w-[230px] bg-transparent text-base font-semibold outline-none"
                      aria-label={t("parentPortal.header.childSelector")}
                    >
                      {children.map((child) => (
                        <option key={child.id} value={child.id} className="text-slate-950">
                          {child.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="h-4 w-4 text-slate-300" aria-hidden="true" />
                  </div>
                </div>

                <div className="inline-flex rounded-2xl border border-white/10 bg-white/8 p-1">
                  <button
                    type="button"
                    onClick={() => setViewMode("selected")}
                    className={["rounded-xl px-4 py-2 text-sm font-semibold transition", viewMode === "selected" ? "bg-white text-slate-950" : "text-white hover:bg-white/10"].join(" ")}
                  >
                    {t("parentPortal.view.selectedChild")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("all")}
                    className={["rounded-xl px-4 py-2 text-sm font-semibold transition", viewMode === "all" ? "bg-white text-slate-950" : "text-white hover:bg-white/10"].join(" ")}
                  >
                    {t("parentPortal.view.allChildren")}
                  </button>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:max-w-md">
              <HeroAction icon={Plus} label={t("parentPortal.actions.addChild")} onClick={() => openModal("addChild")} />
              <HeroAction icon={FileText} label={t("parentPortal.actions.exportPdf")} onClick={() => openModal("report")} />
              <HeroAction icon={PhoneCall} label={t("parentPortal.actions.contactTeacher")} onClick={() => openModal("contact")} />
              <HeroAction icon={CircleDollarSign} label={t("parentPortal.actions.payNow")} onClick={() => openModal("pay")} primary />
            </div>
          </div>
        </Card>

        <section className="grid gap-4 xl:grid-cols-3">
          {children.map((child) => (
            <ChildOverviewCard
              key={child.id}
              child={child}
              selected={selectedChildId === child.id && viewMode === "selected"}
              onSelect={() => {
                setSelectedChildId(child.id);
                setViewMode("selected");
              }}
              translateValue={translateValue}
              t={t}
            />
          ))}
        </section>

        {viewMode === "all" ? (
          <>
            <section className="grid gap-4 md:grid-cols-3">
              <StatCard label={t("parentPortal.family.totalChildren")} value={children.length} icon={BookOpen} tone="primary" helperText={t("parentPortal.family.totalChildrenHelper")} />
              <StatCard label={t("parentPortal.family.averageProgress")} value={`${familySnapshot.averageProgress}%`} icon={GraduationCap} tone="secondary" helperText={t("parentPortal.family.averageProgressHelper")} />
              <StatCard label={t("parentPortal.family.openAlerts")} value={familySnapshot.totalAlerts} icon={Bell} tone="warning" helperText={t("parentPortal.family.openAlertsHelper", { amount: `$${familySnapshot.totalPending}` })} />
            </section>

            <Card className="p-6 sm:p-7">
              <SectionHeader
                eyebrow={t("parentPortal.allChildren.eyebrow")}
                title={t("parentPortal.allChildren.title")}
                description={t("parentPortal.allChildren.description")}
              />
              <div className="mt-6 grid gap-5 xl:grid-cols-3">
                {children.map((child) => (
                  <ComparisonCard key={child.id} child={child} translateValue={translateValue} t={t} />
                ))}
              </div>
            </Card>
          </>
        ) : (
          <>
            <Card className="overflow-hidden border-none bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.16),transparent_30%),linear-gradient(140deg,#ffffff,#ecfeff_38%,#eff6ff)] p-6 dark:bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.12),transparent_30%),linear-gradient(140deg,#0f172a,#132238_42%,#1e293b)] sm:p-7">
              <SectionHeader
                eyebrow={t("parentPortal.smartSummary.eyebrow")}
                title={t("parentPortal.smartSummary.title", { name: selectedChild.name })}
                description={t("parentPortal.smartSummary.description")}
                icon={
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-700 dark:text-teal-200">
                    <Sparkles className="h-6 w-6" aria-hidden="true" />
                  </span>
                }
              />
              <div className="mt-6 grid gap-4 lg:grid-cols-3">
                <SummaryBlock title={t("parentPortal.smartSummary.doingWell")} body={selectedChild.parentSummary.doingWell} tone="success" />
                <SummaryBlock title={t("parentPortal.smartSummary.mainProblem")} body={selectedChild.parentSummary.mainProblem} tone="warning" />
                <SummaryBlock title={t("parentPortal.smartSummary.actionThisWeek")} body={selectedChild.parentSummary.actionThisWeek} tone="primary" />
              </div>
            </Card>

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {summaryCards.map((card) => (
                <StatCard key={card.label} label={card.label} value={card.value} helperText={card.helper} icon={card.icon} tone={card.tone} />
              ))}
            </section>

            <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
              <Card className="p-6 sm:p-7">
                <SectionHeader eyebrow={t("parentPortal.alerts.eyebrow")} title={t("parentPortal.alerts.title")} description={t("parentPortal.alerts.description")} />
                <div className="mt-6 space-y-4">
                  {selectedChild.alerts.map((alert) => (
                    <AlertRow key={alert.id} severity={alert.severity} title={translateValue(alert.type)} message={alert.message} time={alert.time} t={t} />
                  ))}
                </div>
              </Card>

              <Card className="p-6 sm:p-7">
                <SectionHeader eyebrow={t("parentPortal.payments.eyebrow")} title={t("parentPortal.payments.title")} description={t("parentPortal.payments.description")} />
                <div className="mt-6 grid gap-4">
                  {selectedChild.payments.activeCourses.map((course) => (
                    <div key={course.id} className="rounded-3xl border border-slate-200/80 bg-slate-50/80 p-5 dark:border-white/10 dark:bg-white/[0.04]">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-950 dark:text-white">{course.courseName}</p>
                          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{course.expiryDate}</p>
                        </div>
                        <span className="ui-badge ui-badge-neutral">{translateValue(course.status)}</span>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-3">
                        <button type="button" className="ui-button ui-button-primary" onClick={() => openModal("pay")}>
                          <CircleDollarSign className="h-4 w-4" aria-hidden="true" />
                          {t("parentPortal.payments.payButton")}
                        </button>
                        <button type="button" className="ui-button">
                          <Receipt className="h-4 w-4" aria-hidden="true" />
                          {t("parentPortal.payments.renewButton")}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <MiniMetric title={t("parentPortal.payments.pendingAmount")} value={selectedChild.payments.pendingAmount} />
                  <MiniMetric title={t("parentPortal.payments.walletBalance")} value={selectedChild.payments.walletBalance} />
                </div>
              </Card>
            </div>

            <Card className="p-6 sm:p-7">
              <SectionHeader eyebrow={t("parentPortal.progress.eyebrow")} title={t("parentPortal.progress.title")} description={t("parentPortal.progress.description")} />
              <div className="mt-6 grid gap-5 xl:grid-cols-3">
                {selectedChild.progress.courses.map((course) => (
                  <CourseProgressCard key={course.id} course={course} t={t} />
                ))}
              </div>
            </Card>

            <Card className="p-6 sm:p-7">
              <SectionHeader eyebrow={t("parentPortal.results.eyebrow")} title={t("parentPortal.results.title")} description={t("parentPortal.results.description")} />
              <div className="mt-6 overflow-x-auto">
                <table className="ui-table">
                  <thead>
                    <tr>
                      <th>{t("parentPortal.results.type")}</th>
                      <th>{t("parentPortal.results.titleLabel")}</th>
                      <th>{t("parentPortal.results.date")}</th>
                      <th>{t("parentPortal.results.score")}</th>
                      <th>{t("parentPortal.results.note")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedChild.recentResults.map((result) => (
                      <tr key={result.id}>
                        <td>{translateValue(result.category)}</td>
                        <td>{result.title}</td>
                        <td>{result.date}</td>
                        <td>{translateValue(result.scoreOrStatus)}</td>
                        <td>{result.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
              <Card className="p-6 sm:p-7">
                <SectionHeader eyebrow={t("parentPortal.weaknesses.eyebrow")} title={t("parentPortal.weaknesses.title")} description={t("parentPortal.weaknesses.description")} />
                <div className="mt-6 space-y-4">
                  {selectedChild.weaknesses.map((weakness) => (
                    <div key={weakness.id} className="rounded-3xl border border-slate-200/80 bg-slate-50/80 p-5 dark:border-white/10 dark:bg-white/[0.04]">
                      <p className="font-semibold text-slate-950 dark:text-white">{weakness.chapter}</p>
                      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{t("parentPortal.weaknesses.weakTopic")}: {weakness.topic}</p>
                      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{t("parentPortal.weaknesses.recommendedAction")}: {weakness.action}</p>
                      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{t("parentPortal.weaknesses.extraPractice")}: {weakness.practice}</p>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6 sm:p-7">
                <SectionHeader eyebrow={t("parentPortal.messages.eyebrow")} title={t("parentPortal.messages.title")} description={t("parentPortal.messages.description")} />
                <div className="mt-6 space-y-4">
                  {selectedChild.messages.map((message) => (
                    <div key={message.id} className="rounded-3xl border border-slate-200/80 bg-slate-50/80 p-5 dark:border-white/10 dark:bg-white/[0.04]">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-950 dark:text-white">{message.sender}</p>
                          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{translateValue(message.role)} / {message.time}</p>
                        </div>
                        <button type="button" className="ui-button">
                          <MessageSquareReply className="h-4 w-4" aria-hidden="true" />
                          {t("parentPortal.messages.reply")}
                        </button>
                      </div>
                      <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">{message.note}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-5 rounded-3xl border border-slate-200/80 bg-slate-50/80 p-5 dark:border-white/10 dark:bg-white/[0.04]">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">{t("parentPortal.messages.sendMessage")}</label>
                  <textarea
                    value={messageDraft}
                    onChange={(event) => {
                      setMessageDraft(event.target.value);
                      setMessageSent(false);
                    }}
                    rows={4}
                    className="ui-input mt-3 w-full resize-none"
                    placeholder={t("parentPortal.messages.placeholder")}
                  />
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      className="ui-button ui-button-primary"
                      onClick={() => {
                        setMessageDraft("");
                        setMessageSent(true);
                      }}
                    >
                      <Send className="h-4 w-4" aria-hidden="true" />
                      {t("parentPortal.messages.send")}
                    </button>
                    {messageSent ? <span className="text-sm font-medium text-emerald-600 dark:text-emerald-300">{t("parentPortal.messages.sent")}</span> : null}
                  </div>
                </div>
              </Card>
            </div>

            <Card className="p-6 sm:p-7">
              <SectionHeader eyebrow={t("parentPortal.timeline.eyebrow")} title={t("parentPortal.timeline.title")} description={t("parentPortal.timeline.description")} />
              <div className="mt-6 grid gap-4 lg:grid-cols-2">
                {selectedChild.timeline.map((event) => (
                  <div key={event.id} className="rounded-3xl border border-slate-200/80 bg-slate-50/80 p-5 dark:border-white/10 dark:bg-white/[0.04]">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-slate-950 dark:text-white">{event.title}</p>
                      <span className="ui-badge ui-badge-neutral">{translateValue(event.type)}</span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{event.description}</p>
                    <p className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">{event.time}</p>
                  </div>
                ))}
              </div>
            </Card>
          </>
        )}
      </PageContainer>

      <ModalShell open={activeModal === "addChild"} onClose={() => { setActiveModal(null); setLinkCode(""); setLinkStatus("idle"); }} title={t("parentPortal.linking.dialogTitle")}>
        <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">{t("parentPortal.linking.dialogDescription")}</p>
        <div className="mt-5 rounded-3xl border border-slate-200/80 bg-slate-50/80 p-5 dark:border-white/10 dark:bg-white/[0.04]">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">{t("parentPortal.linking.linkCodeInput")}</label>
          <input
            value={linkCode}
            onChange={(event) => {
              setLinkCode(event.target.value);
              setLinkStatus("idle");
            }}
            className="ui-input mt-3 w-full"
            placeholder={t("parentPortal.linking.linkCodePlaceholder")}
          />
          <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" className="ui-button" onClick={() => setLinkStatus("codeSent")}>
              {t("parentPortal.linking.codeSentAction")}
            </button>
            <button type="button" className="ui-button ui-button-primary" onClick={handleVerifyCode}>
              {t("parentPortal.linking.verifyCode")}
            </button>
          </div>
        </div>
        <StatusBox title={t(`parentPortal.linking.status.${linkStatus}`)} body={t(`parentPortal.linking.statusDescriptions.${linkStatus}`, { name: selectedChild.name })} />
        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">{t("parentPortal.linking.demoCodes")}</p>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">`CLASSZ-LINK-2040` / `EXPIRE-2040`</p>
      </ModalShell>

      <ModalShell open={activeModal === "report"} onClose={() => setActiveModal(null)} title={t("parentPortal.report.title")}>
        {viewMode === "all" ? (
          <div className="space-y-4">
            <StatusBox title={t("parentPortal.report.familyTitle")} body={t("parentPortal.report.familyDescription")} />
            {children.map((child) => (
              <div key={child.id} className="rounded-3xl border border-slate-200/80 bg-white p-5 dark:border-white/10 dark:bg-white/[0.04]">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-950 dark:text-white">{child.name}</p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{child.gradeLabel} / {child.mainCourse}</p>
                  </div>
                  <span className="ui-badge ui-badge-neutral">{translateValue(child.overallStatus)}</span>
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  <MiniMetric title={t("parentPortal.summaryCards.courseProgress")} value={`${child.summary.courseProgress}%`} />
                  <MiniMetric title={t("parentPortal.summaryCards.averageScore")} value={`${child.summary.averageScore}%`} />
                  <MiniMetric title={t("parentPortal.summaryCards.paymentStatus")} value={translateValue(child.summary.paymentStatus)} />
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">{child.teacherNotes[0]}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <StatusBox title={selectedChild.name} body={selectedChild.parentSummary.actionThisWeek} />
            <div className="grid gap-3 md:grid-cols-3">
              {summaryCards.map((card) => (
                <MiniMetric key={card.label} title={card.label} value={String(card.value)} />
              ))}
            </div>
            <ReportBlock title={t("parentPortal.report.alerts")}>
              {selectedChild.alerts.map((alert) => (
                <p key={alert.id}>{translateValue(alert.type)}: {alert.message}</p>
              ))}
            </ReportBlock>
            <ReportBlock title={t("parentPortal.report.teacherNotes")}>
              {selectedChild.teacherNotes.map((note) => (
                <p key={note}>{note}</p>
              ))}
            </ReportBlock>
          </div>
        )}
        <div className="mt-6 flex flex-wrap gap-3">
          <button type="button" className="ui-button ui-button-primary" onClick={handlePrintReport}>
            <Printer className="h-4 w-4" aria-hidden="true" />
            {t("parentPortal.report.print")}
          </button>
          <button type="button" className="ui-button" onClick={() => setDownloadRequested(true)}>
            <Download className="h-4 w-4" aria-hidden="true" />
            {t("parentPortal.report.downloadPdf")}
          </button>
          {downloadRequested ? <span className="text-sm font-medium text-emerald-600 dark:text-emerald-300">{t("parentPortal.report.downloadMocked")}</span> : null}
        </div>
      </ModalShell>

      <ModalShell open={activeModal === "contact"} onClose={() => setActiveModal(null)} title={t("parentPortal.contactModal.title")}>
        <StatusBox
          title={viewMode === "all" ? t("parentPortal.contactModal.familyModeTitle") : selectedChild.name}
          body={viewMode === "all" ? t("parentPortal.contactModal.familyModeDescription") : selectedChild.messages[0]?.note ?? t("common.empty")}
        />
        <button type="button" className="ui-button mt-4">
          <PhoneCall className="h-4 w-4" aria-hidden="true" />
          {t("parentPortal.contactModal.openWhatsApp")}
        </button>
      </ModalShell>

      <ModalShell open={activeModal === "pay"} onClose={() => setActiveModal(null)} title={t("parentPortal.payModal.title")}>
        <StatusBox
          title={viewMode === "all" ? t("parentPortal.payModal.familyTitle") : selectedChild.name}
          body={viewMode === "all" ? t("parentPortal.payModal.familyDescription", { amount: `$${familySnapshot.totalPending}` }) : t("parentPortal.payModal.childDescription", { amount: selectedChild.payments.pendingAmount })}
        />
        <div className="mt-4 flex flex-wrap gap-3">
          <button type="button" className="ui-button">
            <Receipt className="h-4 w-4" aria-hidden="true" />
            {t("parentPortal.payments.downloadInvoice")}
          </button>
          <button type="button" className="ui-button ui-button-primary" onClick={() => setPaymentRequested(true)}>
            <Wallet className="h-4 w-4" aria-hidden="true" />
            {t("parentPortal.payments.payButton")}
          </button>
        </div>
        {paymentRequested ? <p className="mt-4 text-sm font-medium text-emerald-600 dark:text-emerald-300">{t("parentPortal.payModal.paymentRequested")}</p> : null}
      </ModalShell>
    </>
  );
}

function HeroAction({ icon: Icon, label, onClick, primary = false }: { icon: typeof Plus; label: string; onClick: () => void; primary?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition hover:-translate-y-0.5",
        primary ? "border-teal-300 bg-teal-300 text-slate-950 hover:bg-white" : "border-white/10 bg-white/8 text-white hover:bg-white/14",
      ].join(" ")}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      {label}
    </button>
  );
}

function ChildOverviewCard({
  child,
  selected,
  onSelect,
  translateValue,
  t,
}: {
  child: ParentChild;
  selected: boolean;
  onSelect: () => void;
  translateValue: (value: string) => string;
  t: (key: string, options?: Record<string, unknown>) => string;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={[
        "rounded-[28px] border p-5 text-start transition",
        selected ? "border-teal-500/35 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.12)] dark:border-teal-300/35 dark:bg-slate-900/80" : "border-slate-200/80 bg-white/90 hover:-translate-y-0.5 dark:border-white/10 dark:bg-slate-900/72",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-sm font-bold text-white dark:bg-white dark:text-slate-950">
            {child.avatar}
          </span>
          <div>
            <p className="font-display text-xl font-semibold text-slate-950 dark:text-white">{child.name}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{child.gradeLabel}</p>
          </div>
        </div>
        <span className={`ui-badge ${child.alerts.length > 0 ? "ui-badge-warning" : "ui-badge-success"}`}>
          {child.alerts.length} {t("parentPortal.childCards.alerts")}
        </span>
      </div>
      <div className="mt-4 grid gap-3 text-sm text-slate-600 dark:text-slate-300">
        <p><span className="font-semibold">{t("parentPortal.childCards.mainCourse")}:</span> {child.mainCourse}</p>
        <p><span className="font-semibold">{t("parentPortal.childCards.status")}:</span> {translateValue(child.overallStatus)}</p>
        <p><span className="font-semibold">{t("parentPortal.childCards.progress")}:</span> {child.summary.courseProgress}%</p>
      </div>
    </button>
  );
}

function ComparisonCard({
  child,
  translateValue,
  t,
}: {
  child: ParentChild;
  translateValue: (value: string) => string;
  t: (key: string, options?: Record<string, unknown>) => string;
}) {
  return (
    <div className="rounded-[28px] border border-slate-200/80 bg-white/90 p-5 dark:border-white/10 dark:bg-slate-900/72">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-display text-xl font-semibold text-slate-950 dark:text-white">{child.name}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">{child.gradeLabel}</p>
        </div>
        <span className="ui-badge ui-badge-neutral">{translateValue(child.overallStatus)}</span>
      </div>
      <div className="mt-5 space-y-3 text-sm text-slate-600 dark:text-slate-300">
        <ComparisonRow label={t("parentPortal.summaryCards.courseProgress")} value={`${child.summary.courseProgress}%`} />
        <ComparisonRow label={t("parentPortal.summaryCards.averageScore")} value={`${child.summary.averageScore}%`} />
        <ComparisonRow label={t("parentPortal.summaryCards.missingHomework")} value={`${child.summary.missingHomework}`} />
        <ComparisonRow label={t("parentPortal.summaryCards.attendance")} value={`${child.summary.attendanceRate}%`} />
        <ComparisonRow label={t("parentPortal.summaryCards.paymentStatus")} value={translateValue(child.summary.paymentStatus)} />
        <ComparisonRow label={t("parentPortal.allChildren.latestTeacherNote")} value={child.teacherNotes[0]} />
      </div>
    </div>
  );
}

function SummaryBlock({ title, body, tone }: { title: string; body: string; tone: "success" | "warning" | "primary" }) {
  const toneClass =
    tone === "success"
      ? "border-emerald-200 bg-emerald-50/80 dark:border-emerald-400/15 dark:bg-emerald-400/10"
      : tone === "warning"
        ? "border-amber-200 bg-amber-50/80 dark:border-amber-400/15 dark:bg-amber-400/10"
        : "border-teal-200 bg-teal-50/80 dark:border-teal-400/15 dark:bg-teal-400/10";

  return (
    <div className={`rounded-3xl border p-5 ${toneClass}`}>
      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{title}</p>
      <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{body}</p>
    </div>
  );
}

function AlertRow({
  severity,
  title,
  message,
  time,
  t,
}: {
  severity: AlertSeverity;
  title: string;
  message: string;
  time: string;
  t: (key: string, options?: Record<string, unknown>) => string;
}) {
  const Icon = severity === "critical" ? AlertCircle : severity === "warning" ? TriangleAlert : severity === "positive" ? CheckCircle2 : Bell;

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-slate-50/80 p-5 dark:border-white/10 dark:bg-white/[0.04]">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950/5 text-slate-700 dark:bg-white/10 dark:text-slate-200">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="font-semibold text-slate-950 dark:text-white">{title}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{time}</p>
          </div>
        </div>
        <span className={`ui-badge ${severityToneMap[severity]}`}>{t(`parentPortal.alerts.severity.${severity}`)}</span>
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">{message}</p>
    </div>
  );
}

function CourseProgressCard({
  course,
  t,
}: {
  course: ParentChild["progress"]["courses"][number];
  t: (key: string, options?: Record<string, unknown>) => string;
}) {
  return (
    <div className="rounded-[28px] border border-slate-200/80 bg-slate-50/80 p-5 dark:border-white/10 dark:bg-white/[0.04]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-xl font-semibold text-slate-950 dark:text-white">{course.name}</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t("parentPortal.progress.lastActivity")}: {course.lastActivity}</p>
        </div>
        <span className="ui-badge ui-badge-neutral">{course.progress}%</span>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
        <div className="h-full rounded-full bg-gradient-to-r from-teal-500 via-sky-500 to-amber-300" style={{ width: `${course.progress}%` }} />
      </div>
      <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">{t("parentPortal.progress.watchTime")}: {course.watchTime}</p>
    </div>
  );
}

function ComparisonRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-slate-500 dark:text-slate-400">{label}</span>
      <span className="max-w-[60%] text-end font-medium text-slate-900 dark:text-white">{value}</span>
    </div>
  );
}

function MiniMetric({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/[0.04]">
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">{title}</p>
      <p className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">{value}</p>
    </div>
  );
}

function StatusBox({ title, body }: { title: string; body: string }) {
  return (
    <div className="mt-5 rounded-3xl border border-slate-200/80 bg-slate-50/80 p-5 dark:border-white/10 dark:bg-white/[0.04]">
      <p className="font-semibold text-slate-950 dark:text-white">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{body}</p>
    </div>
  );
}

function ReportBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white p-5 dark:border-white/10 dark:bg-white/[0.04]">
      <h3 className="font-semibold text-slate-950 dark:text-white">{title}</h3>
      <div className="mt-3 space-y-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{children}</div>
    </div>
  );
}

function ModalShell({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  const { t } = useTranslation();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[28px] border border-white/10 bg-white p-6 shadow-[0_28px_90px_rgba(15,23,42,0.35)] dark:bg-slate-950 sm:p-7">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-display text-2xl font-semibold text-slate-950 dark:text-white">{title}</h2>
          <button type="button" className="ui-button" onClick={onClose}>
            <X className="h-4 w-4" aria-hidden="true" />
            {t("common.cancel")}
          </button>
        </div>
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}

