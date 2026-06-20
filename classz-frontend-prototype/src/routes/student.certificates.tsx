import { useState, useCallback } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Award,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Copy,
  Crown,
  Download,
  Medal,
  Printer,
  Share2,
  Shield,
  Sparkles,
  Star,
  TrendingUp,
  Trophy,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DashPage } from "@/components/common/DashPage";
import { GradientButton } from "@/components/premium/GradientButton";
import { ROLES } from "@/lib/roles";
import { useApp } from "@/lib/app-context";
import { certificates as initialCerts, type CertificateData } from "@/lib/certificatesMock";
import { QRCodeBlock } from "@/components/certificates/QRCodeBlock";
import { LEGENDARY_TITLES, getLegendaryTitle } from "@/constants/legendaryTitles";

export const Route = createFileRoute("/student/certificates")({
  component: CertificatesPage,
});

const rankIcons: Record<number, React.ElementType> = { 1: Crown, 2: Medal, 3: Shield };
const rankBadgeColor: Record<number, string> = {
  1: "text-amber-300 bg-amber-300/15 border-amber-300/40",
  2: "text-slate-200 bg-slate-300/15 border-slate-300/40",
  3: "text-orange-300 bg-orange-300/15 border-orange-300/40",
};

function CertificatesPage() {
  const { lang } = useApp();
  const [certs, setCerts] = useState<CertificateData[]>(() => [...initialCerts]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const cert = certs[activeIdx];
  const isTop3 = cert.rank !== null && cert.rank <= 3;

  const prev = () => setActiveIdx((i) => (i - 1 + certs.length) % certs.length);
  const next = () => setActiveIdx((i) => (i + 1) % certs.length);

  const publishToHall = useCallback(() => {
    const until = new Date();
    until.setDate(until.getDate() + 7);
    setCerts((p) =>
      p.map((c) =>
        c.id === cert.id
          ? { ...c, hallOfHonorPublished: true, featuredUntil: until.toISOString().slice(0, 10) }
          : c,
      ),
    );
    setShowPublishModal(false);
  }, [cert.id]);

  const featuredDaysLeft = cert.featuredUntil
    ? Math.max(0, Math.ceil((new Date(cert.featuredUntil).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  const t = (en: string, ar: string) => (lang === "ar" ? ar : en);
  const legendary = getLegendaryTitle(cert.rank);

  return (
    <DashPage
      role="student"
      title={t("Certification", "الشهادات")}
      subtitle={t("Your earned certificates & achievements", "شهاداتك وإنجازاتك")}
      icon={ROLES.student.icon}
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.06, duration: 0.5 }}
        className="space-y-5"
      >
        {/* ═══ CERTIFICATE ═══ */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <button onClick={prev} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-300 transition-colors hover:bg-white/10 hover:text-white">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="min-w-0 flex-1">
              <HonorCertificate cert={cert} lang={lang} />
            </div>
            <button onClick={next} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-300 transition-colors hover:bg-white/10 hover:text-white">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap justify-center gap-2">
            <GradientButton size="sm"><Download className="h-3.5 w-3.5" /> {t("Download", "تحميل")}</GradientButton>
            <GradientButton variant="outline" size="sm" onClick={() => setShowShareModal(true)}>
              <Share2 className="h-3.5 w-3.5" /> {t("Share", "مشاركة")}
            </GradientButton>
            <GradientButton variant="outline" size="sm"><Printer className="h-3.5 w-3.5" /> {t("Print", "طباعة")}</GradientButton>
          </div>

          {/* Carousel */}
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {certs.map((c, i) => {
              const cLegendary = getLegendaryTitle(c.rank);
              return (
                <button
                  key={c.id}
                  onClick={() => setActiveIdx(i)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-2xl border p-3 transition-all",
                    i === activeIdx
                      ? "border-violet-500/40 bg-violet-500/10 ring-1 ring-violet-500/30"
                      : "border-white/8 bg-white/[0.03] hover:bg-white/[0.06]",
                  )}
                >
                  <span className="text-2xl">{c.emoji}</span>
                  <p className="max-w-full truncate text-[10px] font-semibold text-white">{c.subjectName}</p>
                  <p className="text-[9px] text-slate-500">
                    {cLegendary
                      ? (lang === "ar" ? cLegendary.titleAr : cLegendary.title)
                      : (lang === "ar" ? c.challengeTitle.ar : c.challengeTitle.en)}
                  </p>
                  <div className="flex gap-1">
                    {cLegendary && (
                      <span className={cn("rounded-full border px-1.5 py-0.5 text-[8px] font-bold", rankBadgeColor[c.rank!])}>
                        #{c.rank}
                      </span>
                    )}
                    {c.hallOfHonorPublished && (
                      <span className="rounded-full bg-amber-300/15 px-1.5 py-0.5 text-[8px] font-bold text-amber-300">
                        Featured
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ═══ DETAILS GRID — below certificate ═══ */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Panel title={t("Certificate Details", "تفاصيل الشهادة")} icon={Award}>
            <div className="space-y-2">
              <DetailRow label={t("Subject", "المادة")} value={cert.subjectName} />
              <DetailRow label={t("Course", "المساق")} value={cert.courseName} />
              <DetailRow label={t("Grade", "التقدير")} value={lang === "ar" ? cert.gradeAr : cert.grade} />
              <DetailRow label={t("Certificate ID", "رقم الشهادة")} value={cert.certificateId} />
              <DetailRow label={t("Issue Date", "تاريخ الإصدار")} value={cert.issueDate} />
            </div>
          </Panel>

          <Panel title={t("Challenge Status", "حالة التحدي")} icon={Trophy}>
            <div className="text-center">
              {legendary ? (
                <>
                  {(() => { const Icon = rankIcons[cert.rank!]; return <Icon className={cn("mx-auto h-10 w-10", cert.rank === 1 ? "text-amber-300" : cert.rank === 2 ? "text-slate-200" : "text-orange-300")} />; })()}
                  <p
                    className="mt-2 text-xl font-bold"
                    style={{
                      background: legendary.metalGradient,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      textShadow: "none",
                    }}
                  >
                    {lang === "ar" ? legendary.titleAr : legendary.title}
                  </p>
                  <p className="text-xs text-slate-400">
                    {lang === "ar" ? legendary.title : legendary.titleAr}
                  </p>
                  <span className={cn("mt-2 inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-bold", rankBadgeColor[cert.rank!])}>
                    #{cert.rank} {t("in Subject", "في المادة")}
                  </span>
                </>
              ) : (
                <>
                  <Star className="mx-auto h-10 w-10 text-violet-400" />
                  <p className="mt-2 text-xl font-bold text-white">
                    {lang === "ar" ? cert.challengeTitle.ar : cert.challengeTitle.en}
                  </p>
                  <p className="text-xs text-slate-400">
                    {lang === "ar" ? cert.challengeTitle.en : cert.challengeTitle.ar}
                  </p>
                </>
              )}
            </div>
          </Panel>

          <Panel title={t("Performance", "الأداء")} icon={TrendingUp}>
            <div className="space-y-3">
              <ProgressRow label={t("Completion", "الإكمال")} value={cert.completionPercent} color="from-violet-500 to-blue-500" />
              <ProgressRow label={t("Improvement", "التحسن")} value={cert.improvementPercent} color="from-emerald-500 to-cyan-500" />
              <ProgressRow label={t("Average Score", "المعدل")} value={cert.averageScore} color="from-amber-500 to-orange-500" />
              {cert.rank && (
                <DetailRow label={t("Rank", "الترتيب")} value={`#${cert.rank}`} />
              )}
            </div>
          </Panel>

          <Panel title={t("Hall of Honor", "قاعة الشرف")} icon={Crown}>
            {isTop3 ? (
              cert.hallOfHonorPublished ? (
                <div className="text-center">
                  <div className="mx-auto mb-2 grid h-12 w-12 place-items-center rounded-full border-2 border-amber-300/40 bg-amber-300/10">
                    <CheckCircle2 className="h-6 w-6 text-amber-300" />
                  </div>
                  <p className="text-sm font-semibold text-amber-200">
                    {t("Published to Hall of Honor", "تم النشر في قاعة الشرف")}
                  </p>
                  {featuredDaysLeft > 0 && (
                    <p className="mt-1 text-xs text-slate-400">
                      {t(`Featured for ${featuredDaysLeft} days remaining`, `متبقي ${featuredDaysLeft} أيام`)}
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center">
                  <p className="mb-3 text-sm text-slate-300">
                    {t(
                      "Your Top 3 achievement can be featured on the CLASSZ Hall of Honor for 7 days.",
                      "إنجازك في أعلى 3 يمكن عرضه في قاعة الشرف لمدة 7 أيام.",
                    )}
                  </p>
                  <GradientButton size="sm" className="w-full justify-center" onClick={() => setShowPublishModal(true)}>
                    <Trophy className="h-3.5 w-3.5" /> {t("Publish to Hall of Honor", "انشر في قاعة الشرف")}
                  </GradientButton>
                </div>
              )
            ) : (
              <div className="text-center">
                <Shield className="mx-auto h-8 w-8 text-slate-600" />
                <p className="mt-2 text-sm text-slate-500">
                  {t(
                    "Only Top 3 achievements can be featured on Hall of Honor.",
                    "فقط أعلى 3 إنجازات يمكن عرضها في قاعة الشرف.",
                  )}
                </p>
              </div>
            )}
          </Panel>
        </div>
      </motion.div>

      {/* ═══ PUBLISH MODAL ═══ */}
      {showPublishModal && (
        <Modal onClose={() => setShowPublishModal(false)}>
          <div className="text-center">
            <Trophy className="mx-auto h-12 w-12 text-amber-300" />
            <h3 className="mt-3 text-lg font-bold text-white">
              {t("Publish to Hall of Honor?", "النشر في قاعة الشرف؟")}
            </h3>
            <p className="mt-2 text-sm text-slate-400">
              {t(
                "Your achievement will be featured on the CLASSZ landing page for 7 days.",
                "سيتم عرض إنجازك في الصفحة الرئيسية لـ CLASSZ لمدة 7 أيام.",
              )}
            </p>
            <div className="mt-3 rounded-2xl border border-amber-300/20 bg-amber-300/[0.06] p-3">
              <p className="text-sm font-semibold text-amber-200">
                {legendary ? (lang === "ar" ? legendary.titleAr : legendary.title) : cert.challengeTitle.en}
              </p>
              <p className="text-xs text-slate-400">{cert.subjectName} · #{cert.rank}</p>
            </div>
            <div className="mt-4 flex gap-2">
              <GradientButton size="sm" className="flex-1 justify-center" onClick={publishToHall}>
                <CheckCircle2 className="h-3.5 w-3.5" /> {t("Confirm", "تأكيد")}
              </GradientButton>
              <GradientButton variant="outline" size="sm" className="flex-1 justify-center" onClick={() => setShowPublishModal(false)}>
                {t("Cancel", "إلغاء")}
              </GradientButton>
            </div>
          </div>
        </Modal>
      )}

      {/* ═══ SHARE MODAL ═══ */}
      {showShareModal && (
        <Modal onClose={() => setShowShareModal(false)}>
          <div className="text-center">
            <div className="mb-3 flex items-center justify-center gap-2 text-amber-300">
              <Sparkles className="h-5 w-5" />
              <span className="text-lg font-bold tracking-[0.2em]">CLASSZ</span>
              <Sparkles className="h-5 w-5" />
            </div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
              {t("Certification", "الشهادات")}
            </p>
            <div className="mx-auto mt-2 h-px w-32 bg-gradient-to-r from-transparent via-amber-300/30 to-transparent" />
            <p className="mt-3 text-2xl font-bold text-white">{cert.studentName}</p>
            <p className="mt-1 text-lg font-semibold text-amber-200">
              {legendary ? (lang === "ar" ? legendary.titleAr : legendary.title) : (lang === "ar" ? cert.challengeTitle.ar : cert.challengeTitle.en)}
            </p>
            <p className="text-sm text-slate-400">{cert.subjectName} · {cert.courseName}</p>
            {isTop3 && <p className="mt-1 text-xs text-slate-500">Rank #{cert.rank}</p>}
            <p className="mt-1 text-xs text-slate-600">{t("Honored by", "تكريم من")} {cert.teacherName}</p>
            <p className="mt-1 text-[10px] text-slate-600">ID: {cert.certificateId}</p>
            {cert.hallOfHonorPublished && (
              <p className="mt-2 text-xs text-amber-400">
                {t("Featured on CLASSZ Hall of Honor", "معروض في قاعة الشرف")}
              </p>
            )}
            <div className="mx-auto mt-3 h-px w-32 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <div className="mt-3 flex gap-2">
              <GradientButton variant="outline" size="sm" className="flex-1 justify-center" onClick={() => {
                const title = legendary?.title ?? cert.challengeTitle.en;
                const text = `${cert.studentName} — ${title} — ${cert.subjectName} #${cert.rank ?? ""} — CLASSZ Certification`;
                navigator.clipboard.writeText(text).catch(() => {});
              }}>
                <Copy className="h-3.5 w-3.5" /> {t("Copy", "نسخ")}
              </GradientButton>
              <GradientButton variant="outline" size="sm" className="flex-1 justify-center">
                <Download className="h-3.5 w-3.5" /> {t("Save", "حفظ")}
              </GradientButton>
              <GradientButton variant="outline" size="sm" className="flex-1 justify-center">
                <Printer className="h-3.5 w-3.5" /> {t("Print", "طباعة")}
              </GradientButton>
            </div>
          </div>
        </Modal>
      )}
    </DashPage>
  );
}

// ── Certificate Display ────────────────────────────────────────────

const OVERLAY = {
  studentName:   { top: "49%",  left: "55%" },
  courseName:    { top: "73%",  left: "53%" },
  teacherName:   { top: "85%",  left: "70%" },
  certificateId: { top: "5.5%", right: "4.5%" },
  qrCode:        { top: "20.5%", right: "7%" },
} as const;

function HonorCertificate({ cert, lang }: { cert: CertificateData; lang: string }) {
  const legendary = getLegendaryTitle(cert.rank);

  if (legendary) {
    return <TemplateCertificate cert={cert} lang={lang} legendary={legendary} />;
  }

  return <FallbackCertificate cert={cert} lang={lang} />;
}

function TemplateCertificate({
  cert,
  lang,
  legendary,
}: {
  cert: CertificateData;
  lang: string;
  legendary: NonNullable<ReturnType<typeof getLegendaryTitle>>;
}) {
  return (
    <motion.div
      key={cert.id}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.45 }}
      className={cn("relative overflow-hidden rounded-[20px] border-2 p-0.5", legendary.glow)}
    >
      <div
        className="relative w-full overflow-hidden rounded-[18px]"
        style={{ aspectRatio: "3 / 2", containerType: "inline-size" }}
      >
        <img
          src={legendary.certificateImage}
          alt={`${legendary.title} Certificate`}
          className="absolute inset-0 h-full w-full object-cover"
          draggable={false}
        />

        <div className="pointer-events-none absolute inset-0" style={{ direction: "ltr" }}>

          {/* Student Name */}
          <div
            className="absolute -translate-x-1/2 -translate-y-1/2 text-center"
            style={{ top: OVERLAY.studentName.top, left: OVERLAY.studentName.left }}
          >
            <span
              className="inline-block whitespace-nowrap uppercase"
              style={{
                fontFamily: "'Cinzel', serif",
                fontWeight: 700,
                fontSize: "3.6cqw",
                letterSpacing: "0.12cqw",
                color: "#1A1A2E",
                textShadow: "0 1px 0 #D4C5A9, 0 2px 0 #C4B599, 0 3px 2px rgba(0,0,0,0.15), 0 0 4px rgba(0,0,0,0.08)",
              }}
            >
              {cert.studentName}
            </span>
          </div>

          {/* Course Name */}
          <div
            className="absolute -translate-x-1/2 -translate-y-1/2 text-center"
            style={{ top: OVERLAY.courseName.top, left: OVERLAY.courseName.left }}
          >
            <span
              className="inline-block whitespace-nowrap uppercase"
              style={{
                fontFamily: "'Cinzel', serif",
                fontWeight: 700,
                fontSize: "1.6cqw",
                letterSpacing: "0.25cqw",
                color: "#2C2C3A",
                textShadow: "0 1px 0 #D4C5A9, 0 2px 1px rgba(0,0,0,0.12), 0 0 3px rgba(0,0,0,0.06)",
              }}
            >
              {cert.courseName}
            </span>
          </div>

          {/* Certificate ID */}
          <div
            className="absolute text-right"
            style={{ top: OVERLAY.certificateId.top, right: OVERLAY.certificateId.right }}
          >
            <span
              className="inline-block font-mono font-semibold tracking-wide"
              style={{
                fontSize: "0.85cqw",
                color: "#1A1A2E",
              }}
            >
              {cert.certificateId}
            </span>
          </div>

          {/* Teacher Name — signature style */}
          <div
            className="absolute -translate-x-1/2 -translate-y-1/2 text-center"
            style={{ top: OVERLAY.teacherName.top, left: OVERLAY.teacherName.left }}
          >
            <span
              className="inline-block whitespace-nowrap"
              style={{
                fontFamily: "'Great Vibes', cursive",
                fontWeight: 700,
                fontSize: "2.07cqw",
                color: "#1A1A2E",
                borderBottom: "1px solid rgba(26,26,46,0.3)",
                paddingBottom: "0.15cqw",
              }}
            >
              {cert.teacherName}
            </span>
          </div>

          {/* QR Code — matched to template position and rank colors */}
          <div
            className="absolute"
            style={{ top: OVERLAY.qrCode.top, right: OVERLAY.qrCode.right }}
          >
            <div
              style={{
                width: "10cqw",
                height: "10cqw",
                border: `2px solid ${legendary.qrFg}`,
                borderRadius: "0.4cqw",
                padding: "0.4cqw",
                backgroundColor: legendary.qrBg,
              }}
            >
              <QRCodeBlock
                certificateId={cert.certificateId}
                size={80}
                fgColor={legendary.qrFg}
                bgColor={legendary.qrBg}
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Fallback Certificate (non-top-3, custom drawn) ─────────────────

function FallbackCertificate({ cert, lang }: { cert: CertificateData; lang: string }) {
  const t = (en: string, ar: string) => (lang === "ar" ? ar : en);

  return (
    <motion.div
      key={cert.id}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.45 }}
      className="relative overflow-hidden rounded-[32px] border-2 border-violet-500/20 p-1 shadow-[0_30px_80px_rgba(3,5,18,0.5)]"
    >
      <div className="relative overflow-hidden rounded-[28px] border border-amber-300/15 bg-[radial-gradient(circle_at_top,rgba(88,28,135,0.18),transparent_35%),linear-gradient(180deg,rgba(13,17,35,0.99),rgba(9,12,26,0.97))] p-6 sm:p-8">
        <div className="absolute left-5 top-5 h-14 w-14 rounded-tl-2xl border-l-2 border-t-2 border-amber-300/30" />
        <div className="absolute right-5 top-5 h-14 w-14 rounded-tr-2xl border-r-2 border-t-2 border-amber-300/30" />
        <div className="absolute bottom-5 left-5 h-14 w-14 rounded-bl-2xl border-b-2 border-l-2 border-amber-300/30" />
        <div className="absolute bottom-5 right-5 h-14 w-14 rounded-br-2xl border-b-2 border-r-2 border-amber-300/30" />

        <div className="relative text-center">
          <div className="mb-2 flex items-center justify-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-300" />
            <span className="text-lg font-bold tracking-[0.35em] text-amber-200">CLASSZ</span>
            <Sparkles className="h-5 w-5 text-amber-300" />
          </div>

          <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-slate-400">
            {t("Certificate of Achievement", "شهادة إنجاز")}
          </p>

          <div className="mx-auto mb-4 mt-3 h-px w-56 bg-gradient-to-r from-transparent via-amber-300/40 to-transparent" />

          <p className="text-[10px] uppercase tracking-[0.35em] text-slate-500">
            {t("Challenge Title", "لقب التحدي")}
          </p>

          <Star className="mx-auto mt-2 h-7 w-7 text-violet-400" />

          <p className="mt-2 text-3xl font-bold text-amber-200 sm:text-4xl">
            {lang === "ar" ? cert.challengeTitle.ar : cert.challengeTitle.en}
          </p>
          <p className="mt-1 text-sm text-slate-400">
            {lang === "ar" ? cert.challengeTitle.en : cert.challengeTitle.ar}
          </p>

          <p className="mx-auto mt-3 max-w-md text-sm italic text-slate-400/80">
            &ldquo;{lang === "ar" ? cert.honorQuote.ar : cert.honorQuote.en}&rdquo;
          </p>

          <div className="mx-auto mb-4 mt-4 h-px w-36 bg-gradient-to-r from-transparent via-white/12 to-transparent" />

          <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">
            {t("Awarded to", "يُمنح إلى")}
          </p>
          <p className="mt-1 text-3xl font-bold text-white sm:text-4xl">{cert.studentName}</p>

          <div className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-2.5">
            <span className="text-2xl">{cert.emoji}</span>
            <div className="text-left">
              <p className="text-sm font-semibold text-white">{cert.subjectName}</p>
              <p className="text-[10px] text-slate-400">{cert.courseName}</p>
            </div>
          </div>

          <div className="mt-4 flex justify-center">
            <div className="rounded-2xl border border-amber-300/20 bg-amber-300/[0.06] px-6 py-2">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{t("Grade", "التقدير")}</p>
              <p className="text-2xl font-bold text-amber-200">{lang === "ar" ? cert.gradeAr : cert.grade}</p>
            </div>
          </div>

          <div className="mx-auto mb-4 mt-5 h-px w-56 bg-gradient-to-r from-transparent via-amber-300/25 to-transparent" />

          <div className="flex items-center justify-center gap-8">
            <div className="text-center">
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                {t("Honored by", "تكريم من")}
              </p>
              <p className="mt-1 font-serif text-lg italic text-slate-300">{cert.teacherName}</p>
              <p className="text-[10px] text-slate-500">{cert.teacherTitle}</p>
              <div className="mx-auto mt-1.5 h-px w-28 bg-slate-500" />
              <p className="mt-1 text-[9px] uppercase tracking-[0.2em] text-slate-600">
                {t("Teacher Signature", "توقيع المعلم")}
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-full border-2 border-amber-300/35 bg-amber-300/10 shadow-[0_0_30px_rgba(252,211,77,0.12)]">
                <Shield className="h-7 w-7 text-amber-300" />
              </div>
              <p className="mt-1 text-[9px] uppercase tracking-[0.2em] text-slate-600">
                {t("CLASSZ Seal", "ختم CLASSZ")}
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-center gap-4 text-[10px] text-slate-600">
            <span>ID: {cert.certificateId}</span>
            <span>&middot;</span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" /> {cert.issueDate}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[22px] border border-white/10 bg-[rgba(10,14,28,0.98)] p-6 shadow-2xl">
        <button onClick={onClose} className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-white/10 hover:text-white">
          <X className="h-4 w-4" />
        </button>
        {children}
      </div>
    </>
  );
}

function Panel({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,24,42,0.96),rgba(10,14,28,0.92))] p-5 shadow-lg">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-200">
        <Icon className="h-4 w-4 text-amber-300" /> {title}
      </div>
      {children}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2">
      <span className="text-xs text-slate-500">{label}</span>
      <span className="text-xs font-medium text-slate-200">{value}</span>
    </div>
  );
}

function ProgressRow({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="text-slate-400">{label}</span>
        <span className="font-semibold text-white">{value}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <div className={cn("h-full rounded-full bg-gradient-to-r", color)} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
