import { useId } from "react";

interface GoldSealProps {
  positionTitle: string;
}

export function GoldSeal({ positionTitle }: GoldSealProps) {
  const uid = useId().replace(/:/g, "");
  const gradId = `sg${uid}`;
  const filtId = `sf${uid}`;
  const arcTopId = `at${uid}`;
  const arcBotId = `ab${uid}`;

  const S = 120;
  const r = S / 2;
  const textR = r * 0.62;

  return (
    <svg viewBox={`0 0 ${S} ${S}`} className="h-full w-full">
      <defs>
        <radialGradient id={gradId} cx="50%" cy="40%" r="55%">
          <stop offset="0%" stopColor="#F5D77A" />
          <stop offset="50%" stopColor="#C9A227" />
          <stop offset="100%" stopColor="#8B6914" />
        </radialGradient>
        <filter id={filtId}>
          <feDropShadow
            dx="0"
            dy="1"
            stdDeviation="2"
            floodColor="#C9A227"
            floodOpacity="0.4"
          />
        </filter>
        <path
          id={arcTopId}
          d={describeArc(r, r, textR, 210, 330)}
          fill="none"
        />
        <path
          id={arcBotId}
          d={describeArc(r, r, textR, 30, 150)}
          fill="none"
        />
      </defs>

      {/* Outer ring */}
      <circle
        cx={r}
        cy={r}
        r={r - 2}
        fill="none"
        stroke={`url(#${gradId})`}
        strokeWidth="3"
        filter={`url(#${filtId})`}
      />
      {/* Inner ring */}
      <circle
        cx={r}
        cy={r}
        r={r - 8}
        fill="none"
        stroke={`url(#${gradId})`}
        strokeWidth="1.5"
        opacity="0.6"
      />
      {/* Notch marks */}
      {Array.from({ length: 36 }).map((_, i) => {
        const angle = (i * 10 * Math.PI) / 180;
        const x1 = r + (r - 2) * Math.cos(angle);
        const y1 = r + (r - 2) * Math.sin(angle);
        const x2 = r + (r - 5) * Math.cos(angle);
        const y2 = r + (r - 5) * Math.sin(angle);
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="#C9A227"
            strokeWidth="0.7"
            opacity="0.5"
          />
        );
      })}

      {/* Curved top text: CLASSZ */}
      <text
        fill="#C9A227"
        fontSize="9"
        fontWeight="700"
        letterSpacing="3"
        fontFamily="serif"
      >
        <textPath href={`#${arcTopId}`} startOffset="50%" textAnchor="middle">
          CLASSZ
        </textPath>
      </text>

      {/* Curved bottom text: position title */}
      <text
        fill="#C9A227"
        fontSize="7.5"
        fontWeight="600"
        letterSpacing="1.5"
        fontFamily="serif"
      >
        <textPath href={`#${arcBotId}`} startOffset="50%" textAnchor="middle">
          {positionTitle.toUpperCase()}
        </textPath>
      </text>

      {/* Center star emblem */}
      <text
        x={r}
        y={r + 5}
        textAnchor="middle"
        fill="#C9A227"
        fontSize="22"
        fontFamily="serif"
        fontWeight="bold"
      >
        ★
      </text>
    </svg>
  );
}

function polarToCartesian(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number,
) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const large = endAngle - startAngle <= 180 ? "0" : "1";
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${large} 0 ${end.x} ${end.y}`;
}
