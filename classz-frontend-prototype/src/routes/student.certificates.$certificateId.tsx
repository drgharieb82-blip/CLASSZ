import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft, Award, Calendar, Shield, User } from "lucide-react";
import { CertificatePreview } from "@/components/certificates/CertificatePreview";
import type { CertificateOverlayData } from "@/components/certificates/CertificateOverlay";
import { useApp } from "@/lib/app-context";
import { LEGENDARY_TITLES, getLegendaryTitle } from "@/constants/legendaryTitles";

export const Route = createFileRoute("/student/certificates/$certificateId")({
  component: CertificatePage,
});

const mockCertificates: Record<string, CertificateOverlayData> = {
  "CLZ-2026-00001": {
    studentName: "Ahmed Mohamed Gharib",
    rank: 1,
    positionTitle: LEGENDARY_TITLES[1].title,
    courseName: "Organic Chemistry Final Revision",
    completionDate: "20 June 2026",
    teacherName: "Dr. Ahmed Gharib",
    certificateId: "CLZ-2026-00001",
  },
  "CLZ-2026-00002": {
    studentName: "Aya Mansour",
    rank: 2,
    positionTitle: LEGENDARY_TITLES[2].title,
    courseName: "Advanced Mathematics",
    completionDate: "18 June 2026",
    teacherName: "Dr. Layla Hassan",
    certificateId: "CLZ-2026-00002",
  },
  "CLZ-2026-00003": {
    studentName: "Omar Tarek",
    rank: 3,
    positionTitle: LEGENDARY_TITLES[3].title,
    courseName: "Physics Grade 12",
    completionDate: "15 June 2026",
    teacherName: "Mr. Omar Khalil",
    certificateId: "CLZ-2026-00003",
  },
};

function CertificatePage() {
  const { certificateId } = Route.useParams();
  const { lang } = useApp();
  const cert = mockCertificates[certificateId];

  const t = (en: string, ar: string) => (lang === "ar" ? ar : en);

  if (!cert) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#080C1A] text-white">
        <Shield className="h-16 w-16 text-slate-600" />
        <h1 className="text-2xl font-bold">
          {t("Certificate Not Found", "الشهادة غير موجودة")}
        </h1>
        <p className="text-slate-400">
          {t("No certificate found with ID:", "لم يتم العثور على شهادة بالرقم:")}{" "}
          <code className="rounded bg-white/10 px-2 py-0.5 font-mono text-sm">
            {certificateId}
          </code>
        </p>
        <Link
          to="/student/certificates"
          className="mt-2 inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-2 text-sm font-semibold text-slate-200 transition-all hover:bg-white/10"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("Back to Certificates", "العودة إلى الشهادات")}
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080C1A] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center gap-4"
        >
          <Link
            to="/student/certificates"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">
              {t("Certificate Preview", "معاينة الشهادة")}
            </h1>
            <p className="text-sm text-slate-400">
              {cert.certificateId} — {cert.courseName}
            </p>
          </div>
        </motion.div>

        {/* Certificate */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <CertificatePreview data={cert} lang={lang} />
        </motion.div>

        {/* Details grid */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          <DetailCard
            icon={User}
            label={t("Student", "الطالب")}
            value={cert.studentName}
          />
          <DetailCard
            icon={Award}
            label={t("Position", "المركز")}
            value={cert.positionTitle}
            legendary={getLegendaryTitle(cert.rank)}
          />
          <DetailCard
            icon={Calendar}
            label={t("Completion Date", "تاريخ الإتمام")}
            value={cert.completionDate}
          />
          <DetailCard
            icon={Shield}
            label={t("Verified By", "التحقق من")}
            value={cert.teacherName}
          />
        </motion.div>
      </div>
    </div>
  );
}

function DetailCard({
  icon: Icon,
  label,
  value,
  legendary: lt,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  legendary?: ReturnType<typeof getLegendaryTitle>;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(18,24,42,0.96),rgba(10,14,28,0.92))] p-4">
      <div className="mb-2 flex items-center gap-2">
        <Icon className={`h-4 w-4 ${lt ? "text-amber-300" : "text-slate-400"}`} />
        <span className="text-xs text-slate-500">{label}</span>
      </div>
      {lt ? (
        <p
          className="text-sm font-bold"
          style={{
            background: lt.metalGradient,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {value}
        </p>
      ) : (
        <p className="text-sm font-semibold text-slate-200">{value}</p>
      )}
    </div>
  );
}
