import { createFileRoute } from "@tanstack/react-router";
import { Target, Heart, Globe, Zap, Users, Award } from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About CLASSZ — Our Mission" },
      { name: "description", content: "Learn about CLASSZ, our mission to make premium education accessible, and the team behind the platform." },
      { property: "og:title", content: "About CLASSZ" },
      { property: "og:description", content: "Our mission to make premium education accessible to every learner." },
    ],
  }),
  component: About,
});

const values = [
  { icon: Target, title: "Mastery first", desc: "We design every course to build deep, lasting understanding." },
  { icon: Heart, title: "Student obsessed", desc: "Every decision starts with the learner experience." },
  { icon: Globe, title: "Accessible to all", desc: "Arabic & English, RTL & LTR, on any device, anywhere." },
  { icon: Zap, title: "Built for speed", desc: "A fast, delightful product that respects your time." },
];

function About() {
  return (
    <PublicLayout>
      <section className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6">
        <Badge variant="outline" className="rounded-full border-primary/30 text-primary">Our story</Badge>
        <h1 className="mt-5 text-4xl font-extrabold tracking-tight sm:text-5xl">Education that adapts to <span className="text-gradient">every learner</span></h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
          CLASSZ was born from a simple belief: world-class learning should feel personal, motivating, and joyful. We combine structured courses, gamification, and AI to help secondary students and teachers thrive.
        </p>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-4 sm:grid-cols-3 sm:px-6">
        {[["50k+", "Active learners", Users], ["200+", "Courses", Award], ["120+", "Expert teachers", Heart]].map(([n, l, Icon]: any) => (
          <Card key={l} className="border bg-card p-8 text-center">
            <Icon className="mx-auto h-8 w-8 text-primary" />
            <p className="mt-3 text-3xl font-extrabold">{n}</p>
            <p className="text-muted-foreground">{l}</p>
          </Card>
        ))}
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <h2 className="text-center text-3xl font-bold">Our values</h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((v) => (
            <Card key={v.title} className="card-hover border bg-card p-6">
              <span className="grid h-12 w-12 place-items-center rounded-2xl gradient-brand-soft text-primary"><v.icon className="h-6 w-6" /></span>
              <h3 className="mt-4 font-semibold">{v.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{v.desc}</p>
            </Card>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}
