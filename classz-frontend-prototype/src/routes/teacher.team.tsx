import { createFileRoute } from "@tanstack/react-router";
import { Plus, UserCog, Shield, Wifi, WifiOff } from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ROLES } from "@/lib/roles";
import { cn } from "@/lib/utils";
import { teacherTeam } from "@/lib/teacherMock";

export const Route = createFileRoute("/teacher/team")({
  component: TeamPage,
});

const rolePermissions: Record<string, { allowed: string[]; denied: string[] }> = {
  "Assistant Teacher": { allowed: ["Essay grading", "Student support", "Question review"], denied: ["Revenue", "Wallet"] },
  "Content Manager": { allowed: ["Lessons", "PDFs", "Question bank", "Publishing"], denied: ["Finance"] },
  "Finance Manager": { allowed: ["Wallet", "Withdraw requests", "Revenue reports"], denied: ["Content", "Teaching"] },
  "Question Reviewer": { allowed: ["Question review", "Quality assurance", "Tags"], denied: ["Revenue", "Publishing"] },
  "Moderator": { allowed: ["Reports", "Comments", "Chat moderation"], denied: ["Revenue", "Content creation"] },
};

function TeamPage() {
  return (
    <DashPage role="teacher" title="Team Management" subtitle="Manage your academy staff and permissions" icon={ROLES.teacher.icon}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{teacherTeam.length} team members · All accounts owned by TCH-26-0001</p>
        </div>
        <Button className="rounded-xl gradient-brand border-0 text-white" size="sm">
          <Plus className="me-1.5 h-4 w-4" /> Add Team Member
        </Button>
      </div>

      {/* Team Grid */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {teacherTeam.map((member) => {
          const perms = rolePermissions[member.role];
          return (
            <Card key={member.id} className="border bg-card p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-11 w-11">
                    <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">
                      {member.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{member.name}</p>
                    <p className="text-xs text-muted-foreground">{member.id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  {member.status === "online" ? (
                    <Badge variant="outline" className="rounded-full border-emerald-300 text-emerald-600 text-xs">
                      <Wifi className="me-1 h-3 w-3" /> Online
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="rounded-full text-xs text-muted-foreground">
                      <WifiOff className="me-1 h-3 w-3" /> Offline
                    </Badge>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <Badge className="rounded-full bg-primary/10 text-primary border-0 text-xs">{member.role}</Badge>
              </div>

              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                <span>{member.tasks} tasks completed</span>
                <span>Joined {member.joined}</span>
              </div>

              {perms && (
                <div className="mt-3 space-y-1.5 border-t pt-3">
                  <p className="text-xs font-medium text-muted-foreground">Permissions</p>
                  <div className="flex flex-wrap gap-1">
                    {perms.allowed.map((p) => (
                      <span key={p} className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-600">{p}</span>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {perms.denied.map((p) => (
                      <span key={p} className="rounded-md bg-rose-500/10 px-2 py-0.5 text-xs text-rose-500 line-through">{p}</span>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Ownership Note */}
      <Card className="flex items-center gap-3 border border-primary/20 bg-primary/5 p-4">
        <Shield className="h-5 w-5 text-primary shrink-0" />
        <div>
          <p className="text-sm font-medium">All team accounts are owned by you (TCH-26-0001)</p>
          <p className="text-xs text-muted-foreground">You can create, manage, and revoke team member access at any time. No separate registration required.</p>
        </div>
      </Card>
    </DashPage>
  );
}
