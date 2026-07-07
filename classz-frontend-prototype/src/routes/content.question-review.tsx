import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ListChecks, Search, Check, X } from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { useApp } from "@/lib/app-context";
import { cn } from "@/lib/utils";
import { ROLES } from "@/lib/roles";
import { questionReviews, type QuestionReview } from "@/lib/content-manager-mock-data";

export const Route = createFileRoute("/content/question-review")({
  component: QuestionReviewPage,
});

const typeBadge: Record<string, { cls: string }> = {
  mcq: { cls: "bg-blue-500/10 text-blue-600 border-blue-300" },
  essay: { cls: "bg-violet-500/10 text-violet-600 border-violet-300" },
  "true-false": { cls: "bg-emerald-500/10 text-emerald-600 border-emerald-300" },
  "fill-blank": { cls: "bg-amber-500/10 text-amber-600 border-amber-300" },
};

const difficultyBadge: Record<string, { cls: string }> = {
  easy: { cls: "bg-green-500/10 text-green-600 border-green-300" },
  medium: { cls: "bg-amber-500/10 text-amber-600 border-amber-300" },
  hard: { cls: "bg-rose-500/10 text-rose-600 border-rose-300" },
};

const statusBadge: Record<string, { cls: string }> = {
  pending: { cls: "bg-amber-500/10 text-amber-600 border-amber-300" },
  approved: { cls: "bg-emerald-500/10 text-emerald-600 border-emerald-300" },
  rejected: { cls: "bg-rose-500/10 text-rose-600 border-rose-300" },
};

