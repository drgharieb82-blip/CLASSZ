import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Sparkles } from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { GlowCard } from "@/components/premium/GlowCard";
import { GradientButton } from "@/components/premium/GradientButton";
import { FloatingParticles } from "@/components/premium/FloatingParticles";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { pricingPlans } from "@/lib/mock";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — CLASSZ" },
      { name: "description", content: "Simple, transparent pricing for CLASSZ. Start free, upgrade to Pro, or pick a Family plan." },
      { property: "og:title", content: "Pricing — CLASSZ" },
      { property: "og:description", content: "Simple, transparent pricing — start free." },
    ],
  }),
  component: PricingPage,
});

function PricingPage() {
  return (
    <PublicLayout>
      <section className="relative overflow-hidden">
        <FloatingParticles />
        <div className="relative mx-auto max-w-7xl px-4 py-16 text-center sm:px-6">
          <Badge className="rounded-full border-0 gradient-brand text-white"><Sparkles className="me-1 h-3 w-3" />Pricing</Badge>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-5xl">Plans that grow with you</h1>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">Start free forever. Upgrade anytime — cancel anytime.</p>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {pricingPlans.map((plan) => (
              <GlowCard key={plan.name} gradientBorder={plan.popular} glow={plan.popular} className="text-start">
                <div className="p-7">
                  {plan.popular && <Badge className="mb-3 rounded-full border-0 gradient-brand text-white">Most popular</Badge>}
                  <h3 className="text-lg font-bold">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground">{plan.desc}</p>
                  <div className="mt-4 flex items-end gap-1">
                    <span className="text-4xl font-extrabold">${plan.price}</span>
                    <span className="mb-1 text-sm text-muted-foreground">/{plan.period}</span>
                  </div>
                  <ul className="mt-6 space-y-3">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm">
                        <span className="grid h-5 w-5 place-items-center rounded-full gradient-brand-soft">
                          <Check className="h-3 w-3 text-primary" />
                        </span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <GradientButton asChild variant={plan.popular ? "glow" : "outline"} className="mt-7 w-full">
                    <Link to="/register">{plan.cta}</Link>
                  </GradientButton>
                </div>
              </GlowCard>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
