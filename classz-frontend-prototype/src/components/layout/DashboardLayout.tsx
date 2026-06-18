import { type ReactNode, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, Search, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/brand/Logo";
import { ThemeToggle, LangSwitcher } from "@/components/brand/Toggles";
import { UserMenu } from "@/components/layout/UserMenu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ROLES, type Role } from "@/lib/roles";

function SidebarContent({ role, onNav }: { role: Role; onNav?: () => void }) {
  const cfg = ROLES[role];
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 shrink-0 items-center px-5">
        <Logo to={cfg.home} />
      </div>
      <div className="mx-3 mb-3 flex items-center gap-2 rounded-xl border bg-card/60 p-2.5">
        <span className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br text-white", cfg.color)}>
          <cfg.icon className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{cfg.name}</p>
          <p className="truncate text-xs text-muted-foreground">{cfg.tagline}</p>
        </div>
      </div>
      <nav className="flex-1 space-y-5 overflow-y-auto px-3 pb-6">
        {cfg.nav.map((group) => (
          <div key={group.group}>
            <p className="px-3 pb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{group.group}</p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = pathname === item.to;
                return (
                  <Link key={item.to} to={item.to} onClick={onNav}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                      active ? "gradient-brand text-white shadow-md" : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    )}>
                    {active && (
                      <span className="absolute inset-y-1.5 -start-3 w-1 rounded-full bg-white/80" />
                    )}
                    <item.icon className={cn("h-[18px] w-[18px] shrink-0 transition-transform", !active && "group-hover:scale-110")} />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </div>
  );
}

export function DashboardLayout({ role, children }: { role: Role; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen w-full">
      <aside className="fixed inset-y-0 z-40 hidden w-64 border-e border-border bg-sidebar lg:block">
        <SidebarContent role={role} />
      </aside>

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={() => setOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
              className="absolute inset-y-0 start-0 w-72 border-e border-border bg-sidebar shadow-2xl rtl:[transform-origin:right]"
            >
              <Button variant="ghost" size="icon" className="absolute end-2 top-3 z-10" onClick={() => setOpen(false)}><X /></Button>
              <SidebarContent role={role} onNav={() => setOpen(false)} />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      <div className="lg:ps-64">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border glass px-4 sm:px-6">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen(true)}><Menu /></Button>
          <div className="relative hidden max-w-md flex-1 sm:block">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search courses, lessons, students…" className="ps-9 rounded-xl bg-card" />
          </div>
          <div className="ms-auto flex items-center gap-1">
            <LangSwitcher />
            <ThemeToggle />
            <Button asChild variant="ghost" size="icon" className="relative rounded-xl">
              <Link to="/student/notifications">
                <Bell className="h-5 w-5" />
                <span className="absolute end-2 top-2 h-2 w-2 rounded-full bg-destructive" />
              </Link>
            </Button>
            <UserMenu role={role} />
          </div>
        </header>
        <main className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
