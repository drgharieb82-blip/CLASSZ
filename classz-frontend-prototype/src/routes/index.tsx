import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Sparkles, ArrowRight, PlayCircle, BookOpen, Bot, Users, Trophy, BarChart3,
  Star, Check, GraduationCap, ClipboardCheck, Rocket,
} from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { HeroSlider } from "@/components/premium/HeroSlider";
import { CourseCard } from "@/components/common/CourseCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useApp } from "@/lib/app-context";
import { courses, testimonials, pricingPlans } from "@/lib/mock";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CLASSZ — Learn Smarter | Premium Learning Platform" },
      { name: "description", content: "CLASSZ blends structured courses, gamified progress, and an AI study assistant for secondary students, teachers and parents. Learn smarter today." },
      { property: "og:title", content: "CLASSZ — Learn Smarter" },
      { property: "og:description", content: "Premium courses, gamified progress, and an AI study assistant." },
    ],
  }),
  component: Landing,
});

const steps = [
  { icon: GraduationCap, title: "Enroll in courses", desc: "Pick from 200+ expertly structured courses across every subject." },
  { icon: PlayCircle, title: "Learn your way", desc: "Watch lessons, read PDFs, take notes, and join discussions." },
  { icon: ClipboardCheck, title: "Practice & quiz", desc: "Master concepts with a rich question bank and timed quizzes." },
  { icon: Rocket, title: "Track & grow", desc: "Earn XP, keep streaks, climb leaderboards and get certified." },
];

const features = [
  { icon: BookOpen, title: "Structured courses", desc: "Coursera-style chapters, lessons and resources organized beautifully." },
  { icon: Bot, title: "AI study assistant", desc: "ChatGPT-style helper to explain concepts and solve problems instantly." },
  { icon: Trophy, title: "Gamified learning", desc: "Duolingo-style streaks, XP, badges and competitive leaderboards." },
  { icon: BarChart3, title: "Powerful analytics", desc: "Notion-style organization with deep progress insights for everyone." },
];

