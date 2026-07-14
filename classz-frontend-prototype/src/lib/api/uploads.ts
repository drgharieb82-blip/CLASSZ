import { uploadFile } from "./client";

export interface MaterialUploadResponse {
  url: string;
  file_name: string;
  size_bytes: number;
  mime_type: string;
}

export interface UploadMaterialFileParams {
  file: File;
  courseId: string;
  chapterId?: string;
  lessonId?: string;
  sessionId?: string;
}

/** Uploads a course material file (video/pdf/image/document/audio/zip) into
 * the organized backend storage tree — teacher/course/chapter/lesson/session
 * — scoped and ownership-checked server-side. */
export function uploadMaterialFile(params: UploadMaterialFileParams): Promise<MaterialUploadResponse> {
  const formData = new FormData();
  formData.append("category", "material");
  formData.append("file", params.file);
  formData.append("course_id", params.courseId);
  if (params.chapterId) formData.append("chapter_id", params.chapterId);
  if (params.lessonId) formData.append("lesson_id", params.lessonId);
  if (params.sessionId) formData.append("session_id", params.sessionId);
  return uploadFile<MaterialUploadResponse>("/api/uploads", formData);
}
