import { createFileRoute } from "@tanstack/react-router";
import { Calendar, Clock, DollarSign, Eye, EyeOff, Lock, Plus, Upload, Video } from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ROLES } from "@/lib/roles";

export const Route = createFileRoute("/teacher/sessions")({
  component: SessionBuilderPage,
});

const mockSessions = [
  { id: "SES-26-0001", title: "Session 1: Foundations", chapter: "Differential Calculus", items: 4, price: 0, status: "published" as const, students: 1240, openDate: "2026-06-01" },
  { id: "SES-26-0002", title: "Session 2: Differentiation Rules", chapter: "Differential Calculus", items: 5, price: 20, status: "published" as const, students: 980, openDate: "2026-06-08" },
  { id: "SES-26-0003", title: "Session 3: Applications", chapter: "Differential Calculus", items: 3, price: 20, status: "scheduled" as const, students: 0, openDate: "2026-06-22" },
  { id: "SES-26-0004", title: "Session 4: Integration Basics", chapter: "Integral Calculus", items: 0, price: 25, status: "draft" as const, students: 0, openDate: "" },
];

function SessionBuilderPage() {
  return (
    <DashPage role="teacher" title="Session Builder" subtitle="Create and manage learning sessions" icon={ROLES.teacher.icon}>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{mockSessions.length} sessions across all courses</p>
        <Button className="rounded-xl gradient-brand border-0 text-white" size="sm">
          <Plus className="me-1.5 h-4 w-4" /> Create Session
        </Button>
      </div>

      <div className="space-y-3">
        {mockSessions.map((session) => (
          <Card key={session.id} className="border bg-card p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{session.title}</h3>
                  <Badge variant="outline" className={`rounded-full text-xs ${
                    session.status === "published" ? "border-emerald-300 text-emerald-600" :
                    session.status === "scheduled" ? "border-blue-300 text-blue-600" :
                    "text-muted-foreground"
                  }`}>
                    {session.status}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{session.chapter} · {session.id}</p>

                <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Video className="h-3.5 w-3.5" /> {session.items} items</span>
                  <span className="flex items-center gap-1"><DollarSign className="h-3.5 w-3.5" /> {session.price === 0 ? "Free" : `$${session.price}`}</span>
                  <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> {session.students} students</span>
                  {session.openDate && <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {session.openDate}</span>}
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="rounded-xl">Edit</Button>
                {session.status === "draft" && (
                  <Button size="sm" className="rounded-xl gradient-brand border-0 text-white">Publish</Button>
                )}
              </div>
            </div>

            {session.status === "draft" && session.items === 0 && (
              <div className="mt-4 flex items-center gap-4 rounded-xl border border-dashed p-4">
                <Upload className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Add content to this session</p>
                  <p className="text-xs text-muted-foreground">Upload videos, PDFs, create quizzes, or add homework</p>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </DashPage>
  );
}
