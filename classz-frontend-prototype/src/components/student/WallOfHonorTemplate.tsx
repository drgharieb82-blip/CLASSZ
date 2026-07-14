import { LEGENDARY_TITLES } from "@/constants/legendaryTitles";
import type { LeaderboardEntry } from "@/lib/leaderboardMock";

interface WallOfHonorTemplateProps {
  entries: LeaderboardEntry[];
}

/*
 * Overlay positions (percentage-based, easy to adjust).
 * Mapped to "leaderboard without data.png" template (1407×1118).
 */
const TOP3 = {
  2: { nameTop: "62%", nameLeft: "18%",  xpTop: "66%", xpLeft: "18%" },
  1: { nameTop: "60%", nameLeft: "50%",  xpTop: "64%", xpLeft: "50%" },
  3: { nameTop: "62%", nameLeft: "82%",  xpTop: "66%", xpLeft: "82%" },
} as const;

const TABLE = {
  startTop: 79.5,
  rowHeight: 4.15,
  cols: {
    student: "35%",
    xp: "55%",
    streak: "72%",
  },
} as const;

export function WallOfHonorTemplate({ entries }: WallOfHonorTemplateProps) {
  const top3 = entries.filter((e) => e.rank >= 1 && e.rank <= 3);
  const rest = entries.filter((e) => e.rank >= 4 && e.rank <= 10);

  return (
    <div
      className="relative w-full overflow-hidden rounded-[20px] border border-amber-300/20 shadow-[0_0_60px_rgba(0,0,0,0.5)]"
      style={{ aspectRatio: "1407 / 1118", containerType: "inline-size" }}
    >
      <img
        src="/assets/leaderboard/wall-of-honor-template.png"
        alt="Wall of Honor"
        className="absolute inset-0 h-full w-full object-cover"
        draggable={false}
      />

      <div className="pointer-events-none absolute inset-0" style={{ direction: "ltr" }}>

        {/* ─── Top 3 names & XP ─── */}
        {top3.map((entry) => {
          const pos = TOP3[entry.rank as 1 | 2 | 3];
          if (!pos) return null;
          const legendary = LEGENDARY_TITLES[entry.rank];
          return (
            <div key={entry.rank}>
              {/* Student Name */}
              <div
                className="absolute -translate-x-1/2 text-center"
                style={{ top: pos.nameTop, left: pos.nameLeft }}
              >
                <span
                  className="inline-block whitespace-nowrap font-bold uppercase"
                  style={{
                    fontFamily: "'Cinzel', serif",
                    fontSize: entry.rank === 1 ? "2cqw" : "1.5cqw",
                    letterSpacing: "0.06cqw",
                    color: legendary
                      ? entry.rank === 1
                        ? "#FFD700"
                        : entry.rank === 2
                          ? "#C0C0C0"
                          : "#CD7F32"
                      : "#FFFFFF",
                    textShadow: "0 1px 3px rgba(0,0,0,0.7)",
                  }}
                >
                  {entry.name}
                </span>
              </div>

              {/* XP */}
              <div
                className="absolute -translate-x-1/2 text-center"
                style={{ top: pos.xpTop, left: pos.xpLeft }}
              >
                <span
                  className="inline-block whitespace-nowrap font-semibold"
                  style={{
                    fontFamily: "'Cinzel', serif",
                    fontSize: entry.rank === 1 ? "1.4cqw" : "1.1cqw",
                    color: "#F5E6B8",
                    textShadow: "0 1px 2px rgba(0,0,0,0.6)",
                  }}
                >
                  {entry.xp.toLocaleString()} XP
                </span>
              </div>
            </div>
          );
        })}

        {/* ─── Table rows 4–10 ─── */}
        {rest.map((entry, i) => {
          const rowTop = TABLE.startTop + i * TABLE.rowHeight;
          return (
            <div key={entry.rank}>
              {/* Student Name */}
              <div
                className="absolute -translate-y-1/2"
                style={{ top: `${rowTop}%`, left: TABLE.cols.student }}
              >
                <span
                  className={`inline-block whitespace-nowrap font-semibold ${entry.isMe ? "text-amber-200" : "text-slate-200"}`}
                  style={{
                    fontSize: "1.2cqw",
                    textShadow: "0 1px 2px rgba(0,0,0,0.5)",
                  }}
                >
                  {entry.name}
                </span>
              </div>

              {/* XP */}
              <div
                className="absolute -translate-y-1/2"
                style={{ top: `${rowTop}%`, left: TABLE.cols.xp }}
              >
                <span
                  className="inline-block whitespace-nowrap font-semibold text-slate-300"
                  style={{
                    fontSize: "1.1cqw",
                    textShadow: "0 1px 2px rgba(0,0,0,0.5)",
                  }}
                >
                  {entry.xp.toLocaleString()}
                </span>
              </div>

              {/* Streak */}
              <div
                className="absolute -translate-y-1/2"
                style={{ top: `${rowTop}%`, left: TABLE.cols.streak }}
              >
                <span
                  className="inline-block whitespace-nowrap font-semibold text-slate-300"
                  style={{
                    fontSize: "1.1cqw",
                    textShadow: "0 1px 2px rgba(0,0,0,0.5)",
                  }}
                >
                  {entry.streak} Days
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
