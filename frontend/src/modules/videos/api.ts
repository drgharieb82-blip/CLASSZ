export type VideoProvider = "LOCAL" | "BUNNY" | "MUX";

export type Video = {
  id: string;
  lesson_block_id: string;
  title: string;
  provider: VideoProvider;
  provider_video_id: string;
  duration_seconds: number;
  thumbnail_url: string | null;
  created_at: string;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`);

  if (!response.ok) {
    throw new Error(`Request failed with ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function listVideos(): Promise<Video[]> {
  return request<Video[]>("/api/videos");
}

export function getVideo(videoId: string): Promise<Video> {
  return request<Video>(`/api/videos/${videoId}`);
}

export function formatDuration(totalSeconds: number): string {
  const safeSeconds = Math.max(0, totalSeconds);
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
