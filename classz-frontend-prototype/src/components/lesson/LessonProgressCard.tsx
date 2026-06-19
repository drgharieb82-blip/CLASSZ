interface LessonProgressCardProps {
  percent: number;
  watchedTime: string;
  remainingTime: string;
}

export function LessonProgressCard({ percent, watchedTime, remainingTime }: LessonProgressCardProps) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <div className="rounded-2xl border bg-card/70 p-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Your Progress</p>
      <div className="flex items-center gap-4">
        <div className="relative h-24 w-24 shrink-0">
          <svg viewBox="0 0 100 100" className="-rotate-90">
            <circle cx="50" cy="50" r={radius} fill="none" stroke="currentColor" strokeWidth="6" className="text-muted/50" />
            <circle
              cx="50" cy="50" r={radius}
              fill="none"
              stroke="url(#progress-grad)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-700"
            />
            <defs>
              <linearGradient id="progress-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="oklch(0.68 0.21 275)" />
                <stop offset="100%" stopColor="oklch(0.7 0.17 230)" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold">{percent}%</span>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <div>
            <p className="text-muted-foreground">Watched</p>
            <p className="font-semibold">{watchedTime}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Remaining</p>
            <p className="font-semibold">{remainingTime}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
