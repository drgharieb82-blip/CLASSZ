export interface LegendaryTitle {
  rank: number;
  title: string;
  titleAr: string;
  theme: "gold" | "silver" | "bronze";
  certificateImage: string;
  glow: string;
  glowShadow: string;
  metalGradient: string;
  qrFg: string;
  qrBg: string;
}

export const LEGENDARY_TITLES: Record<number, LegendaryTitle> = {
  1: {
    rank: 1,
    title: "THE DRAGON",
    titleAr: "التنين",
    theme: "gold",
    certificateImage: "/assets/certifications/1st-position.png",
    glow: "shadow-[0_0_80px_rgba(251,191,36,0.25)] border-amber-300/50",
    glowShadow:
      "0 0 5px rgba(255,215,0,.8), 0 0 15px rgba(255,215,0,.7), 0 0 30px rgba(255,215,0,.5)",
    metalGradient:
      "linear-gradient(180deg, #FFF8D0 0%, #FFD700 40%, #C9A227 100%)",
    qrFg: "#C9A227",
    qrBg: "#0D0F1A",
  },
  2: {
    rank: 2,
    title: "THE PEGASUS",
    titleAr: "البيغاسوس",
    theme: "silver",
    certificateImage: "/assets/certifications/2nd-position.png",
    glow: "shadow-[0_0_60px_rgba(226,232,240,0.15)] border-slate-300/40",
    glowShadow:
      "0 0 10px rgba(255,255,255,.9), 0 0 25px rgba(180,220,255,.8), 0 0 40px rgba(120,180,255,.6)",
    metalGradient:
      "linear-gradient(180deg, #FFFFFF 0%, #C0C0C0 40%, #7A8B99 100%)",
    qrFg: "#B0B8C4",
    qrBg: "#0D0F1A",
  },
  3: {
    rank: 3,
    title: "THE PHOENIX",
    titleAr: "العنقاء",
    theme: "bronze",
    certificateImage: "/assets/certifications/3rd-position.png",
    glow: "shadow-[0_0_60px_rgba(251,146,60,0.18)] border-orange-300/40",
    glowShadow:
      "0 0 10px rgba(255,180,0,.9), 0 0 25px rgba(255,120,0,.8), 0 0 45px rgba(255,80,0,.7)",
    metalGradient:
      "linear-gradient(180deg, #FFDAB0 0%, #CD7F32 40%, #B5651D 100%)",
    qrFg: "#CD7F32",
    qrBg: "#0D0F1A",
  },
};

export const RESERVED_NICKNAMES = [
  "THE DRAGON",
  "THE PEGASUS",
  "THE PHOENIX",
] as const;

export function isReservedNickname(name: string): boolean {
  const normalized = name.trim().toUpperCase();
  return RESERVED_NICKNAMES.some(
    (reserved) =>
      normalized === reserved ||
      normalized === reserved.replace("THE ", ""),
  );
}

export function getLegendaryTitle(rank: number | null): LegendaryTitle | null {
  if (rank === null || !LEGENDARY_TITLES[rank]) return null;
  return LEGENDARY_TITLES[rank];
}

export function getLegendaryTitleDisplay(
  rank: number | null,
  lang: "en" | "ar" = "en",
): string | null {
  const entry = getLegendaryTitle(rank);
  if (!entry) return null;
  return lang === "ar" ? entry.titleAr : entry.title;
}
