import { type LucideIcon, Construction } from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { type Role } from "@/lib/roles";
import { useApp } from "@/lib/app-context";

export function FutureModulePage({
  role,
  title,
  subtitle,
  icon,
}: {
  role: Role;
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
}) {
  const { t } = useApp();

  return (
    <DashPage role={role} title={title} subtitle={subtitle} icon={icon}>
      <Card className="border bg-card p-10 text-center space-y-3">
        <Construction className="mx-auto h-8 w-8 text-muted-foreground/50" />
        <p className="text-sm font-medium">{t("at.futureModuleTitle")}</p>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">{t("at.futureModuleDesc")}</p>
      </Card>
    </DashPage>
  );
}
