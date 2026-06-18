import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Mail, Lock, LogIn } from "lucide-react";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { GradientButton } from "@/components/premium/GradientButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROLE_LIST } from "@/lib/roles";
import { cn } from "@/lib/utils";
import { useState } from "react";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Log in — CLASSZ" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState(ROLE_LIST[0]);
  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to continue learning"
      footer={<>Don't have an account? <Link to="/register" className="font-semibold text-primary">Create one</Link></>}
    >
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          navigate({ to: role.home });
        }}
      >
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="email" type="email" defaultValue="student@classz.io" className="ps-9 rounded-xl" />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="password" type="password" defaultValue="password" className="ps-9 rounded-xl" />
          </div>
        </div>

        <div>
          <Label className="mb-2 block">Sign in as (demo)</Label>
          <div className="grid grid-cols-3 gap-2">
            {ROLE_LIST.map((r) => (
              <button
                type="button"
                key={r.key}
                onClick={() => setRole(r)}
                className={cn(
                  "rounded-xl border px-2 py-2 text-xs font-medium transition-colors",
                  role.key === r.key ? "gradient-brand border-transparent text-white" : "bg-card/60 hover:bg-accent",
                )}
              >
                {r.name}
              </button>
            ))}
          </div>
        </div>

        <GradientButton type="submit" size="lg" className="w-full">
          Log in <LogIn className="h-4 w-4" />
        </GradientButton>
      </form>
    </AuthLayout>
  );
}
