import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { GlowCard } from "@/components/premium/GlowCard";
import { StatusBadge } from "@/components/common/primitives";
import { Button } from "@/components/ui/button";
import { ROLES } from "@/lib/roles";
import { ApiError } from "@/lib/api/client";
import {
  listSubscriptions,
  updateSubscription,
  type SubscriptionPlan,
  type TeacherSubscription,
} from "@/lib/api/finance";

export const Route = createFileRoute("/finance/subscriptions")({ component: Page });

function extractDetail(error: unknown): string {
  if (error instanceof ApiError && typeof error.body === "object" && error.body !== null && "detail" in error.body) {
    return String((error.body as { detail: string }).detail);
  }
  return "Unable to load subscriptions.";
}

const plans: SubscriptionPlan[] = ["free", "pro", "premium", "enterprise"];

function Page() {
  const [subscriptions, setSubscriptions] = useState<TeacherSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    return listSubscriptions()
      .then((response) => {
        setSubscriptions(response);
        setError("");
      })
      .catch((err) => setError(extractDetail(err)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const changePlan = async (teacherId: string, plan: SubscriptionPlan) => {
    setSavingId(teacherId);
    try {
      await updateSubscription(teacherId, { plan });
      await load();
    } catch (err) {
      setError(extractDetail(err));
    } finally {
      setSavingId(null);
    }
  };

  const recordPayment = async (teacherId: string) => {
    setSavingId(teacherId);
    try {
      await updateSubscription(teacherId, { record_payment: true });
      await load();
    } catch (err) {
      setError(extractDetail(err));
    } finally {
      setSavingId(null);
    }
  };

  const mrr = subscriptions.filter((s) => s.status === "active").reduce((sum, s) => sum + s.monthly_fee, 0);

  return (
    <DashPage role="finance" title="Subscriptions" subtitle="Recurring revenue and plan management" icon={ROLES.finance.icon}>
      {loading ? (
        <GlowCard className="p-8 text-sm text-muted-foreground">Loading subscriptions...</GlowCard>
      ) : error ? (
        <GlowCard className="p-8 text-sm text-destructive">{error}</GlowCard>
      ) : (
        <>
          <GlowCard className="p-5">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-md">
                <RefreshCw className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm text-muted-foreground">Monthly Recurring Revenue</p>
                <p className="text-2xl font-bold">${mrr.toFixed(2)}</p>
              </div>
            </div>
          </GlowCard>

          {subscriptions.length === 0 ? (
            <GlowCard className="p-8 text-center text-sm text-muted-foreground">No teachers yet.</GlowCard>
          ) : (
            <GlowCard className="p-5">
              <h3 className="mb-4 font-semibold">Teacher plans</h3>
              <div className="space-y-2">
                {subscriptions.map((subscription) => (
                  <div key={subscription.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card px-4 py-3">
                    <div className="min-w-0">
                      <p className="font-medium">{subscription.teacher_name}</p>
                      <p className="text-xs text-muted-foreground">
                        ${subscription.monthly_fee.toFixed(2)}/mo · renews{" "}
                        {subscription.renewal_date ? new Date(subscription.renewal_date).toLocaleDateString() : "—"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)} />
                      <StatusBadge status={subscription.payment_status.charAt(0).toUpperCase() + subscription.payment_status.slice(1)} />
                      <select
                        value={subscription.plan}
                        disabled={savingId === subscription.teacher_id}
                        onChange={(event) => changePlan(subscription.teacher_id, event.target.value as SubscriptionPlan)}
                        className="rounded-lg border bg-card px-2 py-1.5 text-sm capitalize"
                      >
                        {plans.map((plan) => (
                          <option key={plan} value={plan} className="capitalize">
                            {plan}
                          </option>
                        ))}
                      </select>
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-lg"
                        disabled={savingId === subscription.teacher_id}
                        onClick={() => recordPayment(subscription.teacher_id)}
                      >
                        {savingId === subscription.teacher_id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Record Payment"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </GlowCard>
          )}
        </>
      )}
    </DashPage>
  );
}
