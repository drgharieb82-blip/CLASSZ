import { api } from "./client";

export type SessionBlockType = "TEXT" | "PDF" | "IMAGE" | "ATTACHMENT";

export interface SessionBlockRead {
  id: string;
  session_id: string;
  block_type: SessionBlockType;
  position: number;
  data_json: Record<string, unknown>;
  created_at: string;
}

export function listSessionBlocks(sessionId: string): Promise<SessionBlockRead[]> {
  return api.get<SessionBlockRead[]>(
    `/api/session-blocks?session_id=${encodeURIComponent(sessionId)}`,
  );
}
