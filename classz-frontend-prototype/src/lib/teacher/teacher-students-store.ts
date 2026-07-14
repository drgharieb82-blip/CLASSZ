import { useEffect } from "react";
import { create } from "zustand";
import { useTeacherCourseStore } from "@/lib/teacher/teacher-course-store";
import { useAuthStore } from "@/lib/stores/auth-store";
import {
  getRoster, getProgress, getAtRisk, getWrongQuestions, getMemoryInsights, getReportSummary,
  listPods, createPod as createPodApi, updatePod as updatePodApi, deletePod as deletePodApi,
  addPodMember as addPodMemberApi, removePodMember as removePodMemberApi,
  type StudentRosterEntry, type StudentProgressEntry, type AtRiskEntry, type WrongQuestionEntry, type MemoryInsightEntry,
  type CourseReportSummary, type StudentPodRead,
} from "@/lib/api/students";
import { listParentContacts, createParentContact, updateParentContact, deleteParentContact, type ParentContactRead, type ParentContactUpdatePayload } from "@/lib/api/parents";
import { listTransactions, createTransaction as createTransactionApi, updateTransaction as updateTransactionApi, type WalletTransactionRead, type WalletTransactionCreatePayload } from "@/lib/api/wallets";
import { listCertificates, createCertificate as createCertificateApi, updateCertificate as updateCertificateApi, type CertificateRead, type CertificateStatus } from "@/lib/api/certificates";

export interface CourseRef {
  id: string;
  title: string;
  grade?: string;
}

/** A single student, merged across every course this teacher teaches them
 * in. Field names/shape intentionally mirror the retired `MockStudent` type
 * (lib/students-mock-data.ts) so page-level rendering code changes as
 * little as possible. Fields with no real backend source
 * (assistantTeacher, hwCompletion as a distinct metric) fall back to the
 * closest real proxy and are called out in the launch report. */
export interface MergedStudent {
  id: string;
  name: string;
  email: string;
  grade: string;
  courses: string[];
  courseIds: string[];
  progress: number;
  avgScore: number;
  riskLevel: "high" | "medium" | "low" | "none";
  riskReasons: string[];
  lastActivityAt: string | null;
  status: "active" | "inactive" | "new";
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  parentRelation: string;
  walletBalance: number;
  totalPaid: number;
  pendingPayment: number;
  joinedDate: string;
  watchTimeMinutes: number;
  hwCompletion: number;
  quizAvg: number;
}

interface TeacherStudentsState {
  courses: CourseRef[];
  roster: StudentRosterEntry[];
  progress: StudentProgressEntry[];
  atRisk: AtRiskEntry[];
  wrongQuestions: WrongQuestionEntry[];
  memory: MemoryInsightEntry[];
  reports: CourseReportSummary[];
  pods: StudentPodRead[];
  parents: ParentContactRead[];
  transactions: WalletTransactionRead[];
  certificates: CertificateRead[];
  isLoading: boolean;
  loadAll: (courses: CourseRef[]) => Promise<void>;
  createPod: (courseId: string, name: string, description?: string) => Promise<void>;
  updatePod: (podId: string, data: { name?: string; description?: string }) => Promise<void>;
  deletePod: (podId: string) => Promise<void>;
  addPodMember: (podId: string, studentId: string) => Promise<void>;
  removePodMember: (podId: string, studentId: string) => Promise<void>;
  addParentContact: (data: { studentId: string; name: string; relation: string; phone?: string; whatsapp?: string; email?: string }) => Promise<void>;
  updateParentContact: (contactId: string, data: ParentContactUpdatePayload) => Promise<void>;
  deleteParentContact: (contactId: string) => Promise<void>;
  addTransaction: (data: WalletTransactionCreatePayload) => Promise<void>;
  markTransactionRefunded: (transactionId: string) => Promise<void>;
  issueCertificate: (studentId: string, courseId: string, title: string) => Promise<void>;
  setCertificateStatus: (certificateId: string, status: CertificateStatus) => Promise<void>;
}

async function settleAll<T>(promises: Promise<T[]>[]): Promise<T[]> {
  const results = await Promise.allSettled(promises);
  return results.flatMap((r) => (r.status === "fulfilled" ? r.value : []));
}

