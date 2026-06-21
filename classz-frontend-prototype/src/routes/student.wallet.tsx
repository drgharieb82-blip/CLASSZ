import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowDownLeft, ArrowUpRight, CreditCard, Loader2, Plus, Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { WalletCharacter } from "@/components/illustrations/Characters";
import { useWalletStore } from "@/lib/stores/wallet-store";
import type { Transaction } from "@/lib/stores/wallet-store";

export const Route = createFileRoute("/student/wallet")({
  component: WalletPage,
});

const rechargeAmounts = [10, 25, 50, 100];
const rechargeMethods = [
  { id: "card", label: "Credit / Debit Card", icon: CreditCard },
  { id: "fawry", label: "Fawry", icon: CreditCard },
  { id: "vodafone", label: "Vodafone Cash", icon: CreditCard },
];

function WalletPage() {
  const balance = useWalletStore((s) => s.balance);
  const transactions = useWalletStore((s) => s.transactions);
  const recharge = useWalletStore((s) => s.recharge);

  const [amount, setAmount] = useState(25);
  const [customAmount, setCustomAmount] = useState("");
  const [method, setMethod] = useState("card");
  const [loading, setLoading] = useState(false);
  const [showRecharge, setShowRecharge] = useState(false);

  const handleRecharge = async () => {
    const finalAmount = customAmount ? Number(customAmount) : amount;
    if (finalAmount <= 0) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    recharge(finalAmount, rechargeMethods.find((m) => m.id === method)?.label ?? method);
    setLoading(false);
    setShowRecharge(false);
    setCustomAmount("");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <h1 className="text-2xl font-bold">My Wallet</h1>
        <p className="mt-1 text-muted-foreground">Manage your CLASSZ balance and payment history.</p>

        {/* Balance Card */}
        <Card className="mt-6 overflow-hidden border-0 bg-gradient-to-br from-violet-600 to-blue-500 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/80">Available Balance</p>
              <p className="mt-1 text-4xl font-bold">${balance.toFixed(2)}</p>
            </div>
            <Wallet className="h-12 w-12 text-white/30" />
          </div>
          <Button
            onClick={() => setShowRecharge(true)}
            className="mt-5 rounded-xl border-white/30 bg-white/20 text-white hover:bg-white/30"
            size="sm"
          >
            <Plus className="me-1.5 h-4 w-4" /> Recharge
          </Button>
        </Card>

        {/* Recharge Form */}
        {showRecharge && (
          <Card className="mt-6 border bg-card p-6">
            <h2 className="font-semibold">Recharge Wallet</h2>

            <div className="mt-4">
              <p className="text-sm text-muted-foreground mb-2">Select amount</p>
              <div className="flex flex-wrap gap-2">
                {rechargeAmounts.map((a) => (
                  <button
                    key={a}
                    onClick={() => { setAmount(a); setCustomAmount(""); }}
                    className={cn(
                      "rounded-xl border px-5 py-2 text-sm font-medium transition-colors",
                      amount === a && !customAmount ? "border-primary bg-primary/10 text-primary" : "bg-card hover:bg-accent",
                    )}
                  >
                    ${a}
                  </button>
                ))}
              </div>
              <div className="mt-3">
                <Input
                  type="number"
                  min={1}
                  placeholder="Custom amount"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="max-w-[180px] rounded-xl"
                />
              </div>
            </div>

            <div className="mt-5">
              <p className="text-sm text-muted-foreground mb-2">Payment method</p>
              <div className="space-y-2">
                {rechargeMethods.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setMethod(m.id)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl border p-3 text-start transition-colors",
                      method === m.id ? "border-primary bg-primary/5" : "bg-card hover:bg-accent",
                    )}
                  >
                    <m.icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 flex gap-3">
              <Button
                onClick={handleRecharge}
                disabled={loading}
                className="rounded-xl gradient-brand border-0 text-white"
              >
                {loading ? <><Loader2 className="me-2 h-4 w-4 animate-spin" /> Processing…</> : <>Recharge ${customAmount || amount}</>}
              </Button>
              <Button variant="ghost" onClick={() => setShowRecharge(false)} className="rounded-xl">Cancel</Button>
            </div>
          </Card>
        )}

        {/* Transactions */}
        <div className="mt-8">
          <h2 className="font-semibold">Transaction History</h2>
          {transactions.length === 0 ? (
            <Card className="mt-4 flex flex-col items-center gap-3 border bg-card p-8 text-center">
              <WalletCharacter size="md" />
              <Wallet className="h-10 w-10 text-muted-foreground" />
              <p className="text-muted-foreground">No transactions yet. Recharge your wallet to get started.</p>
            </Card>
          ) : (
            <div className="mt-4 space-y-2">
              {transactions.map((tx) => (
                <TransactionRow key={tx.id} tx={tx} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TransactionRow({ tx }: { tx: Transaction }) {
  const isCredit = tx.type === "recharge";
  return (
    <div className="flex items-center gap-3 rounded-xl border bg-card px-4 py-3">
      <div className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-lg", isCredit ? "bg-emerald-500/10" : "bg-rose-500/10")}>
        {isCredit ? <ArrowDownLeft className="h-4 w-4 text-emerald-600" /> : <ArrowUpRight className="h-4 w-4 text-rose-600" />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium truncate">{tx.description}</p>
        <p className="text-xs text-muted-foreground">{new Date(tx.date).toLocaleDateString()}</p>
      </div>
      <Badge variant="outline" className={cn("rounded-full", isCredit ? "text-emerald-600 border-emerald-200" : "text-rose-600 border-rose-200")}>
        {isCredit ? "+" : ""}{tx.amount < 0 ? `-$${Math.abs(tx.amount).toFixed(2)}` : `+$${tx.amount.toFixed(2)}`}
      </Badge>
    </div>
  );
}
