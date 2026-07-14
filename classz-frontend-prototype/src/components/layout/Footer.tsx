import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/brand/Logo";
import { Github, Twitter, Linkedin, Youtube } from "lucide-react";

const cols = [
  { title: "Product", links: [["Courses", "/courses"], ["AI Assistant", "/assistant"], ["Leaderboard", "/student/leaderboard"], ["Wallet", "/student/wallet"]] },
  { title: "Company", links: [["About", "/about"], ["Contact", "/contact"], ["Teachers", "/teacher"], ["Parents", "/parent"]] },
  { title: "Roles", links: [["Student", "/student"], ["Teacher", "/teacher"], ["Admin", "/admin"], ["Finance", "/finance"]] },
] as const;

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-card/40">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.5fr_repeat(3,1fr)]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              Learn smarter with CLASSZ — premium courses, gamified progress, and an AI study assistant for students, teachers and parents.
            </p>
            <div className="mt-4 flex gap-2">
              {[Twitter, Github, Linkedin, Youtube].map((Icon, i) => (
                <a key={i} href="#" className="grid h-9 w-9 place-items-center rounded-lg border bg-background text-muted-foreground transition-colors hover:text-foreground">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
          {cols.map((c) => (
            <div key={c.title}>
              <h4 className="font-semibold">{c.title}</h4>
              <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
                {c.links.map(([label, to]) => (
                  <li key={label}><Link to={to} className="transition-colors hover:text-foreground">{label}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border/60 pt-6 text-sm text-muted-foreground sm:flex-row">
          <p>© 2026 CLASSZ. All rights reserved.</p>
          <p>Made with 💜 for learners everywhere.</p>
        </div>
      </div>
    </footer>
  );
}
