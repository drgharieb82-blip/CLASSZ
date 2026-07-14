import { BookOpen, GraduationCap, LayoutDashboard, Moon, Search, Sun, Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import { NavLink, Outlet } from "react-router-dom";

import { LanguageSwitcher } from "./LanguageSwitcher";
import { useThemeStore } from "../store/themeStore";

type ShellProps = {
  title: string;
  roleLabel: string;
  accent: string;
  navItems?: Array<{
    labelKey: string;
    href: string;
    icon: typeof LayoutDashboard;
  }>;
};

const defaultNavItems = [
  { labelKey: "nav.dashboard", href: "/", icon: LayoutDashboard },
  { labelKey: "nav.courses", href: "/courses", icon: BookOpen },
  { labelKey: "nav.people", href: "/people", icon: Users },
  { labelKey: "nav.learning", href: "/learning", icon: GraduationCap },
];

export function Shell({ title, roleLabel, accent, navItems = defaultNavItems }: ShellProps) {
  const { t } = useTranslation();
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const ThemeIcon = theme === "dark" ? Sun : Moon;
  const resolvedTitle = title.startsWith("i18n:") ? t(title.slice(5)) : title;
  const resolvedRoleLabel = roleLabel.startsWith("i18n:") ? t(roleLabel.slice(5)) : roleLabel;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 transition-colors dark:bg-slate-950 dark:text-slate-50">
      <div className="surface-grid fixed inset-0 opacity-70" aria-hidden="true" />
      <div className="relative flex min-h-screen">
        <aside className="hidden w-72 border-r border-slate-200/80 bg-white/82 px-5 py-6 shadow-[8px_0_40px_rgba(15,23,42,0.04)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/82 lg:block">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 text-white shadow-sm dark:bg-white dark:text-slate-950">
              CZ
            </div>
            <div>
              <p className="font-display text-2xl leading-none">{t("app.brand")}</p>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                {t("app.subtitle")}
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
                    "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold transition duration-200",
                    isActive
                      ? "bg-slate-950 text-white shadow-sm dark:bg-white dark:text-slate-950"
                      : "text-slate-600 hover:bg-slate-900/5 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/8 dark:hover:text-white",
                  ].join(" ")
                }
              >
                <item.icon className="h-4 w-4" aria-hidden="true" />
                {t(item.labelKey)}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-10 border-b border-slate-200/80 bg-white/78 px-4 py-4 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/78 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                  {resolvedRoleLabel}
                </p>
                <h1 className="font-display text-3xl leading-tight sm:text-4xl">{resolvedTitle}</h1>
              </div>

              <div className="flex items-center gap-2">
                <div className="hidden min-h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-3 py-2 shadow-sm dark:border-white/10 dark:bg-white/8 md:flex">
                  <Search className="h-4 w-4 text-slate-500 dark:text-slate-400" aria-hidden="true" />
                  <span className="text-sm text-slate-500 dark:text-slate-400">{t("app.searchWorkspace")}</span>
                </div>
                <LanguageSwitcher />
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white/80 text-slate-950 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-teal-500/35 hover:bg-white dark:border-white/10 dark:bg-white/8 dark:text-white dark:hover:border-teal-300/35 dark:hover:bg-white/12"
                  aria-label={t("app.toggleTheme")}
                >
                  <ThemeIcon className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            </div>
          </header>

          <section className="px-4 py-6 sm:px-6 lg:px-8">
            <div
              className="mx-auto mb-6 h-1.5 w-full max-w-[1440px] rounded-full"
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
