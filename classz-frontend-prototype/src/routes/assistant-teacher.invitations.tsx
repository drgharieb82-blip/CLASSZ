import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ROLES } from "@/lib/roles";
import { ApiError } from "@/lib/api/client";
import {
  acceptInvitation,
  declineInvitation,
  getMyPermissions,
  listMyInvitations,
  type AssistantInvitationRead,
  type AssistantTeacherPermissionsRead,
} from "@/lib/api/assistants";

export const Route = createFileRoute("/assistant-teacher/invitations")({
  component: InvitationsPage,
});

function InvitationsPage() {
  const [invitations, setInvitations] = useState<AssistantInvitationRead[]>([]);
  const [permissions, setPermissions] = useState<AssistantTeacherPermissionsRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = async () => {
    setLoading(true);
    try {
      const [invitationList, permissionList] = await Promise.all([listMyInvitations(), getMyPermissions()]);
      setInvitations(invitationList);
      setPermissions(permissionList);
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

  return (
    <DashPage
      role="assistant"
      title="Teacher Invitations"
      subtitle="Teachers who've invited you, and what they've granted you access to"
      icon={ROLES.assistant.icon}
    >
      <Card className="border bg-card p-5 space-y-3">
        <h3 className="font-semibold">Pending invitations</h3>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : invitations.length === 0 ? (
          <p className="text-sm text-muted-foreground">No pending invitations.</p>
        ) : (
          <div className="space-y-2">
            {invitations.map((invitation) => (
              <div
                key={invitation.link_id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-background p-3"
              >
                <div>
                  <p className="text-sm font-medium">{invitation.teacher_full_name}</p>
                  <p className="text-xs text-muted-foreground">{invitation.teacher_public_code}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="rounded-xl"
                    onClick={async () => {
                      await acceptInvitation(invitation.link_id);
                      await refresh();
                    }}
                  >
                    <CheckCircle2 className="me-1.5 h-3.5 w-3.5" /> Accept
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl"
                    onClick={async () => {
                      await declineInvitation(invitation.link_id);
                      await refresh();
                    }}
                  >
                    <XCircle className="me-1.5 h-3.5 w-3.5" /> Decline
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="border bg-card p-5 space-y-3">
        <h3 className="font-semibold">What you can do</h3>
        {permissions.length === 0 ? (
          <p className="text-sm text-muted-foreground">You have no active teacher links yet.</p>
        ) : (
          <div className="space-y-4">
            {permissions.map((teacherPerms) => (
              <div key={teacherPerms.teacher_id} className="rounded-xl border p-3">
                <p className="mb-2 text-sm font-semibold">{teacherPerms.teacher_full_name}</p>
                {teacherPerms.permissions.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No permissions granted yet.</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {teacherPerms.permissions.map((grant) => (
                      <Badge key={`${grant.resource}:${grant.action}`} variant="outline" className="rounded-full text-xs">
                        {grant.resource.replace(/_/g, " ")} · {grant.action}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </DashPage>
  );
}

function extractDetail(error: unknown): string {
  if (error instanceof ApiError && typeof error.body === "object" && error.body !== null && "detail" in error.body) {
    return String((error.body as { detail: string }).detail);
  }
  return "Something went wrong.";
}
