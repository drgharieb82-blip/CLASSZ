import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Plus, Briefcase, Users, Calendar, DollarSign, MapPin,
  ExternalLink, MoreHorizontal, X,
} from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ROLES } from "@/lib/roles";
import { useApp } from "@/lib/app-context";
import { jobPosts, type JobPost } from "@/lib/team-mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/teacher/team/recruitment")({
  component: RecruitmentPage,
});

const statusColors: Record<string, string> = {
  published: "bg-emerald-500/10 text-emerald-600 border-emerald-300",
  draft: "bg-amber-500/10 text-amber-600 border-amber-300",
  closed: "bg-slate-500/10 text-slate-500 border-slate-300",
};

const typeColors: Record<string, string> = {
  "full-time": "bg-blue-500/10 text-blue-600",
  "part-time": "bg-violet-500/10 text-violet-600",
  contract: "bg-amber-500/10 text-amber-600",
  freelance: "bg-emerald-500/10 text-emerald-600",
};

function RecruitmentPage() {
  const { t } = useApp();
  const [formOpen, setFormOpen] = useState(false);
  const [detailPost, setDetailPost] = useState<JobPost | null>(null);

  const published = jobPosts.filter((j) => j.status === "published");
  const drafts = jobPosts.filter((j) => j.status === "draft");
  const closed = jobPosts.filter((j) => j.status === "closed");

  return (
    <DashPage role="teacher" title={t("team.recruitment")} subtitle={`${jobPosts.length} job posts`} icon={ROLES.teacher.icon}
      actions={
        <Button className="rounded-xl gradient-brand border-0 text-white" size="sm" onClick={() => setFormOpen(true)}>
          <Plus className="me-1.5 h-4 w-4" /> {t("team.publish")}
        </Button>
      }
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="flex items-center gap-3 border bg-card p-4">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/10">
            <Briefcase className="h-5 w-5 text-emerald-500" />
          </span>
          <div>
            <p className="text-2xl font-bold">{published.length}</p>
            <p className="text-xs text-muted-foreground">{t("team.publish")}ed</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 border bg-card p-4">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-500/10">
            <Briefcase className="h-5 w-5 text-amber-500" />
          </span>
          <div>
            <p className="text-2xl font-bold">{drafts.length}</p>
            <p className="text-xs text-muted-foreground">{t("team.draft")}s</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 border bg-card p-4">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-500/10">
            <Users className="h-5 w-5 text-slate-500" />
          </span>
          <div>
            <p className="text-2xl font-bold">{jobPosts.reduce((s, j) => s + j.applicants, 0)}</p>
            <p className="text-xs text-muted-foreground">Total Applicants</p>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {jobPosts.map((job) => (
          <Card key={job.id} className="flex flex-col border bg-card p-5 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setDetailPost(job)}>
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold">{job.title}</h4>
                <p className="text-xs text-muted-foreground mt-0.5">{job.id}</p>
              </div>
              <Badge variant="outline" className={cn("rounded-full text-xs capitalize", statusColors[job.status])}>
                {job.status}
              </Badge>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge className={cn("rounded-full border-0 text-xs capitalize", typeColors[job.type])}>{job.type}</Badge>
              <Badge variant="outline" className="rounded-full text-xs">
                <DollarSign className="me-1 h-3 w-3" /> {job.salaryAmount}
              </Badge>
            </div>
            <Separator className="my-3" />
            <div className="flex-1 space-y-2">
              <div>
                <p className="text-xs font-medium text-muted-foreground">{t("team.requirements")}</p>
                <ul className="mt-1 space-y-0.5">
                  {job.requirements.slice(0, 2).map((r, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                      <span className="mt-1.5 h-1 w-1 rounded-full bg-primary shrink-0" /> {r}
                    </li>
                  ))}
                  {job.requirements.length > 2 && (
                    <li className="text-xs text-primary">+{job.requirements.length - 2} more</li>
                  )}
                </ul>
              </div>
            </div>
            <Separator className="my-3" />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {job.applicants} applicants</span>
              <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {job.postedDate}</span>
            </div>
          </Card>
        ))}
      </div>

      <JobFormDialog open={formOpen} onOpenChange={setFormOpen} />
      <JobDetailDialog job={detailPost} onClose={() => setDetailPost(null)} />
    </DashPage>
  );
}

function JobFormDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { t } = useApp();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("team.publishRecruitment")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>{t("team.jobTitle")}</Label>
            <Input placeholder="e.g. Assistant Teacher — Mathematics" className="rounded-xl" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>{t("team.jobType")}</Label>
              <Select>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Full-time", "Part-time", "Contract", "Freelance"].map((t) => (
                    <SelectItem key={t} value={t.toLowerCase()}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>{t("team.salaryType")}</Label>
              <Select>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Fixed", "Percentage", "Per Task"].map((t) => (
                    <SelectItem key={t} value={t.toLowerCase()}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>{t("team.salaryAmount")}</Label>
            <Input placeholder="e.g. EGP 8,000/month or 15% per course" className="rounded-xl" />
          </div>
          <div className="space-y-1.5">
            <Label>{t("team.requirements")}</Label>
            <Textarea placeholder="One requirement per line..." className="rounded-xl min-h-[80px]" />
          </div>
          <div className="space-y-1.5">
            <Label>{t("team.responsibilities")}</Label>
            <Textarea placeholder="One responsibility per line..." className="rounded-xl min-h-[80px]" />
          </div>
          <div className="space-y-1.5">
            <Label>{t("team.experience")}</Label>
            <Input placeholder="e.g. 2+ years in education" className="rounded-xl" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" className="rounded-xl" onClick={() => onOpenChange(false)}>{t("team.draft")}</Button>
          <Button className="rounded-xl gradient-brand border-0 text-white" onClick={() => onOpenChange(false)}>{t("team.publish")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function JobDetailDialog({ job, onClose }: { job: JobPost | null; onClose: () => void }) {
  const { t } = useApp();
  if (!job) return null;

  return (
    <Dialog open={!!job} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{job.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className={cn("rounded-full text-xs capitalize", statusColors[job.status])}>{job.status}</Badge>
            <Badge className={cn("rounded-full border-0 text-xs capitalize", typeColors[job.type])}>{job.type}</Badge>
            <Badge variant="outline" className="rounded-full text-xs"><DollarSign className="me-1 h-3 w-3" /> {job.salaryAmount}</Badge>
          </div>

          <div>
            <p className="text-sm font-semibold mb-1.5">{t("team.requirements")}</p>
            <ul className="space-y-1">
              {job.requirements.map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="mt-2 h-1 w-1 rounded-full bg-primary shrink-0" /> {r}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold mb-1.5">{t("team.responsibilities")}</p>
            <ul className="space-y-1">
              {job.responsibilities.map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="mt-2 h-1 w-1 rounded-full bg-emerald-500 shrink-0" /> {r}
                </li>
              ))}
            </ul>
          </div>

          <Separator />
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{t("team.experience")}</span>
            <span className="font-medium">{job.experience}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Applicants</span>
            <span className="font-medium">{job.applicants}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Posted</span>
            <span className="font-medium">{job.postedDate}</span>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" className="rounded-xl" onClick={onClose}>{t("team.close")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
