import { createFileRoute } from "@tanstack/react-router";
import { Gift, Percent, Tag, Trophy, Wallet, Medal, Sparkles } from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ROLES } from "@/lib/roles";
import { teacherRewards } from "@/lib/teacherMock";

export const Route = createFileRoute("/teacher/rewards")({
  component: RewardsPage,
});

function RewardsPage() {
  const { coupons, scholarships, walletGifts } = teacherRewards;

  return (
    <DashPage role="teacher" title="Rewards & Promotions" subtitle="Coupons, scholarships, gifts, and competitions" icon={ROLES.teacher.icon}>
      {/* Coupons */}
      <Card className="border bg-card p-5">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 font-semibold"><Tag className="h-4 w-4 text-primary" /> Coupons</h3>
          <Button variant="outline" size="sm" className="rounded-xl">Create Coupon</Button>
        </div>
        <div className="mt-4 space-y-2">
          {coupons.map((c) => (
            <div key={c.code} className="flex items-center justify-between rounded-xl border px-4 py-3">
              <div className="flex items-center gap-3">
                <Badge className="rounded-lg bg-violet-500/10 text-violet-600 border-0 font-mono">{c.code}</Badge>
                <div>
                  <p className="text-sm font-medium">{c.discount} off</p>
                  <p className="text-xs text-muted-foreground">{c.course} · Expires {c.expires}</p>
                </div>
              </div>
              <div className="text-end">
                <p className="text-sm font-medium">{c.uses}/{c.maxUses}</p>
                <p className="text-xs text-muted-foreground">uses</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Scholarships */}
      <Card className="border bg-card p-5">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 font-semibold"><Medal className="h-4 w-4 text-amber-500" /> Scholarships</h3>
          <Button variant="outline" size="sm" className="rounded-xl">Grant Scholarship</Button>
        </div>
        <div className="mt-4 space-y-2">
          {scholarships.map((s) => (
            <div key={s.studentCode} className="flex items-center justify-between rounded-xl border px-4 py-3">
              <div className="flex items-center gap-3">
                <Badge className={`rounded-full border-0 text-xs ${s.type === "Gold" ? "bg-amber-500/10 text-amber-600" : "bg-slate-500/10 text-slate-600"}`}>
                  {s.type}
                </Badge>
                <div>
                  <p className="text-sm font-medium">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{s.studentCode} · {s.course}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Since {s.since}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Wallet Gifts */}
      <Card className="border bg-card p-5">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 font-semibold"><Gift className="h-4 w-4 text-emerald-500" /> Wallet Gifts</h3>
          <Button variant="outline" size="sm" className="rounded-xl">Send Gift</Button>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">Transfer from your wallet directly to a student's wallet.</p>
        <div className="mt-4 space-y-2">
          {walletGifts.map((g, i) => (
            <div key={i} className="flex items-center justify-between rounded-xl border px-4 py-3">
              <div>
                <p className="text-sm font-medium">{g.name}</p>
                <p className="text-xs text-muted-foreground">{g.studentCode} · {g.reason}</p>
              </div>
              <div className="text-end">
                <p className="text-sm font-semibold text-emerald-600">${g.amount}</p>
                <p className="text-xs text-muted-foreground">{g.date}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Feature Promotion */}
      <Card className="border bg-card p-5">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 font-semibold"><Sparkles className="h-4 w-4 text-primary" /> Feature on Platform</h3>
          <Button variant="outline" size="sm" className="rounded-xl">Promote Course</Button>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">Feature your courses, chapters, or sessions on the landing page, popular courses, and recommendation banners.</p>
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          {["Landing Page Banner", "Popular Courses", "Recommendations"].map((spot) => (
            <div key={spot} className="rounded-xl border p-3 text-center text-sm">{spot}</div>
          ))}
        </div>
      </Card>
    </DashPage>
  );
}
