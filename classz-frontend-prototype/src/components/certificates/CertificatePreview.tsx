import { useRef, useCallback, useState } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { Download, Printer } from "lucide-react";
import { getLegendaryTitle } from "@/constants/legendaryTitles";
import {
  CertificateOverlay,
  type CertificateOverlayData,
} from "./CertificateOverlay";

interface CertificatePreviewProps {
  data: CertificateOverlayData;
  lang?: "en" | "ar";
}

export function CertificatePreview({ data, lang = "en" }: CertificatePreviewProps) {
  const certRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);
  const legendary = getLegendaryTitle(data.rank);

  const t = (en: string, ar: string) => (lang === "ar" ? ar : en);

  const capture = useCallback(
    () =>
      html2canvas(certRef.current!, {
        scale: 3,
        useCORS: true,
        backgroundColor: null,
        logging: false,
      }),
    [],
  );

  const exportPDF = useCallback(async () => {
    if (!certRef.current || exporting) return;
    setExporting(true);
    try {
      const canvas = await capture();
      const imgData = canvas.toDataURL("image/png", 1.0);
      const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      const w = pdf.internal.pageSize.getWidth();
      const h = pdf.internal.pageSize.getHeight();
      pdf.addImage(imgData, "PNG", 0, 0, w, h);
      pdf.save(`${data.certificateId}-certificate.pdf`);
    } finally {
      setExporting(false);
    }
  }, [data.certificateId, exporting, capture]);

  const printCertificate = useCallback(async () => {
    if (!certRef.current) return;
    const canvas = await capture();
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(
      `<!DOCTYPE html><html><head><title>Certificate - ${data.certificateId}</title>` +
        `<style>@page{size:A4 landscape;margin:0}body{margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh}img{width:100vw;height:auto}</style>` +
        `</head><body><img src="${canvas.toDataURL("image/png", 1.0)}"/></body></html>`,
    );
    win.document.close();
    win.onload = () => win.print();
  }, [data.certificateId, capture]);

  const templateSrc = legendary
    ? legendary.certificateImage
    : "/assets/certificates/classz-certificate-template.png";

  const aspectRatio = legendary ? "3 / 2" : "297 / 210";

  return (
    <div className="flex flex-col gap-6">
      <div className="w-full overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
        <div
          ref={certRef}
          className="relative w-full"
          style={{ aspectRatio, containerType: "inline-size" }}
        >
          <img
            src={templateSrc}
            alt="CLASSZ Certificate Template"
            className="absolute inset-0 h-full w-full object-cover"
            crossOrigin="anonymous"
          />
          <CertificateOverlay data={data} />
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <button
          onClick={exportPDF}
          disabled={exporting}
          className="inline-flex items-center gap-2 rounded-xl border border-amber-300/30 bg-gradient-to-r from-amber-600/80 to-amber-500/80 px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:scale-[1.03] hover:shadow-amber-500/20 disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
          {exporting
            ? t("Exporting…", "جارٍ التصدير…")
            : t("Download PDF", "تحميل PDF")}
        </button>

        <button
          onClick={printCertificate}
          className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-2.5 text-sm font-semibold text-slate-200 transition-all hover:scale-[1.03] hover:bg-white/10"
        >
          <Printer className="h-4 w-4" />
          {t("Print", "طباعة")}
        </button>
      </div>
    </div>
  );
}
