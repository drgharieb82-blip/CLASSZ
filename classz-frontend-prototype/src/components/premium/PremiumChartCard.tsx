import { type ReactNode } from "react";
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { GlowCard } from "@/components/premium/GlowCard";

export function PremiumChartCard({
  title,
  subtitle,
  icon: Icon,
  action,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <GlowCard className={cn("h-full", className)}>
      <div className="p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {Icon && (
              <span className="grid h-9 w-9 place-items-center rounded-xl gradient-brand text-white shadow-md">
                <Icon className="h-4 w-4" />
              </span>
            )}
            <div>
              <h3 className="font-semibold leading-tight">{title}</h3>
              {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
            </div>
          </div>
          {action}
        </div>
        {children}
      </div>
    </GlowCard>
  );
}
