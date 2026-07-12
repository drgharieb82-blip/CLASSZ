import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Ban, Mail, Send } from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ROLES } from "@/lib/roles";
import { ApiError } from "@/lib/api/client";
import { cancelInvite, inviteAssistant, listMyInvites, type AssistantInviteRead } from "@/lib/api/assistants";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/teacher/team/invitations")({
  component: InvitationsPage,
});

const statusStyles: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-600 border-amber-300",
  matched: "bg-emerald-500/10 text-emerald-600 border-emerald-300",
  cancelled: "bg-slate-500/10 text-slate-500 border-slate-300",
};

function InvitationsPage() {
  const [invites, setInvites] = useState<AssistantInviteRead[]>([]);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = async () => {
    setLoading(true);
    try {
      setInvites(await listMyInvites());
      setError("");
    } catch (err) {
      setError(extractDetail(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  const sendInvite = async () => {
    if (!email.trim()) return;
    try {
      await inviteAssistant(email.trim());
      setEmail("");
      await refresh();
    } catch (err) {
      setError(extractDetail(err));
    }
  };

  return (
    <DashPage
      role="teacher"
      title="Assistant Invitations"
      subtitle="Invite an assistant to help with your courses"
      icon={ROLES.teacher.icon}
    >
      <Card className="border bg-card p-5 space-y-3">
        <p className="text-sm font-medium">Invite an assistant</p>
        <p className="text-xs text-muted-foreground">
          Enter their email. If they already have a CLASSZ assistant account, they'll see the invitation right
          away — otherwise it resolves automatically once they register.
        </p>
        <div className="flex flex-wrap gap-2">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="assistant@example.com"
            className="max-w-xs rounded-xl"
          />
          <Button className="rounded-xl gradient-brand border-0 text-white" size="sm" onClick={() => void sendInvite()}>
            <Send className="me-1.5 h-4 w-4" /> Send Invitation
          </Button>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </Card>

      <Card className="border bg-card p-5 space-y-3">
        <p className="text-sm font-medium">Sent invitations</p>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : invites.length === 0 ? (
          <p className="text-sm text-muted-foreground">No invitations sent yet.</p>
        ) : (
          <div className="space-y-2">
            {invites.map((invite) => (
              <div
                key={invite.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border bg-background p-3"
              >
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                  {invite.invited_email}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={cn("rounded-full text-xs capitalize", statusStyles[invite.status])}>
                    {invite.status}
                  </Badge>
                  {invite.status === "pending" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-lg text-rose-500"
                      title="Cancel"
                      onClick={async () => {
                        await cancelInvite(invite.id);
                        await refresh();
                      }}
                    >
                      <Ban className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </DashPage>
  );
}

function extractDetail(error: unknown): string {
  if (error instanceof ApiError && typeof error.body === "object" && error.body !== null && "detail" in error.body) {
    return String((error.body as { detail: string }).detail);
  }
  return "Something went wrong.";
}
