import { type ReactNode } from "react";
import { motion } from "framer-motion";
import { type LucideIcon } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { type Role } from "@/lib/roles";
import { cn } from "@/lib/utils";
import { useApp } from "@/lib/app-context";

export function DashPage({
  role,
  title,
  subtitle,
  icon: Icon,
  actions,
  children,
}: {
  role: Role;
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const { t } = useApp();

  return (
    <DashboardLayout role={role}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 sm:flex sm:items-center sm:justify-between"
      >
        <div className="flex items-center gap-3 min-w-0">
          {Icon && (
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl gradient-brand text-white shadow-lg glow">
              <Icon className="h-6 w-6" />
            </span>
          )}
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-bold tracking-tight sm:text-3xl">{t(title)}</h1>
            {subtitle && <p className="mt-0.5 text-sm text-muted-foreground">{t(subtitle)}</p>}
          </div>
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.08, ease: "easeOut" }}
        className={cn("space-y-6")}
      >
        {children}
      </motion.div>
    </DashboardLayout>
  );
}
