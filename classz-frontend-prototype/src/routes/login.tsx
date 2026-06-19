import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Mail, Lock, LogIn, Loader2 } from "lucide-react";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { GradientButton } from "@/components/premium/GradientButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROLES } from "@/lib/roles";
import { useAuthStore } from "@/lib/stores/auth-store";
import { loginApi } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { useState } from "react";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Log in — CLASSZ" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
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
      const home = ROLES[res.user.role]?.home ?? "/";
      navigate({ to: home });
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
          <Label htmlFor="password">Password</Label>
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
    </AuthLayout>
  );
}
