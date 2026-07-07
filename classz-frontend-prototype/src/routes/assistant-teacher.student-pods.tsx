import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { UsersRound, ChevronDown, AlertTriangle, Search } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { ROLES } from "@/lib/roles";
import { cn } from "@/lib/utils";
import { useApp } from "@/lib/app-context";
import { pods, assignedStudents } from "@/lib/assistant-teacher-mock-data";

export const Route = createFileRoute("/assistant-teacher/student-pods")({ component: StudentPodsPage });

const riskColors: Record<string, string> = {
  low: "border-emerald-400/40 text-emerald-400 bg-emerald-500/10",
  medium: "border-amber-400/40 text-amber-400 bg-amber-500/10",
  high: "border-rose-400/40 text-rose-400 bg-rose-500/10",
};

function StudentPodsPage() {
  const { t } = useApp();
  const [openPods, setOpenPods] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState("");

  const togglePod = (name: string) => {
    setOpenPods((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const filteredStudents = (podName: string) => {
    const podStudents = assignedStudents.filter((s) => s.pod === podName);
    if (!search) return podStudents;
    const q = search.toLowerCase();
    return podStudents.filter((s) => s.name.toLowerCase().includes(q) || s.grade.toLowerCase().includes(q));
  };

  return (
    <DashPage role="assistant_teacher" title="at.studentPods" subtitle="at.studentPodsSubtitle" icon={ROLES.assistant_teacher.icon}>
      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t("at.searchStudents")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="ps-9 h-9 text-sm bg-muted/30 border"
        />
      </div>

      {/* Pod cards */}
      <div className="space-y-4">
        {pods.map((pod) => {
          const isOpen = !!openPods[pod.name];
          const students = filteredStudents(pod.name);

          return (
            <Card key={pod.name} className="border bg-card overflow-hidden">
              {/* Pod header */}
              <button
                onClick={() => togglePod(pod.name)}
                className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors text-start"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-500/10">
                    <UsersRound className="h-5 w-5 text-teal-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{pod.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {pod.students} {t("at.students")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Completion */}
                  <div className="hidden sm:flex items-center gap-2">
                    <div className="w-24 h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-teal-500 to-cyan-500"
                        style={{ width: `${pod.avgCompletion}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold w-10 text-end">{pod.avgCompletion}%</span>
                  </div>

                  {/* At risk */}
                  <Badge variant="outline" className={cn("rounded-full text-xs", pod.atRisk > 2 ? "border-rose-400/40 text-rose-400 bg-rose-500/10" : "border-amber-400/40 text-amber-400 bg-amber-500/10")}>
                    <AlertTriangle className="h-3 w-3 me-1" />{pod.atRisk} {t("at.atRisk")}
                  </Badge>

                  <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform duration-200", isOpen && "rotate-180")} />
                </div>
              </button>

              {/* Expanded student table */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="border-t px-4 pb-4">
                      {students.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-4 text-center">{t("at.noStudentsFound")}</p>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow className="hover:bg-transparent">
                              <TableHead className="text-xs">{t("at.name")}</TableHead>
                              <TableHead className="text-xs">{t("at.grade")}</TableHead>
                              <TableHead className="text-xs">{t("at.riskLevel")}</TableHead>
                              <TableHead className="text-xs hidden sm:table-cell">{t("at.lastActive")}</TableHead>
                              <TableHead className="text-xs">{t("at.completion")}</TableHead>
                              <TableHead className="text-xs text-end">{t("at.pendingHW")}</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {students.map((s) => (
                              <TableRow key={s.id} className="hover:bg-muted/30">
                                <TableCell className="text-sm font-medium">{s.name}</TableCell>
                                <TableCell className="text-xs text-muted-foreground">{s.grade}</TableCell>
                                <TableCell>
                                  <Badge variant="outline" className={cn("rounded-full text-xs", riskColors[s.riskLevel])}>
                                    {s.riskLevel}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-xs text-muted-foreground hidden sm:table-cell">{s.lastActive}</TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                                      <div
                                        className={cn(
                                          "h-full rounded-full",
                                          s.completionRate >= 80 ? "bg-emerald-500" : s.completionRate >= 60 ? "bg-amber-500" : "bg-rose-500"
                                        )}
                                        style={{ width: `${s.completionRate}%` }}
                                      />
                                    </div>
                                    <span className="text-xs font-medium w-8">{s.completionRate}%</span>
                                  </div>
                                </TableCell>
                                <TableCell className="text-end">
                                  {s.pendingHW > 0 ? (
                                    <Badge variant="outline" className="rounded-full text-xs border-amber-400/40 text-amber-400 bg-amber-500/10">
                                      {s.pendingHW}
                                    </Badge>
                                  ) : (
                                    <span className="text-xs text-muted-foreground">0</span>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          );
        })}
      </div>
    </DashPage>
  );
}
