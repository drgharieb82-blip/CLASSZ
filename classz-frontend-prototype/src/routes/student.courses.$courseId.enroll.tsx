import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft, CheckCircle2, CreditCard, Loader2, Wallet, BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getCourseDetails } from "@/lib/courseDetailsMock";
import { useWalletStore } from "@/lib/stores/wallet-store";
import { useEnrollmentStore } from "@/lib/stores/enrollment-store";

export const Route = createFileRoute("/student/courses/$courseId/enroll")({
  component: EnrollPage,
});

type PaymentMethod = "wallet" | "card" | "fawry" | "vodafone";

function EnrollPage() {
  const { courseId } = Route.useParams();
  const navigate = useNavigate();
  const course = getCourseDetails(courseId);
  const walletBalance = useWalletStore((s) => s.balance);
  const deduct = useWalletStore((s) => s.deduct);
  const enroll = useEnrollmentStore((s) => s.enroll);
  const isEnrolled = useEnrollmentStore((s) => s.isEnrolled(courseId));

  const [method, setMethod] = useState<PaymentMethod>("wallet");
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(isEnrolled);

  if (!course) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Course not found.</p>
      </div>
    );
  }

  const canPayWithWallet = walletBalance >= course.price;

  const handlePay = async () => {
    setProcessing(true);
    await new Promise((r) => setTimeout(r, 1500));

    if (method === "wallet") {
      const ok = deduct(course.price, `Enrolled in: ${course.title}`);
      if (!ok) {
        setProcessing(false);
        return;
      }
    }

    enroll(courseId);
    setSuccess(true);
    setProcessing(false);
  };

  if (success) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background p-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
          <CheckCircle2 className="h-10 w-10 text-emerald-600" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold">Enrollment Successful!</h1>
          <p className="mt-2 text-muted-foreground">You are now enrolled in <strong>{course.title}</strong></p>
        </div>
        <div className="flex gap-3">
          <Button asChild variant="outline" className="rounded-xl">
            <Link to="/student/courses">My Courses</Link>
          </Button>
          <Button asChild className="rounded-xl gradient-brand border-0 text-white">
            <Link to="/student/courses/$courseId/session" params={{ courseId }}>
              <BookOpen className="me-1.5 h-4 w-4" /> Start Learning
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <Link
          to="/courses/$courseId"
          params={{ courseId }}
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to course
        </Link>

        <h1 className="text-2xl font-bold">Complete Enrollment</h1>
        <p className="mt-1 text-muted-foreground">Choose your payment method to enroll in this course.</p>

        {/* Course Summary */}
        <Card className="mt-6 flex items-center gap-4 border bg-card p-4">
          <div className={cn("grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-2xl", course.color)}>
            {course.emoji}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold">{course.title}</p>
            <p className="text-sm text-muted-foreground">{course.teacher} · {course.lessons} lessons</p>
          </div>
          <p className="text-xl font-bold">${course.price}</p>
        </Card>

        {/* Payment Methods */}
        <div className="mt-8 space-y-3">
          <h2 className="font-semibold">Payment Method</h2>

          <PaymentOption
            selected={method === "wallet"}
            onClick={() => setMethod("wallet")}
            icon={Wallet}
            label="Wallet Balance"
            detail={`Available: $${walletBalance.toFixed(2)}`}
            disabled={!canPayWithWallet}
            warning={!canPayWithWallet ? "Insufficient balance" : undefined}
          />
          <PaymentOption
            selected={method === "card"}
            onClick={() => setMethod("card")}
            icon={CreditCard}
            label="Credit / Debit Card"
            detail="Visa, Mastercard"
          />
          <PaymentOption
            selected={method === "fawry"}
            onClick={() => setMethod("fawry")}
            icon={CreditCard}
            label="Fawry"
            detail="Pay at any Fawry outlet"
          />
          <PaymentOption
            selected={method === "vodafone"}
            onClick={() => setMethod("vodafone")}
            icon={CreditCard}
            label="Vodafone Cash"
            detail="Mobile wallet payment"
          />
        </div>

        {/* Wallet upsell */}
        {method === "wallet" && !canPayWithWallet && (
          <Card className="mt-4 border-warning/30 bg-warning/5 p-4">
            <p className="text-sm">
              Your wallet balance is <strong>${walletBalance.toFixed(2)}</strong>. You need <strong>${(course.price - walletBalance).toFixed(2)}</strong> more.
            </p>
            <Button asChild variant="outline" size="sm" className="mt-3 rounded-xl">
              <Link to="/student/wallet">Recharge Wallet</Link>
            </Button>
          </Card>
        )}

        {/* Revenue breakdown (transparent) */}
        <Card className="mt-8 space-y-2 border bg-card p-4">
          <h3 className="text-sm font-semibold text-muted-foreground">Payment Breakdown</h3>
          <div className="flex justify-between text-sm">
            <span>Course price</span><span>${course.price.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Platform fee</span><span>${(course.price * 0.15).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Teacher receives</span><span>${(course.price * 0.85).toFixed(2)}</span>
          </div>
          <div className="border-t pt-2 flex justify-between font-semibold">
            <span>Total</span><span>${course.price.toFixed(2)}</span>
          </div>
        </Card>

        <Button
          onClick={handlePay}
          disabled={processing || (method === "wallet" && !canPayWithWallet)}
          className="mt-6 w-full rounded-xl gradient-brand border-0 text-white"
          size="lg"
        >
          {processing ? (
            <><Loader2 className="me-2 h-4 w-4 animate-spin" /> Processing…</>
          ) : (
            <>Pay ${course.price} & Enroll</>
          )}
        </Button>
      </div>
    </div>
  );
}

function PaymentOption({
  selected, onClick, icon: Icon, label, detail, disabled, warning,
}: {
  selected: boolean;
  onClick: () => void;
  icon: React.ElementType;
  label: string;
  detail: string;
  disabled?: boolean;
  warning?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled && !selected}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl border p-4 text-start transition-colors",
        selected ? "border-primary bg-primary/5" : "bg-card hover:bg-accent",
        disabled && "opacity-60",
      )}
    >
      <div className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-lg", selected ? "bg-primary/10 text-primary" : "bg-muted")}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{detail}</p>
        {warning && <Badge variant="outline" className="mt-1 text-xs text-warning border-warning/30">{warning}</Badge>}
      </div>
      <div className={cn("h-5 w-5 rounded-full border-2", selected ? "border-primary bg-primary" : "border-muted-foreground/30")}>
        {selected && <div className="m-auto mt-[3px] h-2.5 w-2.5 rounded-full bg-white" />}
      </div>
    </button>
  );
}
