import { BookOpen, GraduationCap, LayoutDashboard, Moon, Search, Sun, Users } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";

import { useThemeStore } from "../store/themeStore";

type ShellProps = {
  title: string;
  roleLabel: string;
  accent: string;
};

const navItems = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Courses", href: "/courses", icon: BookOpen },
  { label: "People", href: "/people", icon: Users },
  { label: "Learning", href: "/learning", icon: GraduationCap },
];

export function Shell({ title, roleLabel, accent }: ShellProps) {
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const ThemeIcon = theme === "dark" ? Sun : Moon;

  return (
    <div className="min-h-screen bg-ink-50 text-ink-950 transition-colors dark:bg-ink-950 dark:text-ink-50">
      <div className="surface-grid fixed inset-0 opacity-80" aria-hidden="true" />
      <div className="relative flex min-h-screen">
        <aside className="hidden w-72 border-r border-ink-950/10 bg-chalk/86 px-5 py-6 backdrop-blur-xl dark:border-white/10 dark:bg-ink-950/82 lg:block">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-md bg-ink-950 text-chalk dark:bg-chalk dark:text-ink-950">
              CZ
            </div>
            <div>
              <p className="font-display text-2xl leading-none">CLASSZ</p>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-600 dark:text-ink-300">
                Education OS
              </p>
            </div>
          </div>

          <nav className="mt-10 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) =>
                  [
                    "flex items-center gap-3 rounded-md px-3 py-3 text-sm font-bold transition",
                    isActive
                      ? "bg-ink-950 text-chalk dark:bg-chalk dark:text-ink-950"
                      : "text-ink-700 hover:bg-ink-950/6 dark:text-ink-100 dark:hover:bg-white/8",
                  ].join(" ")
                }
              >
                <item.icon className="h-4 w-4" aria-hidden="true" />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-10 border-b border-ink-950/10 bg-chalk/80 px-4 py-4 backdrop-blur-xl dark:border-white/10 dark:bg-ink-950/78 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-ink-600 dark:text-ink-300">
                  {roleLabel}
                </p>
                <h1 className="font-display text-3xl leading-tight sm:text-4xl">{title}</h1>
              </div>

              <div className="flex items-center gap-2">
                <div className="hidden items-center gap-2 rounded-md border border-ink-950/10 bg-white/70 px-3 py-2 dark:border-white/10 dark:bg-white/6 md:flex">
                  <Search className="h-4 w-4 text-ink-600 dark:text-ink-300" aria-hidden="true" />
                  <span className="text-sm text-ink-600 dark:text-ink-300">Search workspace</span>
                </div>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-ink-950/10 bg-white/76 text-ink-950 transition hover:bg-white dark:border-white/10 dark:bg-white/8 dark:text-chalk dark:hover:bg-white/12"
                  aria-label="Toggle theme"
                >
                  <ThemeIcon className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            </div>
          </header>

          <section className="px-4 py-6 sm:px-6 lg:px-8">
            <div
              className="mb-6 h-1.5 w-full rounded-full"
              style={{ background: accent }}
              aria-hidden="true"
            />
            <Outlet />
          </section>
        </main>
      </div>
    </div>
  );
}