function QuestionReviewPage() {
  const { t } = useApp();
  const [reviews, setReviews] = useState<QuestionReview[]>(questionReviews);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionReview | null>(null);

  const filtered = reviews.filter((q) => {
    if (search && !q.question.toLowerCase().includes(search.toLowerCase()) && !q.subject.toLowerCase().includes(search.toLowerCase())) return false;
    if (typeFilter !== "all" && q.type !== typeFilter) return false;
    if (statusFilter !== "all" && q.status !== statusFilter) return false;
    if (difficultyFilter !== "all" && q.difficulty !== difficultyFilter) return false;
    return true;
  });

  function handleApprove(id: string) {
    setReviews((prev) => prev.map((q) => q.id === id ? { ...q, status: "approved" as const, reviewedBy: "You" } : q));
    setSelectedQuestion(null);
  }

  function handleReject(id: string) {
    setReviews((prev) => prev.map((q) => q.id === id ? { ...q, status: "rejected" as const, reviewedBy: "You" } : q));
    setSelectedQuestion(null);
  }

  return (
    <DashPage role="content" title="cm.questionReview" subtitle="cm.questionReviewSubtitle" icon={ListChecks}>
      {/* ── Filters ── */}
      <Card className="border bg-card p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t("cm.searchQuestions")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="ps-9"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder={t("cm.type")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("cm.allTypes")}</SelectItem>
              <SelectItem value="mcq">MCQ</SelectItem>
              <SelectItem value="essay">Essay</SelectItem>
              <SelectItem value="true-false">True/False</SelectItem>
              <SelectItem value="fill-blank">Fill Blank</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder={t("cm.status")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("cm.allStatuses")}</SelectItem>
              <SelectItem value="pending">{t("cm.pending")}</SelectItem>
              <SelectItem value="approved">{t("cm.approved")}</SelectItem>
              <SelectItem value="rejected">{t("cm.rejected")}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder={t("cm.difficulty")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("cm.allDifficulties")}</SelectItem>
              <SelectItem value="easy">{t("cm.easy")}</SelectItem>
              <SelectItem value="medium">{t("cm.medium")}</SelectItem>
              <SelectItem value="hard">{t("cm.hard")}</SelectItem>
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
                <th className="py-2 pe-4 text-start font-medium">{t("cm.question")}</th>
                <th className="py-2 pe-4 text-start font-medium">{t("cm.subject")}</th>
                <th className="py-2 pe-4 text-start font-medium">{t("cm.topic")}</th>
                <th className="py-2 pe-4 text-start font-medium">{t("cm.submittedBy")}</th>
                <th className="py-2 pe-4 text-start font-medium">{t("cm.type")}</th>
                <th className="py-2 pe-4 text-start font-medium">{t("cm.difficulty")}</th>
                <th className="py-2 pe-4 text-start font-medium">{t("cm.status")}</th>
                <th className="py-2 pe-4 text-start font-medium">{t("cm.date")}</th>
                <th className="py-2 text-start font-medium">{t("cm.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((q) => (
                <tr key={q.id} className="border-b border-border/50 transition-colors hover:bg-accent/40">
                  <td
                    className="py-2.5 pe-4 font-medium max-w-[200px] truncate cursor-pointer hover:text-primary"
                    onClick={() => setSelectedQuestion(q)}
                  >
                    {q.question}
                  </td>
                  <td className="py-2.5 pe-4 text-muted-foreground">{q.subject}</td>
                  <td className="py-2.5 pe-4 text-muted-foreground">{q.topic}</td>
                  <td className="py-2.5 pe-4 text-muted-foreground">{q.submittedBy}</td>
                  <td className="py-2.5 pe-4">
                    <Badge variant="outline" className={cn("text-xs rounded-full capitalize", typeBadge[q.type]?.cls)}>{q.type}</Badge>
                  </td>
                  <td className="py-2.5 pe-4">
                    <Badge variant="outline" className={cn("text-xs rounded-full capitalize", difficultyBadge[q.difficulty]?.cls)}>{q.difficulty}</Badge>
                  </td>
                  <td className="py-2.5 pe-4">
                    <Badge variant="outline" className={cn("text-xs rounded-full capitalize", statusBadge[q.status]?.cls)}>{q.status}</Badge>
                  </td>
                  <td className="py-2.5 pe-4 text-muted-foreground text-xs">{q.submittedAt}</td>
                  <td className="py-2.5">
                    {q.status === "pending" && (
                      <div className="flex items-center gap-1">
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-emerald-600 hover:bg-emerald-500/10" onClick={() => handleApprove(q.id)}>
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-rose-600 hover:bg-rose-500/10" onClick={() => handleReject(q.id)}>
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

      {/* ── Question Detail Dialog ── */}
      <Dialog open={!!selectedQuestion} onOpenChange={() => setSelectedQuestion(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("cm.questionDetail")}</DialogTitle>
          </DialogHeader>
          {selectedQuestion && (
            <div className="space-y-4">
              <div className="rounded-lg border bg-accent/30 p-4">
                <p className="text-sm leading-relaxed">{selectedQuestion.question}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">{t("cm.subject")}</p>
                  <p className="font-medium">{selectedQuestion.subject}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t("cm.topic")}</p>
                  <p className="font-medium">{selectedQuestion.topic}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t("cm.submittedBy")}</p>
                  <p className="font-medium">{selectedQuestion.submittedBy}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t("cm.date")}</p>
                  <p className="font-medium">{selectedQuestion.submittedAt}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t("cm.type")}</p>
                  <Badge variant="outline" className={cn("text-xs rounded-full capitalize", typeBadge[selectedQuestion.type]?.cls)}>{selectedQuestion.type}</Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t("cm.difficulty")}</p>
                  <Badge variant="outline" className={cn("text-xs rounded-full capitalize", difficultyBadge[selectedQuestion.difficulty]?.cls)}>{selectedQuestion.difficulty}</Badge>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">{t("cm.status")}</p>
                <Badge variant="outline" className={cn("text-xs rounded-full capitalize", statusBadge[selectedQuestion.status]?.cls)}>{selectedQuestion.status}</Badge>
              </div>
            </div>
          )}
          <DialogFooter>
            {selectedQuestion?.status === "pending" && (
              <div className="flex gap-2">
                <Button variant="outline" className="text-rose-600 border-rose-300 hover:bg-rose-500/10" onClick={() => handleReject(selectedQuestion.id)}>
                  <X className="h-4 w-4 me-1" /> {t("cm.reject")}
                </Button>
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handleApprove(selectedQuestion.id)}>
                  <Check className="h-4 w-4 me-1" /> {t("cm.approve")}
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashPage>
  );
}
