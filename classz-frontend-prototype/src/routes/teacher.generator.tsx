import { createFileRoute } from "@tanstack/react-router";
import { FileText, Image, Layers, Presentation, Sparkles, BookOpen, HelpCircle } from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ROLES } from "@/lib/roles";

export const Route = createFileRoute("/teacher/generator")({
  component: GeneratorPage,
});

const generators = [
  { icon: FileText, title: "Lesson Cards", desc: "Generate summarized lesson cards with key concepts and formulas.", status: "available" as const },
  { icon: BookOpen, title: "PDF Materials", desc: "Create structured PDF worksheets, handouts, and study guides.", status: "available" as const },
  { icon: HelpCircle, title: "Question Sets", desc: "AI-generated MCQ, essay, and calculation questions from your content.", status: "available" as const },
  { icon: Layers, title: "Answer Sheets", desc: "Auto-generate answer sheets with marking criteria.", status: "available" as const },
  { icon: Presentation, title: "Slide Decks", desc: "PowerPoint-style presentations from your lesson content.", status: "coming-soon" as const },
  { icon: Image, title: "Concept Diagrams", desc: "Visual diagrams and infographics for atomic concepts.", status: "coming-soon" as const },
  { icon: Sparkles, title: "AI Lesson Builder", desc: "Full lesson structure generated from topic and learning objectives.", status: "coming-soon" as const },
];

function GeneratorPage() {
  return (
    <DashPage role="teacher" title="Generator Studio" subtitle="AI-powered content generation tools" icon={ROLES.teacher.icon}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {generators.map((gen) => (
          <Card key={gen.title} className="relative border bg-card p-5 transition-colors hover:border-primary/30">
            {gen.status === "coming-soon" && (
              <Badge className="absolute end-3 top-3 rounded-full bg-amber-500/10 text-amber-600 border-0 text-xs">Coming Soon</Badge>
            )}
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10">
              <gen.icon className="h-5 w-5 text-primary" />
            </div>
            <h3 className="mt-3 font-semibold">{gen.title}</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">{gen.desc}</p>
          </Card>
        ))}
      </div>
    </DashPage>
  );
}
