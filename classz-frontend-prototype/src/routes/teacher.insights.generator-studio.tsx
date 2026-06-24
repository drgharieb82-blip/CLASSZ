import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Wand2, Sparkles, Star } from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ROLES } from "@/lib/roles";
import { useApp } from "@/lib/app-context";
import { generatorTools } from "@/lib/insights-mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/teacher/insights/generator-studio")({
  component: GeneratorStudioPage,
});

const categoryColors: Record<string, string> = {
  content: "border-blue-300 text-blue-600 bg-blue-500/10",
  assessment: "border-amber-300 text-amber-600 bg-amber-500/10",
  document: "border-emerald-300 text-emerald-600 bg-emerald-500/10",
};

const categoryLabels: Record<string, string> = {
  content: "Content",
  assessment: "Assessment",
  document: "Document",
};

function GeneratorStudioPage() {
  const { t } = useApp();
  const [tab, setTab] = useState("all");

  const filtered = tab === "all" ? generatorTools : generatorTools.filter((g) => g.category === tab);

  // Feature spotlight: most popular generator (Question Generator)
  const spotlight = generatorTools[0];

  return (
    <DashPage role="teacher" title={t("ins.generatorStudio")} subtitle="AI-powered content and assessment generation tools" icon={ROLES.teacher.icon}>
      {/* Feature Spotlight */}
      <Card className="border bg-card p-5 relative overflow-hidden">
        <div className="absolute top-0 end-0 w-32 h-32 opacity-5">
          <Sparkles className="w-full h-full" />
        </div>
        <div className="flex items-start gap-4">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-primary/10 text-3xl">
            {spotlight.icon}
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Star className="h-4 w-4 text-amber-500" />
              <span className="text-xs font-semibold text-amber-600 uppercase tracking-wide">Most Popular</span>
            </div>
            <h3 className="text-lg font-bold">{spotlight.name}</h3>
            <p className="text-sm text-muted-foreground mt-1">{spotlight.description}</p>
            <div className="flex items-center gap-2 mt-3">
              <Badge variant="outline" className={cn("text-xs", categoryColors[spotlight.category])}>
                {categoryLabels[spotlight.category]}
              </Badge>
              <Button size="sm" className="rounded-xl gradient-brand text-white gap-1.5">
                <Wand2 className="h-3.5 w-3.5" />
                Generate Now
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="rounded-xl">
          <TabsTrigger value="all" className="rounded-lg">All ({generatorTools.length})</TabsTrigger>
          <TabsTrigger value="content" className="rounded-lg">
            Content ({generatorTools.filter((g) => g.category === "content").length})
          </TabsTrigger>
          <TabsTrigger value="assessment" className="rounded-lg">
            Assessment ({generatorTools.filter((g) => g.category === "assessment").length})
          </TabsTrigger>
          <TabsTrigger value="document" className="rounded-lg">
            Document ({generatorTools.filter((g) => g.category === "document").length})
          </TabsTrigger>
        </TabsList>

        {["all", "content", "assessment", "document"].map((tabVal) => (
          <TabsContent key={tabVal} value={tabVal}>
            {filtered.length === 0 ? (
              <Card className="border border-dashed bg-card p-10">
                <p className="text-center text-muted-foreground text-sm">No generators in this category</p>
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filtered.map((tool) => (
                  <Card key={tool.id} className="border bg-card p-5 flex flex-col">
                    <div className="flex items-start gap-3 mb-3">
                      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-muted text-2xl">
                        {tool.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm leading-tight">{tool.name}</h4>
                        <Badge variant="outline" className={cn("mt-1 text-[10px]", categoryColors[tool.category])}>
                          {categoryLabels[tool.category]}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground flex-1 mb-4">{tool.description}</p>
                    <Button variant="outline" size="sm" className="rounded-xl w-full gap-1.5">
                      <Wand2 className="h-3.5 w-3.5" />
                      Generate
                    </Button>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </DashPage>
  );
}
