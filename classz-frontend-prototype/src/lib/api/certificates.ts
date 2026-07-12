import { api } from "./client";

export type CertificateStatus = "pending" | "issued" | "revoked";

export interface CertificateRead {
  id: string;
  public_code: string;
  student_id: string;
  student_name: string;
  course_id: string;
  course_title: string;
  title: string;
  status: CertificateStatus;
  issued_at: string;
}

export interface CertificateCreatePayload {
  student_id: string;
  course_id: string;
  title: string;
}

export interface CertificateUpdatePayload {
  status?: CertificateStatus;
  title?: string;
}

export function listCertificates(courseId: string): Promise<CertificateRead[]> {
  return api.get<CertificateRead[]>(`/api/certificates?course_id=${encodeURIComponent(courseId)}`);
}

export function listMyCertificates(): Promise<CertificateRead[]> {
  return api.get<CertificateRead[]>("/api/certificates/me");
}

export function createCertificate(data: CertificateCreatePayload): Promise<CertificateRead> {
  return api.post<CertificateRead>("/api/certificates", data);
}

export function updateCertificate(certificateId: string, data: CertificateUpdatePayload): Promise<CertificateRead> {
  return api.patch<CertificateRead>(`/api/certificates/${encodeURIComponent(certificateId)}`, data);
}
