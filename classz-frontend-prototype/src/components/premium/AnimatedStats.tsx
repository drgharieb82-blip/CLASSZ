import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { GlowCard } from "@/components/premium/GlowCard";

function useCountUp(target: number, run: boolean, duration = 1200) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!run) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(target * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, run, duration]);
  return val;
}

export interface AnimatedStat {
  label: string;
  value: number;
  icon: LucideIcon;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  gradient?: string;
  delta?: string;
}

function StatItem({ stat, run }: { stat: AnimatedStat; run: boolean }) {
  const v = useCountUp(stat.value, run);
  const display = stat.decimals ? v.toFixed(stat.decimals) : Math.round(v).toLocaleString();
  return (
    <GlowCard className="h-full">
      <div className="flex items-start justify-between gap-3 p-5">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{stat.label}</p>
          <p className="mt-1 text-2xl font-bold tracking-tight">
            {stat.prefix}
            {display}
            {stat.suffix}
          </p>
          {stat.delta && <p className="mt-1 text-xs font-medium text-success">{stat.delta}</p>}
        </div>
        <span className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-white shadow-md", stat.gradient ?? "from-violet-500 to-blue-500")}>
          <stat.icon className="h-5 w-5" />
        </span>
      </div>
    </GlowCard>
  );
}

export function AnimatedStats({ stats, className }: { stats: AnimatedStat[]; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div ref={ref} className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-4", className)}>
      {stats.map((s) => (
        <StatItem key={s.label} stat={s} run={inView} />
      ))}
    </motion.div>
  );
}

/** Animated circular progress ring. */
export function ProgressRing({ value, size = 120, stroke = 10, label }: { value: number; size?: number; stroke?: number; label?: string }) {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true });
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const animated = useCountUp(value, inView);
  const offset = c - (animated / 100) * c;
  return (
    <div className="relative inline-grid place-items-center">
      <svg ref={ref} width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-muted)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="url(#ring-grad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
        <defs>
          <linearGradient id="ring-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--brand)" />
            <stop offset="100%" stopColor="var(--brand-2)" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute text-center">
        <span className="text-2xl font-bold">{Math.round(animated)}%</span>
        {label && <p className="text-xs text-muted-foreground">{label}</p>}
      </div>
    </div>
  );
}
