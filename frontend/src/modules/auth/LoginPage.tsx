import { FormEvent, useState } from "react";
import { ArrowRight, LockKeyhole, LogIn, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Card } from "../../components/ui/Card";
import { LanguageSwitcher } from "../../components/LanguageSwitcher";
import { useThemeStore } from "../../store/themeStore";
import { authService, mockUsers } from "./authService";
import { getDashboardPathForRole } from "./getDashboardPathForRole";

const password = "classz123";

function formatRole(role: string) {
  return role.replace("_", " ");
}

export function LoginPage() {
  const navigate = useNavigate();
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const [email, setEmail] = useState("admin@classz.test");
  const [passwordValue, setPasswordValue] = useState(password);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    try {
      const user = authService.login(email, passwordValue);
      navigate(getDashboardPathForRole(user.role), { replace: true });
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Unable to sign in.");
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950 transition-colors dark:bg-slate-950 dark:text-slate-50">
      <div className="surface-grid fixed inset-0 opacity-70" aria-hidden="true" />
      <section className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 text-sm font-bold text-white shadow-sm dark:bg-white dark:text-slate-950">
              CZ
            </div>
            <div>
              <p className="font-display text-2xl leading-none">CLASSZ</p>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                Role-aware access
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <button type="button" onClick={toggleTheme} className="ui-button">
              {theme === "dark" ? "Light" : "Dark"}
            </button>
          </div>
        </header>

        <div className="grid items-stretch gap-6 lg:grid-cols-[0.92fr_1.08fr]">
          <Card className="flex flex-col justify-between overflow-hidden p-6 sm:p-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-teal-600 dark:text-teal-300">
                Phase 4F
              </p>
              <h1 className="mt-3 font-display text-3xl font-semibold leading-tight sm:text-4xl">
                Sign in to the right CLASSZ workspace.
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                This mock login keeps everything local and redirects each sample account to its role dashboard.
              </p>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {mockUsers.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => {
                    setEmail(user.email);
                    setPasswordValue(password);
                    setError(null);
                  }}
                  className="rounded-xl border border-slate-200 bg-white/78 p-4 text-start shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-teal-500/35 hover:bg-white dark:border-white/10 dark:bg-white/[0.06] dark:hover:border-teal-300/35 dark:hover:bg-white/[0.1]"
                >
                  <span className="block text-sm font-bold text-slate-950 dark:text-white">{user.name}</span>
                  <span className="mt-1 block text-xs font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">
                    {formatRole(user.role)}
                  </span>
                  <span className="mt-2 block break-all text-sm text-teal-700 dark:text-teal-200">{user.email}</span>
                </button>
              ))}
            </div>
          </Card>

          <Card className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                  Mock account
                </p>
                <h2 className="mt-2 font-display text-2xl font-semibold leading-tight">Login</h2>
              </div>

              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
                  <Mail className="h-4 w-4 text-slate-500 dark:text-slate-400" aria-hidden="true" />
                  Email
                </span>
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  type="email"
                  autoComplete="email"
                  className="ui-input w-full"
                  placeholder="admin@classz.test"
                  required
                />
              </label>

              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
                  <LockKeyhole className="h-4 w-4 text-slate-500 dark:text-slate-400" aria-hidden="true" />
                  Password
                </span>
                <input
                  value={passwordValue}
                  onChange={(event) => setPasswordValue(event.target.value)}
                  type="password"
                  autoComplete="current-password"
                  className="ui-input w-full"
                  placeholder={password}
                  required
                />
              </label>

              {error ? (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 dark:border-rose-300/20 dark:bg-rose-400/10 dark:text-rose-200">
                  {error}
                </div>
              ) : null}

              <button type="submit" className="ui-button ui-button-primary w-full">
                <LogIn className="h-4 w-4" aria-hidden="true" />
                Sign in
                <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
              </button>

              <p className="text-center text-xs font-semibold text-slate-500 dark:text-slate-400">
                Password for every sample account: <span className="text-slate-900 dark:text-white">{password}</span>
              </p>
            </form>
          </Card>
        </div>
      </section>
    </main>
  );
}
