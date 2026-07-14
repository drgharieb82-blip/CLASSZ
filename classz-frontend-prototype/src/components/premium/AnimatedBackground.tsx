import { useMemo } from "react";

const ICONS = ["📐", "🧪", "⚛️", "📚", "🧬", "💻", "🎓", "✏️", "∑", "π", "√", "∞", "θ", "Δ", "🔬", "🪐"];

interface Particle {
  left: number;
  size: number;
  delay: number;
  duration: number;
  icon: string;
  drift: number;
}

/**
 * Global, lightweight animated background.
 * Slow-floating educational glyphs + glowing gradient orbs.
 * Theme-aware (uses semantic tokens) and pointer-events-none so it never blocks UI.
 */
export function AnimatedBackground() {
  const particles = useMemo<Particle[]>(
    () =>
      Array.from({ length: 10 }).map((_, i) => ({
        left: (i * 53) % 100,
        size: 16 + ((i * 7) % 24),
        delay: -(i * 1.7) % 22,
        duration: 32 + ((i * 5) % 18),
        icon: ICONS[i % ICONS.length],
        drift: ((i % 5) - 2) * 24,
      })),
    [],
  );

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden [contain:strict]">
      {/* gradient base wash */}
      <div className="absolute inset-0 gradient-brand-soft opacity-50" />

      {/* glowing orbs */}
      <div className="absolute -left-32 top-[-10%] h-[28rem] w-[28rem] rounded-full bg-[var(--brand)] opacity-[0.08] blur-[120px] animate-float [will-change:transform]" />
      <div
        className="absolute right-[-12%] top-1/3 h-[26rem] w-[26rem] rounded-full bg-[var(--brand-2)] opacity-[0.08] blur-[120px] animate-float [will-change:transform]"
        style={{ animationDelay: "-3s" }}
      />
      <div
        className="absolute bottom-[-12%] left-1/3 h-[24rem] w-[24rem] rounded-full bg-[var(--chart-5)] opacity-[0.06] blur-[120px] animate-float [will-change:transform]"
        style={{ animationDelay: "-6s" }}
      />

      {/* floating glyphs */}
      {particles.map((p, i) => (
        <span
          key={i}
          className="absolute select-none font-semibold text-foreground/[0.06] [will-change:transform,opacity]"
          style={{
            left: `${p.left}%`,
            bottom: "-10%",
            fontSize: `${p.size}px`,
            animation: `bg-rise ${p.duration}s linear ${p.delay}s infinite`,
            // @ts-expect-error custom prop for keyframe
            "--drift": `${p.drift}px`,
          }}
        >
          {p.icon}
        </span>
      ))}
    </div>
  );
}
