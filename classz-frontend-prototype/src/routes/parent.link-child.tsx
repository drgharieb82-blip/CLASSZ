import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, Link2, XCircle } from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { GradientButton } from "@/components/premium/GradientButton";
import { Input } from "@/components/ui/input";
import { ROLES } from "@/lib/roles";
import { ApiError } from "@/lib/api/client";
import {
  acceptLinkInvitation,
  declineLinkInvitation,
  listLinkedChildren,
  listLinkInvitations,
  submitParentLinkRequest,
  type LinkedChildRead,
  type LinkInvitationRead,
} from "@/lib/api/parents";

export const Route = createFileRoute("/parent/link-child")({ component: Page });

function Page() {
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [children, setChildren] = useState<LinkedChildRead[]>([]);
  const [invitations, setInvitations] = useState<LinkInvitationRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const refresh = async () => {
    setLoading(true);
    try {
      const [childrenList, invitationList] = await Promise.all([listLinkedChildren(), listLinkInvitations()]);
      setChildren(childrenList);
      setInvitations(invitationList);
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

  const submitCode = async () => {
    if (!code.trim()) return;
    setSubmitting(true);
    setError("");
    setMessage("");
    try {
      await submitParentLinkRequest(code.trim());
      setMessage("Request sent — waiting for the student to approve it.");
      setCode("");
      await refresh();
    } catch (err) {
      setError(extractDetail(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashPage role="parent" title="Link a Child" subtitle="Connect your account to your child's account" icon={ROLES.parent.icon}>
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Enter a link code</h2>
        <p className="text-sm text-slate-400">
          Ask your child for their parent link code (found in their account settings), then enter it below.
          They'll need to approve the request before you can see their data.
        </p>
        <div className="flex flex-wrap gap-2">
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter link code"
            className="max-w-xs"
          />
          <GradientButton size="sm" disabled={submitting || !code.trim()} onClick={() => void submitCode()}>
            <Link2 className="h-3.5 w-3.5" /> Submit
          </GradientButton>
        </div>
        {message && <p className="text-sm text-emerald-400">{message}</p>}
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Invitations for you</h2>
        {loading ? (
          <p className="text-sm text-slate-400">Loading...</p>
        ) : invitations.length === 0 ? (
          <p className="text-sm text-slate-400">No pending invitations from students.</p>
        ) : (
          <div className="space-y-2">
            {invitations.map((invitation) => (
              <div
                key={invitation.link_id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-3"
              >
                <div>
                  <p className="text-sm font-medium text-white">{invitation.student_full_name}</p>
                  <p className="text-xs text-slate-500">
                    {invitation.student_public_code} · {new Date(invitation.requested_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <GradientButton
                    size="sm"
                    onClick={async () => {
                      await acceptLinkInvitation(invitation.link_id);
                      await refresh();
                    }}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" /> Accept
                  </GradientButton>
                  <GradientButton
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      await declineLinkInvitation(invitation.link_id);
                      await refresh();
                    }}
                  >
                    <XCircle className="h-3.5 w-3.5" /> Decline
                  </GradientButton>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Your linked children</h2>
        {children.length === 0 ? (
          <p className="text-sm text-slate-400">No children linked yet.</p>
        ) : (
          <div className="space-y-2">
            {children.map((child) => (
              <div
                key={child.link_id}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] p-3"
              >
                <div>
                  <p className="text-sm font-medium text-white">{child.full_name}</p>
                  <p className="text-xs text-slate-500">{child.public_code}</p>
                </div>
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">{child.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashPage>
  );
}

function extractDetail(error: unknown): string {
  if (error instanceof ApiError && typeof error.body === "object" && error.body !== null && "detail" in error.body) {
    return String((error.body as { detail: string }).detail);
  }
  return "Something went wrong.";
}
