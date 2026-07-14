import { QRCodeSVG } from "qrcode.react";

interface QRCodeBlockProps {
  certificateId: string;
  size?: number;
  fgColor?: string;
  bgColor?: string;
}

export function QRCodeBlock({
  certificateId,
  size = 80,
  fgColor = "#0D1B3D",
  bgColor = "#ffffff",
}: QRCodeBlockProps) {
  const verificationUrl = `https://classz.com/verify/${certificateId}`;

  return (
    <QRCodeSVG
      value={verificationUrl}
      size={size}
      level="M"
      bgColor={bgColor}
      fgColor={fgColor}
      style={{ width: "100%", height: "100%" }}
    />
  );
}
