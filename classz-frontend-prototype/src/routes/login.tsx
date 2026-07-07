import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Mail, Lock, LogIn, Loader2 } from "lucide-react";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { GradientButton } from "@/components/premium/GradientButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROLES } from "@/lib/roles";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useVisualModeStore } from "@/lib/stores/visual-mode-store";
import { loginApi } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { useState } from "react";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Log in — CLASSZ" }] }),
  validateSearch: (search: Record<string, unknown>) => ({
    returnUrl: (search.returnUrl as string) || "",
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { returnUrl } = Route.useSearch();
  const login = useAuthStore((s) => s.login);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await loginApi(email, password);
      login(res.access_token, res.user);
      const destination = returnUrl || ROLES[res.user.role]?.home || "/";
      navigate({ to: destination });
    } catch (err) {
      if (err instanceof ApiError) {
        const detail =
          typeof err.body === "object" &&
          err.body !== null &&
          "detail" in err.body
            ? (err.body as { detail: string }).detail
            : "Invalid email or password";
        setError(detail);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to continue learning"
      footer={
        <>
          Don't have an account?{" "}
          <Link to="/register" className="font-semibold text-primary">
            Create one
          </Link>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              className="ps-9 rounded-xl"
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link to="/forgot-password" className="text-xs text-primary hover:underline">Forgot password?</Link>
          </div>
          <div className="relative">
            <Lock className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              className="ps-9 rounded-xl"
              required
            />
          </div>
        </div>

        {error && (
          <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        <GradientButton
          type="submit"
          size="lg"
          className="w-full"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Signing in…
            </>
          ) : (
            <>
              Log in <LogIn className="h-4 w-4" />
            </>
          )}
        </GradientButton>
      </form>

      {import.meta.env.DEV && <DevQuickAccess />}
    </AuthLayout>
  );
}

// Dev Quick Access signs in with the real seeded launch accounts via the real
// /api/auth/login endpoint - no fake tokens, no fake user.id assignments.
// There is no seeded "parent" launch account (only admin/teacher/student were
// seeded, per the launch database reset), so no parent button is offered here.
const QUICK_ACCESS_ACCOUNTS = [
  { label: "Student", role: "student" as const, age: 16, email: "student@classz-launch.dev", password: "LaunchStudent123!" },
  { label: "Teacher", role: "teacher" as const, age: 35, email: "teacher@classz-launch.dev", password: "LaunchTeacher123!" },
  { label: "Admin", role: "admin" as const, age: 30, email: "admin@classz-launch.dev", password: "LaunchAdmin123!" },
] as const;

function DevQuickAccess() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const setAge = useVisualModeStore((s) => s.setAge);
  const [loadingRole, setLoadingRole] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handleQuickLogin = async (account: (typeof QUICK_ACCESS_ACCOUNTS)[number]) => {
    setError("");
    setLoadingRole(account.role);
    try {
      const res = await loginApi(account.email, account.password);
      login(res.access_token, res.user);
      setAge(account.age);
      navigate({ to: ROLES[res.user.role]?.home || "/" });
    } catch (err) {
      setError(
        err instanceof ApiError && typeof err.body === "object" && err.body !== null && "detail" in err.body
          ? String((err.body as { detail: string }).detail)
          : "Dev Quick Access failed - is the backend running?",
      );
    } finally {
      setLoadingRole(null);
    }
  };

  return (
    <div className="mt-6 rounded-xl border border-dashed border-amber-500/40 bg-amber-500/5 p-4">
      <p className="mb-1 text-center text-xs font-semibold uppercase tracking-wide text-amber-600">Dev Quick Access</p>
      <p className="mb-3 text-center text-[11px] text-muted-foreground">Signs in with the real seeded launch accounts.</p>
      {error && (
        <p className="mb-3 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">{error}</p>
      )}
      <div className="grid grid-cols-2 gap-2">
        {QUICK_ACCESS_ACCOUNTS.map((account) => (
          <button
            key={account.role}
            onClick={() => handleQuickLogin(account)}
            disabled={loadingRole !== null}
            className="rounded-lg border bg-card px-3 py-2 text-center text-xs font-medium transition-colors hover:bg-accent disabled:opacity-50"
          >
            {loadingRole === account.role ? "Signing in…" : account.label}
          </button>
        ))}
        <Link
          to="/courses"
          className="col-span-2 rounded-lg border bg-card px-3 py-2 text-center text-xs font-medium transition-colors hover:bg-accent"
        >
          Courses Store (Public)
        </Link>
      </div>
    </div>
  );
}