export const useTeacherStudentsStore = create<TeacherStudentsState>()((set, get) => ({
  courses: [],
  roster: [],
  progress: [],
  atRisk: [],
  wrongQuestions: [],
  memory: [],
  reports: [],
  pods: [],
  parents: [],
  transactions: [],
  certificates: [],
  isLoading: false,

  loadAll: async (courses) => {
    if (courses.length === 0) {
      set({ courses: [], roster: [], progress: [], atRisk: [], wrongQuestions: [], memory: [], reports: [], pods: [], parents: [], transactions: [], certificates: [], isLoading: false });
      return;
    }
    set({ isLoading: true, courses });
    const ids = courses.map((c) => c.id);
    const [roster, progress, atRisk, wrongQuestions, memory, pods, parents, transactions, certificates, reports] = await Promise.all([
      settleAll(ids.map((id) => getRoster(id))),
      settleAll(ids.map((id) => getProgress(id))),
      settleAll(ids.map((id) => getAtRisk(id))),
      settleAll(ids.map((id) => getWrongQuestions(id))),
      settleAll(ids.map((id) => getMemoryInsights(id))),
      settleAll(ids.map((id) => listPods(id))),
      settleAll(ids.map((id) => listParentContacts(id))),
      settleAll(ids.map((id) => listTransactions(id))),
      settleAll(ids.map((id) => listCertificates(id))),
      settleAll(ids.map((id) => getReportSummary(id).then((r) => [r]).catch(() => []))),
    ]);
    set({ roster, progress, atRisk, wrongQuestions, memory, pods, parents, transactions, certificates, reports, isLoading: false });
  },

  createPod: async (courseId, name, description) => {
    const pod = await createPodApi(courseId, name, description);
    set((s) => ({ pods: [...s.pods, pod] }));
  },
  updatePod: async (podId, data) => {
    const pod = await updatePodApi(podId, data);
    set((s) => ({ pods: s.pods.map((p) => (p.id === podId ? pod : p)) }));
  },
  deletePod: async (podId) => {
    await deletePodApi(podId);
    set((s) => ({ pods: s.pods.filter((p) => p.id !== podId) }));
  },
  addPodMember: async (podId, studentId) => {
    const pod = await addPodMemberApi(podId, studentId);
    set((s) => ({ pods: s.pods.map((p) => (p.id === podId ? pod : p)) }));
  },
  removePodMember: async (podId, studentId) => {
    await removePodMemberApi(podId, studentId);
    set((s) => ({
      pods: s.pods.map((p) => (p.id === podId ? { ...p, members: p.members.filter((m) => m.student_id !== studentId) } : p)),
    }));
  },

  addParentContact: async (data) => {
    const contact = await createParentContact({
      student_id: data.studentId,
      name: data.name,
      relation: data.relation,
      phone: data.phone,
      whatsapp: data.whatsapp,
      email: data.email,
    });
    set((s) => ({ parents: [contact, ...s.parents] }));
  },
  updateParentContact: async (contactId, data) => {
    const updated = await updateParentContact(contactId, data);
    set((s) => ({ parents: s.parents.map((p) => (p.id === contactId ? updated : p)) }));
  },
  deleteParentContact: async (contactId) => {
    await deleteParentContact(contactId);
    set((s) => ({ parents: s.parents.filter((p) => p.id !== contactId) }));
  },

  addTransaction: async (data) => {
    const transaction = await createTransactionApi(data);
    set((s) => ({ transactions: [transaction, ...s.transactions] }));
  },
  markTransactionRefunded: async (transactionId) => {
    const updated = await updateTransactionApi(transactionId, { status: "refunded" });
    set((s) => ({ transactions: s.transactions.map((t) => (t.id === transactionId ? updated : t)) }));
  },

  issueCertificate: async (studentId, courseId, title) => {
    const cert = await createCertificateApi({ student_id: studentId, course_id: courseId, title });
    set((s) => ({ certificates: [cert, ...s.certificates] }));
  },
  setCertificateStatus: async (certificateId, status) => {
    const updated = await updateCertificateApi(certificateId, { status });
    set((s) => ({ certificates: s.certificates.map((c) => (c.id === certificateId ? updated : c)) }));
  },
}));

function formatWatchTime(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  return `${(minutes / 60).toFixed(1)}h`;
}

