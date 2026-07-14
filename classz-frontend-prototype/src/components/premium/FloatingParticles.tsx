import { useMemo } from "react";
import { cn } from "@/lib/utils";

/**
 * Lightweight floating particle field (CSS-driven). Use inside hero/section
 * containers (relative + overflow-hidden). Pointer-events disabled.
 */
export function FloatingParticles({ count = 24, className }: { count?: number; className?: string }) {
  const dots = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        left: (i * 37) % 100,
        top: (i * 61) % 100,
        size: 3 + ((i * 3) % 7),
        delay: -(i * 0.9) % 12,
        duration: 8 + ((i * 4) % 10),
        opacity: 0.15 + ((i % 5) * 0.08),
      })),
    [count],
  );

  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      {dots.map((d, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-primary"
          style={{
            left: `${d.left}%`,
            top: `${d.top}%`,
            width: `${d.size}px`,
            height: `${d.size}px`,
            opacity: d.opacity,
            animation: `bg-twinkle ${d.duration}s ease-in-out ${d.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}
