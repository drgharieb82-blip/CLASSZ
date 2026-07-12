import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { UsersRound, Inbox, AlertTriangle, BarChart3, UserCheck, ArrowRight } from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { ROLES } from "@/lib/roles";
import { useApp } from "@/lib/app-context";
import { extractErrorDetail } from "@/hooks/use-assistant-scope";
import { getMyPermissions } from "@/lib/api/assistants";

export const Route = createFileRoute("/assistant-teacher/")({ component: ATDashboard });

const QUICK_LINKS = [
  { resource: "pods", to: "/assistant-teacher/student-pods", icon: UsersRound, label: "at.studentPods", color: "text-teal-500 bg-teal-500/10" },
  { resource: "grading", to: "/assistant-teacher/grading-queue", icon: Inbox, label: "at.gradingQueue", color: "text-amber-500 bg-amber-500/10" },
  { resource: "students_data", to: "/assistant-teacher/follow-up", icon: AlertTriangle, label: "at.followUp", color: "text-rose-500 bg-rose-500/10" },
  { resource: "students_data", to: "/assistant-teacher/performance", icon: BarChart3, label: "at.performance", color: "text-cyan-500 bg-cyan-500/10" },
] as const;

function ATDashboard() {
  const { t } = useApp();
  const [resources, setResources] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    void getMyPermissions()
      .then((perTeacher) => {
        if (!active) return;
        const union = new Set<string>();
        for (const teacher of perTeacher) {
          for (const grant of teacher.permissions) union.add(grant.resource);
        }
        setResources(union);
      })
      .catch((err) => active && setError(extractErrorDetail(err)))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const visibleLinks = QUICK_LINKS.filter((link) => resources.has(link.resource));

  return (
    <DashPage role="assistant" title="at.dashboard" subtitle="at.dashboardSubtitle" icon={ROLES.assistant.icon}>
      {loading ? (
        <Card className="border bg-card p-8 text-center text-sm text-muted-foreground">{t("common.loading")}</Card>
      ) : error ? (
        <Card className="border border-destructive/40 bg-destructive/5 p-8 text-center text-sm text-destructive">{error}</Card>
      ) : visibleLinks.length === 0 ? (
        <Card className="border bg-card p-8 text-center space-y-3">
          <UserCheck className="mx-auto h-8 w-8 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">{t("at.noAccessYet")}</p>
          <Link to="/assistant-teacher/invitations" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
            {t("at.viewInvitations")} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {visibleLinks.map((link) => (
            <Link key={link.to} to={link.to}>
              <Card className="border bg-card p-4 h-full space-y-3 hover:bg-muted/30 transition-colors">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${link.color}`}>
                  <link.icon className="h-5 w-5" />
                </div>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">{t(link.label)}</h3>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </DashPage>
  );
}