function Landing() {
  const { t } = useApp();
  return (
    <PublicLayout>
      {/* Premium animated banner */}
      <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6">
        <HeroSlider />
      </section>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 gradient-brand-soft" />
        <div className="absolute -top-24 right-1/4 -z-10 h-96 w-96 rounded-full bg-primary/20 blur-3xl animate-float" />
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:py-28">
          <div>
            <Badge variant="outline" className="rounded-full border-primary/30 bg-primary/10 text-primary">
              <Sparkles className="me-1 h-3.5 w-3.5" /> AI-powered learning, reimagined
            </Badge>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
              {t("hero.title").split("CLASSZ")[0]}
              <span className="text-gradient">CLASSZ</span>
            </h1>
            <p className="mt-5 max-w-lg text-lg text-muted-foreground">{t("hero.subtitle")}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-xl gradient-brand text-white border-0 glow">
                <Link to="/register">{t("hero.getStarted")} <ArrowRight className="ms-1 h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-xl">
                <Link to="/login">{t("nav.login")}</Link>
              </Button>
            </div>
            <div className="mt-10 flex items-center gap-6 text-sm">
              {[["50k+", "Students"], ["200+", "Courses"], ["98%", "Satisfaction"]].map(([n, l]) => (
                <div key={l}><p className="text-2xl font-bold">{n}</p><p className="text-muted-foreground">{l}</p></div>
              ))}
            </div>
          </div>
          <div className="relative">
            <Card className="glass rotate-1 rounded-3xl p-6 shadow-2xl">
              <div className="flex items-center justify-between">
                <p className="font-semibold">Today's progress</p>
                <Badge className="rounded-full gradient-brand border-0 text-white">🔥 23-day streak</Badge>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                {[["Lessons", "4/6", "from-violet-500 to-blue-500"], ["XP earned", "+280", "from-emerald-500 to-teal-500"], ["Quizzes", "8/10", "from-amber-500 to-orange-500"], ["Rank", "#4", "from-pink-500 to-rose-500"]].map(([l, v, g]) => (
                  <div key={l} className={`rounded-2xl bg-gradient-to-br ${g} p-4 text-white`}>
                    <p className="text-sm opacity-90">{l}</p><p className="text-2xl font-bold">{v}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-3 rounded-2xl border bg-card p-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl gradient-brand text-white"><Bot className="h-5 w-5" /></span>
                <div className="min-w-0"><p className="text-sm font-medium">CLASSZ Assistant</p><p className="truncate text-xs text-muted-foreground">"Need help with derivatives? Let's go! ✨"</p></div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <SectionHeading kicker="Why CLASSZ" title="Everything you need to learn smarter" />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <Card key={f.title} className="card-hover border bg-card p-6">
              <span className="grid h-12 w-12 place-items-center rounded-2xl gradient-brand-soft text-primary"><f.icon className="h-6 w-6" /></span>
              <h3 className="mt-4 font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{f.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Featured courses */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="flex items-end justify-between">
          <SectionHeading kicker="Featured" title="Popular courses" align="start" />
          <Button asChild variant="ghost" className="rounded-xl"><Link to="/courses">View all <ArrowRight className="ms-1 h-4 w-4" /></Link></Button>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {courses.slice(0, 4).map((c) => <CourseCard key={c.id} course={c} />)}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-card/40 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading kicker="How it works" title="From zero to mastery in 4 steps" />
          <div className="mt-10 grid gap-5 md:grid-cols-4">
            {steps.map((s, i) => (
              <Card key={s.title} className="relative border bg-card p-6">
                <span className="absolute end-4 top-4 text-5xl font-black text-muted/40">{i + 1}</span>
                <span className="grid h-12 w-12 place-items-center rounded-2xl gradient-brand text-white"><s.icon className="h-6 w-6" /></span>
                <h3 className="mt-4 font-semibold">{s.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{s.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* AI + Parent preview */}
      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-16 sm:px-6 lg:grid-cols-2">
        <Card className="overflow-hidden border bg-card p-8">
          <Badge variant="outline" className="rounded-full border-primary/30 text-primary"><Bot className="me-1 h-3.5 w-3.5" /> AI Assistant</Badge>
          <h3 className="mt-4 text-2xl font-bold">Your 24/7 study companion</h3>
          <p className="mt-2 text-muted-foreground">Ask anything — explain concepts, solve questions, analyze mistakes, and build study plans.</p>
          <div className="mt-6 space-y-3">
            <div className="ms-auto max-w-[80%] rounded-2xl rounded-br-sm gradient-brand p-3 text-sm text-white">Explain the chain rule simply</div>
            <div className="max-w-[85%] rounded-2xl rounded-bl-sm border bg-muted/50 p-3 text-sm">Sure! Differentiate the outer function, keep the inner intact, then multiply by the inner's derivative. ✨</div>
          </div>
          <Button asChild className="mt-6 rounded-xl gradient-brand text-white border-0"><Link to="/assistant">Try the assistant</Link></Button>
        </Card>
        <Card className="overflow-hidden border bg-card p-8">
          <Badge variant="outline" className="rounded-full border-emerald-500/30 text-emerald-500"><Users className="me-1 h-3.5 w-3.5" /> Parent Monitoring</Badge>
          <h3 className="mt-4 text-2xl font-bold">Stay close to your child's journey</h3>
          <p className="mt-2 text-muted-foreground">Track progress, homework, attendance and grades — all in one calm dashboard.</p>
          <div className="mt-6 grid grid-cols-2 gap-3">
            {[["Overall grade", "A−", "92%"], ["Attendance", "Great", "96%"], ["Homework", "On track", "8/9"], ["This week", "+4 lessons", "↑"]].map(([l, v, s]) => (
              <div key={l} className="rounded-2xl border bg-muted/40 p-4">
                <p className="text-xs text-muted-foreground">{l}</p><p className="text-lg font-bold">{v}</p><p className="text-xs text-success">{s}</p>
              </div>
            ))}
          </div>
          <Button asChild variant="outline" className="mt-6 rounded-xl"><Link to="/parent">Explore parent portal</Link></Button>
        </Card>
      </section>

      {/* Testimonials */}
      <section className="bg-card/40 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading kicker="Loved by learners" title="What our community says" />
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {testimonials.map((tm) => (
              <Card key={tm.name} className="border bg-card p-6">
                <div className="flex gap-0.5 text-warning">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-warning" />)}</div>
                <p className="mt-4 text-sm leading-relaxed">"{tm.text}"</p>
                <div className="mt-5 flex items-center gap-3">
                  <Avatar><AvatarFallback className="gradient-brand text-white text-xs font-bold">{tm.avatar}</AvatarFallback></Avatar>
                  <div><p className="text-sm font-semibold">{tm.name}</p><p className="text-xs text-muted-foreground">{tm.role}</p></div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing preview */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <SectionHeading kicker="Pricing" title="Simple plans for everyone" />
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {pricingPlans.map((p) => (
            <Card key={p.name} className={`relative border p-6 ${p.popular ? "border-primary shadow-lg glow" : "bg-card"}`}>
              {p.popular && <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full gradient-brand border-0 text-white">Most popular</Badge>}
              <h3 className="font-semibold">{p.name}</h3>
              <p className="text-sm text-muted-foreground">{p.desc}</p>
              <p className="mt-4 text-4xl font-extrabold">${p.price}<span className="text-base font-normal text-muted-foreground">/{p.period}</span></p>
              <ul className="mt-6 space-y-2.5 text-sm">
                {p.features.map((f) => <li key={f} className="flex items-center gap-2"><Check className="h-4 w-4 text-success" />{f}</li>)}
              </ul>
              <Button asChild className={`mt-6 w-full rounded-xl ${p.popular ? "gradient-brand text-white border-0" : ""}`} variant={p.popular ? "default" : "outline"}>
                <Link to="/pricing">{p.cta}</Link>
              </Button>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <Card className="relative overflow-hidden gradient-brand p-10 text-center text-white sm:p-16">
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <h2 className="relative text-3xl font-extrabold sm:text-4xl">Ready to learn smarter?</h2>
          <p className="relative mx-auto mt-3 max-w-xl text-white/80">Join CLASSZ today and unlock courses, AI help, and a community that keeps you motivated.</p>
          <Button asChild size="lg" variant="secondary" className="relative mt-8 rounded-xl"><Link to="/register">Create free account <ArrowRight className="ms-1 h-4 w-4" /></Link></Button>
        </Card>
      </section>
    </PublicLayout>
  );
}

function SectionHeading({ kicker, title, align = "center" }: { kicker: string; title: string; align?: "center" | "start" }) {
  return (
    <div className={align === "center" ? "text-center" : ""}>
      <p className="text-sm font-semibold uppercase tracking-wider text-primary">{kicker}</p>
      <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
    </div>
  );
}
