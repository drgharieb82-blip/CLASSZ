import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { GradientButton } from "@/components/premium/GradientButton";
import { cn } from "@/lib/utils";

interface Slide {
  emoji: string;
  kicker: string;
  title: string;
  desc: string;
  gradient: string;
  cta: string;
  to: string;
}

const slides: Slide[] = [
  {
    emoji: "🧠",
    kicker: "Smart Learning",
    title: "Master every subject, your way",
    desc: "200+ structured courses with lessons, notes, PDFs and discussions designed for secondary students.",
    gradient: "from-violet-500 via-indigo-500 to-blue-500",
    cta: "Explore courses",
    to: "/courses",
  },
  {
    emoji: "🤖",
    kicker: "AI Assistant",
    title: "Your personal AI study buddy",
    desc: "Explain concepts, solve questions, analyze mistakes and build a study plan — instantly.",
    gradient: "from-fuchsia-500 via-purple-500 to-violet-500",
    cta: "Try the assistant",
    to: "/assistant",
  },
  {
    emoji: "🏆",
    kicker: "Student Achievements",
    title: "Streaks, XP, badges & leaderboards",
    desc: "Stay motivated with gamified progress that turns daily study into a winning habit.",
    gradient: "from-amber-500 via-orange-500 to-rose-500",
    cta: "View leaderboard",
    to: "/student/leaderboard",
  },
  {
    emoji: "🧑‍🏫",
    kicker: "Teacher Tools",
    title: "Powerful tools to teach & inspire",
    desc: "Build courses, manage questions, create assignments and track every student's growth.",
    gradient: "from-cyan-500 via-sky-500 to-blue-500",
    cta: "For teachers",
    to: "/teacher",
  },
  {
    emoji: "👨‍👩‍👧",
    kicker: "Parent Monitoring",
    title: "Stay close to your child's progress",
    desc: "Follow homework, attendance and performance with a calm, clear monitoring portal.",
    gradient: "from-emerald-500 via-teal-500 to-green-500",
    cta: "For parents",
    to: "/parent",
  },
];

export function HeroSlider() {
  const [i, setI] = useState(0);
  const go = (n: number) => setI((n + slides.length) % slides.length);

  useEffect(() => {
    const id = setInterval(() => setI((p) => (p + 1) % slides.length), 6500);
    return () => clearInterval(id);
  }, []);

  const s = slides[i];

  return (
    <div className="relative overflow-hidden rounded-3xl border bg-card/40 backdrop-blur-xl shadow-2xl">
      <AnimatePresence mode="wait">
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          className={cn("absolute inset-0 bg-gradient-to-br opacity-[0.14]", s.gradient)}
        />
      </AnimatePresence>

      <div className="relative grid items-center gap-6 p-8 sm:p-12 md:grid-cols-2 md:gap-10">
        <div>
          <AnimatePresence mode="wait">
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <span className={cn("inline-block rounded-full bg-gradient-to-r px-3 py-1 text-xs font-semibold text-white", s.gradient)}>
                {s.kicker}
              </span>
              <h2 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl md:text-5xl">{s.title}</h2>
              <p className="mt-4 max-w-md text-muted-foreground">{s.desc}</p>
              <div className="mt-6">
                <GradientButton size="lg" asChild>
                  <Link to={s.to}>
                    {s.cta} <ArrowRight className="h-4 w-4" />
                  </Link>
                </GradientButton>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="relative hidden h-64 items-center justify-center md:flex">
          <AnimatePresence mode="wait">
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.6, rotate: -8 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.6, rotate: 8 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className={cn("grid h-48 w-48 place-items-center rounded-[2rem] bg-gradient-to-br text-8xl shadow-2xl", s.gradient)}
            >
              <span className="animate-float drop-shadow-xl">{s.emoji}</span>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* controls */}
      <button
        onClick={() => go(i - 1)}
        aria-label="Previous slide"
        className="absolute start-3 top-1/2 z-10 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border bg-card/70 backdrop-blur transition-colors hover:bg-accent"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={() => go(i + 1)}
        aria-label="Next slide"
        className="absolute end-3 top-1/2 z-10 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border bg-card/70 backdrop-blur transition-colors hover:bg-accent"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      <div className="absolute inset-x-0 bottom-4 flex justify-center gap-2">
        {slides.map((_, n) => (
          <button
            key={n}
            onClick={() => setI(n)}
            aria-label={`Go to slide ${n + 1}`}
            className={cn(
              "h-2 rounded-full transition-all duration-300",
              n === i ? "w-8 gradient-brand" : "w-2 bg-foreground/20 hover:bg-foreground/40",
            )}
          />
        ))}
      </div>
    </div>
  );
}
