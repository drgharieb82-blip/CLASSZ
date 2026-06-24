import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Tags, Plus, Percent, DollarSign, Clock, CheckCircle2,
  Package, Gift, ShoppingCart,
} from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ROLES } from "@/lib/roles";
import { useApp } from "@/lib/app-context";
import { coupons, type CouponRecord } from "@/lib/business-mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/teacher/business/coupons-pricing")({
  component: CouponsPricingPage,
});

const bundlePricing = [
  { name: "Math Essentials Bundle", items: "Advanced Mathematics + Calculus Masterclass", price: 380, discount: 15 },
  { name: "Full Access Pack", items: "All 3 Courses + Session Packs", price: 550, discount: 25 },
  { name: "Statistics Starter", items: "Statistics & Probability + 5 Sessions", price: 220, discount: 10 },
];

function CouponsPricingPage() {
  const { t } = useApp();
  const [createOpen, setCreateOpen] = useState(false);

  const activeCoupons = coupons.filter((c) => c.active);
  const expiredCoupons = coupons.filter((c) => !c.active);
  const totalUses = coupons.reduce((s, c) => s + c.uses, 0);

  return (
    <DashPage
      role="teacher"
      title={t("biz.couponsPricing")}
      subtitle={`${coupons.length} coupons`}
      icon={ROLES.teacher.icon}
      actions={
        <Button className="rounded-xl gradient-brand border-0 text-white" size="sm" onClick={() => setCreateOpen(true)}>
          <Plus className="me-1.5 h-4 w-4" /> Create Coupon
        </Button>
      }
    >
      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="flex items-center gap-3 border bg-card p-4">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/10">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          </span>
          <div>
            <p className="text-2xl font-bold">{activeCoupons.length}</p>
            <p className="text-xs text-muted-foreground">Active Coupons</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 border bg-card p-4">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-500/10">
            <Clock className="h-5 w-5 text-slate-500" />
          </span>
          <div>
            <p className="text-2xl font-bold">{expiredCoupons.length}</p>
            <p className="text-xs text-muted-foreground">Expired Coupons</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 border bg-card p-4">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-500/10">
            <Tags className="h-5 w-5 text-blue-500" />
          </span>
          <div>
            <p className="text-2xl font-bold">{totalUses.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Total Redemptions</p>
          </div>
        </Card>
      </div>

      {/* Coupons Grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {coupons.map((coupon) => (
          <CouponCard key={coupon.id} coupon={coupon} />
        ))}
      </div>

      {/* Bundle Pricing */}
      <Card className="border bg-card">
        <div className="flex items-center gap-2.5 p-4 pb-0">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-violet-500/10">
            <Package className="h-4.5 w-4.5 text-violet-500" />
          </span>
          <div>
            <h3 className="text-sm font-semibold">Bundle Pricing</h3>
            <p className="text-xs text-muted-foreground">Discounted course bundles for students</p>
          </div>
        </div>
        <Separator className="mt-4" />
        <div className="divide-y">
          {bundlePricing.map((bundle) => (
            <div key={bundle.name} className="flex items-center gap-4 p-4">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-violet-500/10">
                <Gift className="h-5 w-5 text-violet-500" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold truncate">{bundle.name}</p>
                <p className="text-xs text-muted-foreground truncate">{bundle.items}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <Badge className="rounded-full border-0 bg-emerald-500/10 text-emerald-600 text-xs">
                  {bundle.discount}% off
                </Badge>
                <span className="text-sm font-bold">${bundle.price}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <CreateCouponDialog open={createOpen} onOpenChange={setCreateOpen} />
    </DashPage>
  );
}

function CouponCard({ coupon }: { coupon: CouponRecord }) {
  const usagePercent = coupon.maxUses > 0 ? Math.round((coupon.uses / coupon.maxUses) * 100) : 0;
  const isExpired = !coupon.active;

  return (
    <Card className={cn("border bg-card p-4 space-y-3", isExpired && "opacity-70")}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-mono text-base font-bold tracking-wider">{coupon.code}</p>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{coupon.course}</p>
        </div>
        <Badge
          variant="outline"
          className={cn(
            "rounded-full text-xs shrink-0",
            coupon.active
              ? "bg-emerald-500/10 text-emerald-600 border-emerald-300"
              : "bg-slate-500/10 text-slate-500 border-slate-300"
          )}
        >
          {coupon.active ? "Active" : "Expired"}
        </Badge>
      </div>

      <div className="flex items-center gap-2">
        <span className={cn(
          "grid h-8 w-8 place-items-center rounded-lg",
          coupon.discountType === "percentage" ? "bg-blue-500/10" : "bg-amber-500/10"
        )}>
          {coupon.discountType === "percentage"
            ? <Percent className="h-4 w-4 text-blue-500" />
            : <DollarSign className="h-4 w-4 text-amber-500" />
          }
        </span>
        <span className="text-lg font-bold">
          {coupon.discountType === "percentage" ? `${coupon.discountValue}%` : `$${coupon.discountValue}`}
        </span>
        <span className="text-xs text-muted-foreground">
          {coupon.discountType === "percentage" ? "discount" : "off"}
        </span>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Usage</span>
          <span className="font-medium">{coupon.uses}/{coupon.maxUses}</span>
        </div>
        <Progress value={usagePercent} className="h-1.5" />
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>Expires {coupon.expires}</span>
        </div>
        <span className="font-medium text-foreground">{coupon.id}</span>
      </div>
    </Card>
  );
}

function CreateCouponDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { t } = useApp();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Coupon</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Coupon Code</Label>
            <Input placeholder="e.g. SUMMER2026" className="rounded-xl font-mono uppercase" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Discount Type</Label>
              <Select>
                <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage (%)</SelectItem>
                  <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Value</Label>
              <Input type="number" placeholder="0" className="rounded-xl" min={0} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Course</Label>
            <Select>
              <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select course" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                <SelectItem value="math">Advanced Mathematics</SelectItem>
                <SelectItem value="calc">Calculus Masterclass</SelectItem>
                <SelectItem value="stats">Statistics & Probability</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Max Uses</Label>
              <Input type="number" placeholder="100" className="rounded-xl" min={1} />
            </div>
            <div className="space-y-1.5">
              <Label>Expiry Date</Label>
              <Input type="date" className="rounded-xl" />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" className="rounded-xl" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button className="rounded-xl gradient-brand border-0 text-white" onClick={() => onOpenChange(false)}>
            <Plus className="me-1.5 h-4 w-4" /> Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
