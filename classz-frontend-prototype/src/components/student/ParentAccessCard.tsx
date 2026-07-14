import { useEffect, useState } from "react";
import { CheckCircle2, Copy, RefreshCw, Send, UserPlus, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ApiError } from "@/lib/api/client";
import {
  approveParentLinkRequest,
  cancelParentInvite,
  createParentInvite,
  denyParentLinkRequest,
  getMyParentLinkCode,
  listMyParentInvites,
  listMyParentLinkRequests,
  regenerateMyParentLinkCode,
  type ParentInviteRead,
  type ParentLinkRequestRead,
} from "@/lib/api/students";

export function ParentAccessCard() {
  const [code, setCode] = useState("");
  const [requests, setRequests] = useState<ParentLinkRequestRead[]>([]);
  const [invites, setInvites] = useState<ParentInviteRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [copied, setCopied] = useState(false);

  const refresh = async () => {
    setLoading(true);
    try {
      const [codeResp, requestList, inviteList] = await Promise.all([
        getMyParentLinkCode(),
        listMyParentLinkRequests(),
        listMyParentInvites(),
      ]);
      setCode(codeResp.code);
      setRequests(requestList);
      setInvites(inviteList);
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

  const regenerate = async () => {
    if (!window.confirm("Regenerating your link code invalidates the old one. Continue?")) return;
    const response = await regenerateMyParentLinkCode();
    setCode(response.code);
  };

  const copyCode = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const sendInvite = async () => {
    if (!inviteEmail.trim()) return;
    try {
      await createParentInvite(inviteEmail.trim());
      setInviteEmail("");
      await refresh();
    } catch (err) {
      setError(extractDetail(err));
    }
  };

  return (
    <Card className="border bg-card p-6 space-y-6">
      <div>
        <h3 className="font-semibold">Parent Access</h3>
        <p className="text-sm text-muted-foreground">Control which parent accounts can see your data.</p>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : (
        <>
          <div className="space-y-2">
            <p className="text-sm font-medium">Your link code</p>
            <p className="text-xs text-muted-foreground">
              Share this with a parent so they can request access to your account.
            </p>
            <div className="flex flex-wrap gap-2">
              <Input readOnly value={code} className="max-w-xs font-mono" />
              <Button variant="outline" size="sm" onClick={() => void copyCode()}>
                <Copy className="me-1.5 h-3.5 w-3.5" /> {copied ? "Copied" : "Copy"}
              </Button>
              <Button variant="outline" size="sm" onClick={() => void regenerate()}>
                <RefreshCw className="me-1.5 h-3.5 w-3.5" /> Regenerate
              </Button>
            </div>
          </div>

          {requests.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Pending parent requests</p>
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-3"
                >
                  <div>
                    <p className="text-sm font-medium">{request.parent_full_name}</p>
                    <p className="text-xs text-muted-foreground">{request.parent_public_code}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={async () => {
                        await approveParentLinkRequest(request.id);
                        await refresh();
                      }}
                    >
                      <CheckCircle2 className="me-1.5 h-3.5 w-3.5" /> Approve
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        await denyParentLinkRequest(request.id);
                        await refresh();
                      }}
                    >
                      <XCircle className="me-1.5 h-3.5 w-3.5" /> Deny
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-2">
            <p className="text-sm font-medium">Invite a parent</p>
            <p className="text-xs text-muted-foreground">
              Enter their email — if they already have a CLASSZ account, they'll see the invitation right away.
            </p>
            <div className="flex flex-wrap gap-2">
              <Input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="parent@example.com"
                className="max-w-xs"
              />
              <Button size="sm" onClick={() => void sendInvite()}>
                <UserPlus className="me-1.5 h-3.5 w-3.5" /> Invite
              </Button>
            </div>
            {invites.length > 0 && (
              <div className="mt-2 space-y-1.5">
                {invites.map((invite) => (
                  <div
                    key={invite.id}
                    className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 text-sm"
                  >
                    <span className="text-muted-foreground">{invite.invited_email}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs uppercase tracking-wide text-muted-foreground">{invite.status}</span>
                      {invite.status === "pending" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={async () => {
                            await cancelParentInvite(invite.id);
                            await refresh();
                          }}
                        >
                          <Send className="me-1 h-3 w-3 rotate-180" /> Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
    </Card>
  );
}

function extractDetail(error: unknown): string {
  if (error instanceof ApiError && typeof error.body === "object" && error.body !== null && "detail" in error.body) {
    return String((error.body as { detail: string }).detail);
  }
  return "Something went wrong.";
}
