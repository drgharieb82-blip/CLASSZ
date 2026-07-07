import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Send, Check, X } from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { useApp } from "@/lib/app-context";
import { cn } from "@/lib/utils";
import { ROLES } from "@/lib/roles";
import { publishRequests, type PublishRequest } from "@/lib/content-manager-mock-data";

export const Route = createFileRoute("/content/publishing-queue")({
  component: PublishingQueuePage,
});

const pubTypeBadge: Record<string, { cls: string }> = {
  lesson: { cls: "bg-blue-500/10 text-blue-600 border-blue-300" },
  quiz: { cls: "bg-amber-500/10 text-amber-600 border-amber-300" },
  course: { cls: "bg-violet-500/10 text-violet-600 border-violet-300" },
  "question-bank": { cls: "bg-emerald-500/10 text-emerald-600 border-emerald-300" },
};

const pubStatusBadge: Record<string, { cls: string }> = {
  pending: { cls: "bg-amber-500/10 text-amber-600 border-amber-300" },
  approved: { cls: "bg-blue-500/10 text-blue-600 border-blue-300" },
  rejected: { cls: "bg-rose-500/10 text-rose-600 border-rose-300" },
  published: { cls: "bg-emerald-500/10 text-emerald-600 border-emerald-300" },
};

function PublishingQueuePage() {
  const { t } = useApp();
  const [requests, setRequests] = useState<PublishRequest[]>(publishRequests);
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [confirmAction, setConfirmAction] = useState<{ id: string; action: "approve" | "reject" } | null>(null);

  const filtered = requests.filter((r) => {
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    if (typeFilter !== "all" && r.type !== typeFilter) return false;
    return true;
  });

  function handleConfirm() {
    if (!confirmAction) return;
    const { id, action } = confirmAction;
    setRequests((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, status: (action === "approve" ? "approved" : "rejected") as PublishRequest["status"], reviewedBy: "You" }
          : r,
      ),
    );
    setConfirmAction(null);
  }

  return (
    <DashPage role="content" title="cm.publishingQueue" subtitle="cm.publishingQueueSubtitle" icon={Send}>
      {/* ── Filters ── */}
      <Card className="border bg-card p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[170px]">
              <SelectValue placeholder={t("cm.status")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("cm.allStatuses")}</SelectItem>
              <SelectItem value="pending">{t("cm.pending")}</SelectItem>
              <SelectItem value="approved">{t("cm.approved")}</SelectItem>
              <SelectItem value="rejected">{t("cm.rejected")}</SelectItem>
              <SelectItem value="published">{t("cm.published")}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-[170px]">
              <SelectValue placeholder={t("cm.type")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("cm.allTypes")}</SelectItem>
              <SelectItem value="lesson">{t("cm.lesson")}</SelectItem>
              <SelectItem value="quiz">{t("cm.quiz")}</SelectItem>
              <SelectItem value="course">{t("cm.course")}</SelectItem>
              <SelectItem value="question-bank">{t("cm.questionBank")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* ── Table ── */}
      <Card className="border bg-card p-5">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-start text-xs uppercase tracking-wider text-muted-foreground">
                <th className="py-2 pe-4 text-start font-medium">{t("cm.title")}</th>
                <th className="py-2 pe-4 text-start font-medium">{t("cm.type")}</th>
                <th className="py-2 pe-4 text-start font-medium">{t("cm.submittedBy")}</th>
                <th className="py-2 pe-4 text-start font-medium">{t("cm.academy")}</th>
                <th className="py-2 pe-4 text-start font-medium">{t("cm.status")}</th>
                <th className="py-2 pe-4 text-start font-medium">{t("cm.date")}</th>
                <th className="py-2 pe-4 text-start font-medium">{t("cm.reviewedBy")}</th>
                <th className="py-2 text-start font-medium">{t("cm.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-b border-border/50 transition-colors hover:bg-accent/40">
                  <td className="py-2.5 pe-4 font-medium max-w-[220px] truncate">{r.title}</td>
                  <td className="py-2.5 pe-4">
                    <Badge variant="outline" className={cn("text-xs rounded-full capitalize", pubTypeBadge[r.type]?.cls)}>{r.type}</Badge>
                  </td>
                  <td className="py-2.5 pe-4 text-muted-foreground">{r.submittedBy}</td>
                  <td className="py-2.5 pe-4 text-muted-foreground">{r.academy}</td>
                  <td className="py-2.5 pe-4">
                    <Badge variant="outline" className={cn("text-xs rounded-full capitalize", pubStatusBadge[r.status]?.cls)}>{r.status}</Badge>
                  </td>
                  <td className="py-2.5 pe-4 text-muted-foreground text-xs">{r.submittedAt}</td>
                  <td className="py-2.5 pe-4 text-muted-foreground">{r.reviewedBy}</td>
                  <td className="py-2.5">
                    {r.status === "pending" && (
                      <div className="flex items-center gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-emerald-600 hover:bg-emerald-500/10"
                          onClick={() => setConfirmAction({ id: r.id, action: "approve" })}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-rose-600 hover:bg-rose-500/10"
                          onClick={() => setConfirmAction({ id: r.id, action: "reject" })}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-8 text-center text-sm text-muted-foreground">{t("cm.noResults")}</div>
          )}
        </div>
      </Card>

      {/* ── Confirmation Dialog ── */}
      <Dialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {confirmAction?.action === "approve" ? t("cm.confirmApprove") : t("cm.confirmReject")}
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {confirmAction?.action === "approve"
              ? t("cm.confirmApproveMessage")
              : t("cm.confirmRejectMessage")}
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmAction(null)}>{t("cm.cancel")}</Button>
            {confirmAction?.action === "approve" ? (
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleConfirm}>
                <Check className="h-4 w-4 me-1" /> {t("cm.approve")}
              </Button>
            ) : (
              <Button variant="destructive" onClick={handleConfirm}>
                <X className="h-4 w-4 me-1" /> {t("cm.reject")}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashPage>
  );
}