function relativeTime(iso: string | null): string {
  if (!iso) return "Never";
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 60) return `${Math.max(minutes, 0)}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const RISK_ORDER: Record<MergedStudent["riskLevel"], number> = { high: 3, medium: 2, low: 1, none: 0 };

/** Merges per-course roster/at-risk/wallet/parent rows into one row per
 * student — the shape every "flat list" page (Overview, All Students,
 * Progress, At-Risk) renders. */
export function getMergedStudents(): MergedStudent[] {
  const { roster, progress, atRisk, courses, parents, transactions } = useTeacherStudentsStore.getState();
  const courseTitleById = new Map(courses.map((c) => [c.id, c.title]));
  const courseGradeById = new Map(courses.map((c) => [c.id, c.grade || ""]));
  const watchTimeByStudent = new Map<string, number>();
  for (const p of progress) {
    watchTimeByStudent.set(p.student_id, (watchTimeByStudent.get(p.student_id) || 0) + p.watch_time_minutes);
  }
  const riskByStudent = new Map<string, AtRiskEntry>();
  for (const r of atRisk) {
    const existing = riskByStudent.get(r.student_id);
    if (!existing || RISK_ORDER[r.risk_level] > RISK_ORDER[existing.risk_level]) riskByStudent.set(r.student_id, r);
  }

  const byStudent = new Map<string, MergedStudent>();
  for (const row of roster) {
    const existing = byStudent.get(row.student_id);
    const courseTitle = courseTitleById.get(row.course_id) || "";
    const parent = parents.find((p) => p.student_id === row.student_id);
    const studentTransactions = transactions.filter((t) => t.student_id === row.student_id);
    const totalPaid = studentTransactions.filter((t) => t.type === "payment" && t.status === "paid").reduce((sum, t) => sum + t.amount, 0);
    const pendingPayment = studentTransactions.filter((t) => t.status === "pending").reduce((sum, t) => sum + t.amount, 0);
    const walletBalance = studentTransactions
      .filter((t) => (t.type === "topup" || t.type === "adjustment") && t.status === "paid")
      .reduce((sum, t) => sum + t.amount, 0);
    const risk = riskByStudent.get(row.student_id);

    if (existing) {
      existing.courses.push(courseTitle);
      existing.courseIds.push(row.course_id);
      existing.progress = Math.round((existing.progress + row.progress_percent) / 2);
      existing.quizAvg = Math.round(((existing.quizAvg + (row.quiz_average ?? existing.quizAvg)) / 2));
      existing.avgScore = existing.quizAvg;
      existing.hwCompletion = existing.progress;
      if (row.enrolled_at < existing.joinedDate) existing.joinedDate = row.enrolled_at;
      continue;
    }

    byStudent.set(row.student_id, {
      id: row.student_id,
      name: row.full_name,
      email: row.email,
      grade: courseGradeById.get(row.course_id) || "",
      courses: [courseTitle],
      courseIds: [row.course_id],
      progress: Math.round(row.progress_percent),
      avgScore: Math.round(row.quiz_average ?? 0),
      riskLevel: risk?.risk_level ?? "none",
      riskReasons: risk?.risk_reasons ?? [],
      lastActivityAt: row.last_activity_at,
      status: row.last_activity_at ? "active" : "new",
      parentName: parent?.name ?? "",
      parentPhone: parent?.phone ?? "",
      parentEmail: parent?.email ?? "",
      parentRelation: parent?.relation ?? "",
      walletBalance,
      totalPaid,
      pendingPayment,
      joinedDate: row.enrolled_at,
      watchTimeMinutes: watchTimeByStudent.get(row.student_id) || 0,
      hwCompletion: Math.round(row.progress_percent),
      quizAvg: Math.round(row.quiz_average ?? 0),
    });
  }
  return Array.from(byStudent.values());
}

export { formatWatchTime, relativeTime };

/** Bootstraps the Students section data: loads the teacher's courses, then
 * loads every students-section domain (roster/progress/at-risk/wrong
 * questions/memory/pods/parents/wallet transactions/certificates) across
 * all of them. Every teacher.students.*.tsx page calls this once. */
export function useLoadTeacherStudentsData() {
  const user = useAuthStore((s) => s.user);
  const teacherCourses = useTeacherCourseStore((s) => s.courses);
  const loadCourses = useTeacherCourseStore((s) => s.loadCourses);
  const loadAll = useTeacherStudentsStore((s) => s.loadAll);

  useEffect(() => {
    if (user?.id) loadCourses(user.id);
  }, [user?.id, loadCourses]);

  useEffect(() => {
    const refs: CourseRef[] = teacherCourses.map((c) => ({ id: c.id, title: c.title, grade: c.grade }));
    void loadAll(refs);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teacherCourses.map((c) => c.id).join(",")]);
}
