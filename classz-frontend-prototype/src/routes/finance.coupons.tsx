import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Plus, Ticket } from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { GlowCard } from "@/components/premium/GlowCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/common/primitives";
import { ROLES } from "@/lib/roles";
import { ApiError } from "@/lib/api/client";
import {
  createCoupon,
  listCoupons,
  updateCoupon,
  type Coupon,
  type CouponDiscountType,
} from "@/lib/api/finance";

export const Route = createFileRoute("/finance/coupons")({ component: Page });

function extractDetail(error: unknown): string {
  if (error instanceof ApiError && typeof error.body === "object" && error.body !== null && "detail" in error.body) {
    return String((error.body as { detail: string }).detail);
  }
  return "Unable to load coupons.";
}

function Page() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<CouponDiscountType>("percent");
  const [discountValue, setDiscountValue] = useState("10");
  const [maxRedemptions, setMaxRedemptions] = useState("");
  const [creating, setCreating] = useState(false);

  const load = () => {
    setLoading(true);
    return listCoupons()
      .then((response) => {
        setCoupons(response);
        setError("");
      })
      .catch((err) => setError(extractDetail(err)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const toggleActive = async (coupon: Coupon) => {
    setSavingId(coupon.id);
    try {
      await updateCoupon(coupon.id, { is_active: !coupon.is_active });
      await load();
    } catch (err) {
      setError(extractDetail(err));
    } finally {
      setSavingId(null);
    }
  };

  const submitCoupon = async () => {
    if (!code.trim() || !discountValue) return;
    setCreating(true);
    try {
      await createCoupon({
        code: code.trim(),
        discount_type: discountType,
        discount_value: Number(discountValue),
        max_redemptions: maxRedemptions ? Number(maxRedemptions) : null,
      });
      setCode("");
      setDiscountValue("10");
      setMaxRedemptions("");
      setShowForm(false);
      await load();
    } catch (err) {
      setError(extractDetail(err));
    } finally {
      setCreating(false);
    }
  };

  return (
    <DashPage
      role="finance"
      title="Coupons"
      subtitle="Promotions and discount codes"
      icon={ROLES.finance.icon}
      actions={
        <Button size="sm" className="rounded-xl gradient-brand text-white" onClick={() => setShowForm((v) => !v)}>
          <Plus className="me-1.5 h-4 w-4" /> New Coupon
        </Button>
      }
    >
      {showForm && (
        <GlowCard className="p-5">
          <h3 className="mb-4 font-semibold">Create coupon</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Input placeholder="Code (e.g. SUMMER20)" value={code} onChange={(e) => setCode(e.target.value)} className="rounded-xl" />
            <select
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value as CouponDiscountType)}
              className="rounded-xl border bg-card px-3 py-2 text-sm"
            >
              <option value="percent">Percent off</option>
              <option value="fixed">Fixed amount off</option>
            </select>
            <Input
              type="number"
              min={0}
              placeholder={discountType === "percent" ? "e.g. 20 (%)" : "e.g. 15 ($)"}
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
              className="rounded-xl"
            />
            <Input
              type="number"
              min={1}
              placeholder="Max redemptions (optional)"
              value={maxRedemptions}
              onChange={(e) => setMaxRedemptions(e.target.value)}
              className="rounded-xl"
            />
          </div>
          <div className="mt-4 flex gap-3">
            <Button onClick={submitCoupon} disabled={creating} className="rounded-xl gradient-brand text-white">
              {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Coupon"}
            </Button>
            <Button variant="ghost" className="rounded-xl" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </GlowCard>
      )}

      {loading ? (
        <GlowCard className="p-8 text-sm text-muted-foreground">Loading coupons...</GlowCard>
      ) : error ? (
        <GlowCard className="p-8 text-sm text-destructive">{error}</GlowCard>
      ) : coupons.length === 0 ? (
        <GlowCard className="flex flex-col items-center gap-3 p-8 text-center">
          <Ticket className="h-10 w-10 text-muted-foreground" />
          <p className="text-muted-foreground">No coupons yet. Create one to offer a discount.</p>
        </GlowCard>
      ) : (
        <GlowCard className="p-5">
          <h3 className="mb-4 font-semibold">All coupons</h3>
          <div className="space-y-2">
            {coupons.map((coupon) => (
              <div key={coupon.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card px-4 py-3">
                <div className="min-w-0">
                  <p className="font-mono font-medium">{coupon.code}</p>
                  <p className="text-xs text-muted-foreground">
                    {coupon.discount_type === "percent" ? `${coupon.discount_value}% off` : `$${coupon.discount_value} off`}
                    {coupon.course_title ? ` · ${coupon.course_title}` : " · platform-wide"} · used {coupon.redemption_count}
                    {coupon.max_redemptions ? `/${coupon.max_redemptions}` : ""} times
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={coupon.is_active ? "Active" : "Closed"} />
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-lg"
                    disabled={savingId === coupon.id}
                    onClick={() => toggleActive(coupon)}
                  >
                    {savingId === coupon.id ? <Loader2 className="h-4 w-4 animate-spin" /> : coupon.is_active ? "Deactivate" : "Activate"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </GlowCard>
      )}
    </DashPage>
  );
}
