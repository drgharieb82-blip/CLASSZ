import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, CheckCircle2, Mail, Phone, Send } from "lucide-react";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { GradientButton } from "@/components/premium/GradientButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { forgotPasswordApi } from "@/lib/api/auth";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Reset Password — CLASSZ" }] }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) return;
    setLoading(true);
    try {
      await forgotPasswordApi(identifier.trim());
    } catch {
      // Deliberately swallowed — the response never reveals whether the
      // account exists, so a network hiccup shows the same neutral state.
    } finally {
      setLoading(false);
      setSent(true);
    }
  };

  if (sent) {
    return (
      <AuthLayout
        title="Check your inbox"
        subtitle="Reset instructions sent"
        footer={
          <Link to="/login" className="font-semibold text-primary">
            Back to Login
          </Link>
        }
      >
        <div className="flex flex-col items-center gap-4 py-4 text-center">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          </div>
          <p className="text-sm text-muted-foreground">
            If this account exists, reset instructions will be sent to your email or phone number.
          </p>
          <p className="text-xs text-muted-foreground">
            Didn't receive anything? Check your spam folder or try again in a few minutes.
          </p>
          <GradientButton asChild variant="outline" className="mt-2">
            <Link to="/login">
              <ArrowLeft className="h-4 w-4" /> Back to Login
            </Link>
          </GradientButton>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your email or phone number"
      footer={
        <>
          Remember your password?{" "}
          <Link to="/login" className="font-semibold text-primary">
            Log in
          </Link>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-1.5">
          <Label htmlFor="identifier">Email or phone number</Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="identifier"
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="you@email.com or +20 100 000 0000"
              className="ps-9 rounded-xl"
              required
            />
          </div>
          <p className="text-xs text-muted-foreground">
            We'll send password reset instructions to this address.
          </p>
        </div>

        <GradientButton
          type="submit"
          size="lg"
          className="w-full"
          disabled={loading || !identifier.trim()}
        >
          {loading ? "Sending…" : <><Send className="h-4 w-4" /> Send Reset Instructions</>}
        </GradientButton>

        <div className="text-center">
          <Link to="/login" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Login
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
