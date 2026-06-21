import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { ThemeToggle, LangSwitcher } from "@/components/brand/Toggles";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/app-context";

const links = [
  { key: "nav.home", to: "/" },
  { key: "nav.courses", to: "/courses" },
  { key: "nav.about", to: "/about" },
  { key: "nav.contact", to: "/contact" },
] as const;

export function PublicNav() {
  const { t } = useApp();
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 glass">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo />
        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <Link key={l.to} to={l.to} activeOptions={{ exact: l.to === "/" }}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground [&.active]:text-foreground"
            >{t(l.key)}</Link>
          ))}
        </nav>
        <div className="hidden items-center gap-1 lg:flex">
          <LangSwitcher />
          <ThemeToggle />
          <Button asChild variant="ghost" className="rounded-xl"><Link to="/login">{t("nav.login")}</Link></Button>
          <Button asChild className="rounded-xl gradient-brand text-white border-0"><Link to="/register">{t("nav.register")}</Link></Button>
        </div>
        <div className="flex items-center gap-1 lg:hidden">
          <ThemeToggle />
          <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => setOpen((o) => !o)}>
            {open ? <X /> : <Menu />}
          </Button>
        </div>
      </div>
      {open && (
        <div className="border-t border-border/60 bg-background/95 px-4 py-3 lg:hidden">
          <nav className="flex flex-col gap-1">
            {links.map((l) => (
              <Link key={l.to} to={l.to} onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-accent">{t(l.key)}</Link>
            ))}
            <div className="mt-2 flex items-center gap-2">
              <LangSwitcher />
              <Button asChild variant="outline" className="flex-1 rounded-xl"><Link to="/login">{t("nav.login")}</Link></Button>
              <Button asChild className="flex-1 rounded-xl gradient-brand text-white border-0"><Link to="/register">{t("nav.register")}</Link></Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
