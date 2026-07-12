import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Award,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  Loader2,
  Printer,
  Share2,
  Shield,
  Sparkles,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DashPage } from "@/components/common/DashPage";
import { GradientButton } from "@/components/premium/GradientButton";
import { ROLES } from "@/lib/roles";
import { useApp } from "@/lib/app-context";
import { listMyCertificates, type CertificateRead, type CertificateStatus } from "@/lib/api/certificates";
import { QRCodeBlock } from "@/components/certificates/QRCodeBlock";

export const Route = createFileRoute("/student/certificates")({
  component: CertificatesPage,
});

const statusLabel: Record<CertificateStatus, { en: string; ar: string }> = {
  issued: { en: "Issued", ar: "صادرة" },
  pending: { en: "Pending", ar: "قيد الإصدار" },
  revoked: { en: "Revoked", ar: "ملغاة" },
};

function CertificatesPage() {
  const { lang } = useApp();
  const t = (en: string, ar: string) => (lang === "ar" ? ar : en);

  const [certs, setCerts] = useState<CertificateRead[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const items = await listMyCertificates();
        if (active) {
          setCerts(items);
          setActiveIdx(0);
        }
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Failed to load certificates");
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, []);

  const cert = certs[activeIdx];

  const prev = () => setActiveIdx((i) => (i - 1 + certs.length) % certs.length);
  const next = () => setActiveIdx((i) => (i + 1) % certs.length);

  const issueDate = cert
    ? new Date(cert.issued_at).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  return (
    <DashPage
      role="student"
      title={t("Certification", "الشهادات")}
      subtitle={t("Your earned certificates", "شهاداتك")}
      icon={ROLES.student.icon}
    >
      {loading && (
        <StateShell>
          <Loader2 className="h-6 w-6 animate-spin text-violet-300" /> {t("Loading certificates…", "جارٍ تحميل الشهادات...")}
        </StateShell>
      )}

      {!loading && error && (
        <StateShell>{t("Certificates unavailable", "الشهادات غير متاحة")}: {error}</StateShell>
      )}

      {!loading && !error && certs.length === 0 && (
        <StateShell>
          {t(
            "No certificates yet — complete a course to earn one.",
            "لا توجد شهادات بعد — أكمل مساقًا للحصول على واحدة.",
          )}
        </StateShell>
      )}

      {!loading && !error && cert && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06, duration: 0.5 }}
          className="space-y-5"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <button
                onClick={prev}
                disabled={certs.length < 2}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-300 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-30"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div className="min-w-0 flex-1">
                <HonorCertificate cert={cert} issueDate={issueDate} lang={lang} />
              </div>
              <button
                onClick={next}
                disabled={certs.length < 2}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-300 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-30"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            <div className="flex flex-wrap justify-center gap-2">
              <GradientButton size="sm"><Download className="h-3.5 w-3.5" /> {t("Download", "تحميل")}</GradientButton>
              <GradientButton variant="outline" size="sm" onClick={() => setShowShareModal(true)}>
                <Share2 className="h-3.5 w-3.5" /> {t("Share", "مشاركة")}
              </GradientButton>
              <GradientButton variant="outline" size="sm"><Printer className="h-3.5 w-3.5" /> {t("Print", "طباعة")}</GradientButton>
            </div>

            {certs.length > 1 && (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                {certs.map((c, i) => (
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
                    <Award className="h-5 w-5 text-amber-300" />
                    <p className="max-w-full truncate text-[10px] font-semibold text-white">{c.course_title}</p>
                    <p className="max-w-full truncate text-[9px] text-slate-500">{c.title}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Panel title={t("Certificate Details", "تفاصيل الشهادة")} icon={Award}>
              <div className="space-y-2">
                <DetailRow label={t("Title", "العنوان")} value={cert.title} />
                <DetailRow label={t("Course", "المساق")} value={cert.course_title} />
                <DetailRow label={t("Certificate ID", "رقم الشهادة")} value={cert.public_code} />
                <DetailRow label={t("Issue Date", "تاريخ الإصدار")} value={issueDate} />
              </div>
            </Panel>

            <Panel title={t("Status", "الحالة")} icon={Shield}>
              <div className="text-center">
                <Shield
                  className={cn(
                    "mx-auto h-10 w-10",
                    cert.status === "issued" && "text-emerald-400",
                    cert.status === "pending" && "text-amber-300",
                    cert.status === "revoked" && "text-red-400",
                  )}
                />
                <p className="mt-2 text-xl font-bold text-white">
                  {lang === "ar" ? statusLabel[cert.status].ar : statusLabel[cert.status].en}
                </p>
              </div>
            </Panel>
          </div>
        </motion.div>
      )}

      {showShareModal && cert && (
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
            <p className="mt-3 text-2xl font-bold text-white">{cert.student_name}</p>
            <p className="mt-1 text-lg font-semibold text-amber-200">{cert.title}</p>
            <p className="text-sm text-slate-400">{cert.course_title}</p>
            <p className="mt-1 text-[10px] text-slate-600">ID: {cert.public_code}</p>
            <div className="mx-auto mt-3 h-px w-32 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <div className="mt-3 flex gap-2">
              <GradientButton
                variant="outline"
                size="sm"
                className="flex-1 justify-center"
                onClick={() => {
                  const text = `${cert.student_name} — ${cert.title} — ${cert.course_title} — CLASSZ Certification`;
                  navigator.clipboard.writeText(text).catch(() => {});
                }}
              >
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

function HonorCertificate({ cert, issueDate, lang }: { cert: CertificateRead; issueDate: string; lang: string }) {
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

          <p className="mt-2 text-3xl font-bold text-amber-200 sm:text-4xl">{cert.title}</p>
          <p className="mt-1 text-sm text-slate-400">{cert.course_title}</p>

          <div className="mx-auto mb-4 mt-4 h-px w-36 bg-gradient-to-r from-transparent via-white/12 to-transparent" />

          <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">
            {t("Awarded to", "يُمنح إلى")}
          </p>
          <p className="mt-1 text-3xl font-bold text-white sm:text-4xl">{cert.student_name}</p>

          <div className="mt-4 flex justify-center">
            <div className="grid h-14 w-14 place-items-center rounded-2xl border-2 border-amber-300/35 bg-amber-300/10 p-1.5">
              <QRCodeBlock certificateId={cert.public_code} size={48} />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-center gap-4 text-[10px] text-slate-600">
            <span>ID: {cert.public_code}</span>
            <span>&middot;</span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" /> {issueDate}
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

function StateShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,24,42,0.96),rgba(10,14,28,0.92))] p-8 text-center shadow-lg">
      <div className="flex items-center justify-center gap-3 text-slate-300">{children}</div>
    </div>
  );
}
