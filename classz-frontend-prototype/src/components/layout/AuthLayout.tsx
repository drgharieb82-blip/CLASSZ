import { type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/brand/Logo";
import { ThemeToggle, LangSwitcher } from "@/components/brand/Toggles";
import { GraduationCap, Sparkles, BarChart3, Trophy } from "lucide-react";

const highlights = [
  { icon: GraduationCap, text: "200+ structured courses" },
  { icon: Sparkles, text: "AI study assistant" },
  { icon: BarChart3, text: "Real-time progress tracking" },
  { icon: Trophy, text: "Streaks, XP & leaderboards" },
];

export function AuthLayout({ title, subtitle, children, footer }: { title: string; subtitle: string; children: ReactNode; footer?: ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden gradient-brand p-12 text-white lg:flex">
        <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-white/10 blur-3xl animate-float" />
        <div className="absolute -bottom-24 -left-10 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <Logo className="relative text-white [&_span]:text-white" />
        <div className="relative max-w-md">
          <h2 className="text-4xl font-extrabold leading-tight">Learn Smarter with CLASSZ</h2>
          <p className="mt-4 text-white/80">Join thousands of students and teachers building knowledge with structured courses and AI-powered help.</p>
          <ul className="mt-8 space-y-3">
            {highlights.map((h) => (
              <li key={h.text} className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/15"><h.icon className="h-4 w-4" /></span>
                <span className="font-medium">{h.text}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-sm text-white/60">© 2026 CLASSZ — Premium learning platform</p>
      </div>

      <div className="flex flex-col bg-background/40 backdrop-blur-sm">
        <div className="flex items-center justify-between p-6">
          <Link to="/" className="lg:hidden"><Logo /></Link>
          <div className="ms-auto flex items-center gap-1">
            <LangSwitcher />
            <ThemeToggle />
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center px-6 pb-12">
          <div className="w-full max-w-sm">
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>
            <div className="mt-8">{children}</div>
            {footer && <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
