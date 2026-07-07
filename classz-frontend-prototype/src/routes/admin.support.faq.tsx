import { createFileRoute, Link, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { Headphones, Search, Eye, HelpCircle } from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useApp } from "@/lib/app-context";
import { cn } from "@/lib/utils";
import { faqItems } from "@/lib/admin-mock-data";

export const Route = createFileRoute("/admin/support/faq")({
  component: FaqPage,
});

/* ── Tab navigation ── */
const supportTabs = [
  { label: "sup.tickets", to: "/admin/support/tickets" },
  { label: "sup.conversations", to: "/admin/support/conversations" },
  { label: "sup.reports", to: "/admin/support/reports" },
  { label: "sup.faq", to: "/admin/support/faq" },
];

const categoryColors: Record<string, string> = {
  Account: "bg-violet-500/10 text-violet-600 border-violet-300",
  Payment: "bg-emerald-500/10 text-emerald-600 border-emerald-300",
  Courses: "bg-blue-500/10 text-blue-600 border-blue-300",
  Communication: "bg-amber-500/10 text-amber-600 border-amber-300",
  Learning: "bg-cyan-500/10 text-cyan-600 border-cyan-300",
  Safety: "bg-rose-500/10 text-rose-600 border-rose-300",
};

const allCategories = [...new Set(faqItems.map((f) => f.category))];

function FaqPage() {
  const { t } = useApp();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const filtered = faqItems.filter((f) => {
    const matchSearch =
      f.question.toLowerCase().includes(search.toLowerCase()) ||
      f.answer.toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter === "all" || f.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  return (
    <DashPage role="superadmin" title="sa.supportCenter" subtitle="sa.supportCenterSubtitle" icon={Headphones}>
      {/* Tab navigation */}
      <div className="flex gap-1 rounded-xl bg-muted p-1">
        {supportTabs.map((tab) => {
          const active = pathname.includes(tab.to);
          return (
            <Link
              key={tab.to}
              to={tab.to}
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-medium transition-all",
                active ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t(tab.label)}
            </Link>
          );
        })}
      </div>

      {/* Summary */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3">
        <Card className="border bg-card p-4 text-center">
          <p className="text-2xl font-bold">{faqItems.length}</p>
          <p className="text-xs text-muted-foreground">{t("sup.totalFaq")}</p>
        </Card>
        <Card className="border bg-card p-4 text-center">
          <p className="text-2xl font-bold">{allCategories.length}</p>
          <p className="text-xs text-muted-foreground">{t("sup.categories")}</p>
        </Card>
        <Card className="border bg-card p-4 text-center">
          <p className="text-2xl font-bold">{faqItems.reduce((s, f) => s + f.views, 0).toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">{t("sup.totalViews")}</p>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("sup.searchFaq")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="ps-9"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder={t("sup.allCategories")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("sup.allCategories")}</SelectItem>
            {allCategories.map((cat) => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* FAQ Grid */}
      {filtered.length === 0 ? (
        <Card className="border bg-card p-8 text-center">
          <HelpCircle className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">{t("sup.noFaq")}</p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((faq) => (
            <Card
              key={faq.id}
              className="group border bg-card p-5 transition-all hover:shadow-lg hover:border-primary/30 hover:-translate-y-0.5"
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <Badge variant="outline" className={cn("text-[10px] rounded-full shrink-0", categoryColors[faq.category] ?? "bg-muted text-muted-foreground")}>
                  {faq.category}
                </Badge>
                <div className="flex items-center gap-1 text-muted-foreground shrink-0">
                  <Eye className="h-3 w-3" />
                  <span className="text-[10px]">{faq.views.toLocaleString()}</span>
                </div>
              </div>
              <h3 className="text-sm font-semibold mb-2 leading-snug group-hover:text-primary transition-colors">
                {faq.question}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                {faq.answer}
              </p>
            </Card>
          ))}
        </div>
      )}
    </DashPage>
  );
}
