import { api } from "./client";
import type {
  AtomicConceptRead,
  ChapterRead,
  ConceptRead,
  CourseRead,
  LessonRead,
  SessionRead,
} from "./courses";
import type { MaterialRead } from "./materials";

export type StudentSessionBlockType = "TEXT" | "PDF" | "IMAGE" | "VIDEO" | "ATTACHMENT";
export type VideoProvider = "LOCAL" | "BUNNY" | "MUX";

export interface StudentSessionBlockRead {
  id: string;
  session_id: string;
  block_type: StudentSessionBlockType;
  position: number;
  data_json: Record<string, unknown>;
  created_at: string;
}

export interface StudentVideoRead {
  id: string;
  session_block_id: string;
  title: string;
  provider: VideoProvider;
  provider_video_id: string;
  duration_seconds: number;
  thumbnail_url: string | null;
  created_at: string;
}

export interface StudentSessionDetailRead {
  course: CourseRead;
  chapters: ChapterRead[];
  lessons: LessonRead[];
  session: SessionRead;
  blocks: StudentSessionBlockRead[];
  materials: MaterialRead[];
  videos: StudentVideoRead[];
  concepts: ConceptRead[];
  atomic_concepts: AtomicConceptRead[];
}

export function getStudentSessionDetail(sessionId: string): Promise<StudentSessionDetailRead> {
  return api.get<StudentSessionDetailRead>(
    `/api/student/session-detail/${encodeURIComponent(sessionId)}`,
  );
}
