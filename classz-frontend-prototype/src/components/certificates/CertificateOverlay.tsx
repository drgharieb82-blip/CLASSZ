import { QRCodeBlock } from "./QRCodeBlock";
import { getLegendaryTitle } from "@/constants/legendaryTitles";

export interface CertificateOverlayData {
  studentName: string;
  rank: number;
  positionTitle: string;
  courseName: string;
  completionDate: string;
  teacherName: string;
  certificateId: string;
}

interface CertificateOverlayProps {
  data: CertificateOverlayData;
}

const POS = {
  certificateId:  { top: "7.8%", right: "5.5%" },
  qrCode:         { top: "4.5%", right: "5%" },
  studentName:    { top: "40%",  left: "50%" },
  positionTitle:  { top: "46%",  left: "50%" },
  courseName:     { top: "56%",  left: "50%" },
  completionDate: { top: "76%",  left: "27%" },
  teacherName:    { top: "76%",  left: "73%" },
} as const;

export function CertificateOverlay({ data }: CertificateOverlayProps) {
  const legendary = getLegendaryTitle(data.rank);

  return (
    <div className="pointer-events-none absolute inset-0" style={{ direction: "ltr" }}>

      {/* Certificate ID */}
      <div
        className="absolute"
        style={{ top: POS.certificateId.top, right: POS.certificateId.right }}
      >
        <span
          className="font-mono font-semibold tracking-wide"
          style={{ color: "#0D1B3D", fontSize: "0.7cqw" }}
        >
          {data.certificateId}
        </span>
      </div>

      {/* QR Code */}
      <div
        className="absolute"
        style={{ top: POS.qrCode.top, right: POS.qrCode.right }}
      >
        <div style={{ width: "5.5cqw" }}>
          <QRCodeBlock certificateId={data.certificateId} size={56} />
        </div>
      </div>

      {/* Student Name */}
      <div
        className="absolute w-full text-center"
        style={{ top: POS.studentName.top, left: 0, transform: "translateY(-50%)" }}
      >
        <h2
          className="mx-auto whitespace-nowrap font-serif font-bold tracking-wide"
          style={{ color: "#0D1B3D", fontSize: "2.6cqw" }}
        >
          {data.studentName}
        </h2>
      </div>

      {/* Position / Rank Title */}
      <div
        className="absolute w-full text-center"
        style={{ top: POS.positionTitle.top, left: 0, transform: "translateY(-50%)" }}
      >
        {legendary ? (
          <span
            className="font-semibold uppercase tracking-widest"
            style={{
              fontFamily: "'Cinzel Decorative', serif",
              fontSize: "1.3cqw",
              background: legendary.metalGradient,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {legendary.title}
          </span>
        ) : (
          <span
            className="font-serif font-semibold italic tracking-widest"
            style={{ color: "#C9A227", fontSize: "1.3cqw" }}
          >
            {data.positionTitle}
          </span>
        )}
      </div>

      {/* Course Name */}
      <div
        className="absolute w-full text-center"
        style={{ top: POS.courseName.top, left: 0, transform: "translateY(-50%)" }}
      >
        <span
          className="uppercase"
          style={{
            fontFamily: "'Cinzel Decorative', serif",
            fontWeight: 700,
            fontSize: "1.4cqw",
            letterSpacing: "0.1cqw",
            ...(legendary
              ? {
                  background: legendary.metalGradient,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }
              : { color: "#0D1B3D" }),
          }}
        >
          {data.courseName}
        </span>
      </div>

      {/* Completion Date */}
      <div
        className="absolute text-center"
        style={{
          top: POS.completionDate.top,
          left: POS.completionDate.left,
          transform: "translate(-50%, -50%)",
        }}
      >
        <span
          className="font-serif font-medium"
          style={{ color: "#0D1B3D", fontSize: "0.95cqw" }}
        >
          {data.completionDate}
        </span>
      </div>

      {/* Teacher Name */}
      <div
        className="absolute text-center"
        style={{
          top: POS.teacherName.top,
          left: POS.teacherName.left,
          transform: "translate(-50%, -50%)",
        }}
      >
        <span
          className="font-serif font-medium"
          style={{ color: "#0D1B3D", fontSize: "0.95cqw" }}
        >
          {data.teacherName}
        </span>
      </div>
    </div>
  );
}
