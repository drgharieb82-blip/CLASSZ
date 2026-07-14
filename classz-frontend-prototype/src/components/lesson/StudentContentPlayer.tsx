import { useState } from "react";
import { Play, Pause, Volume2, Maximize, Settings } from "lucide-react";

interface StudentContentPlayerProps {
  title: string;
  type: "video" | "text" | "pdf" | "youtube";
  thumbnailEmoji?: string;
  src?: string;
}

export function StudentContentPlayer({ title, type, thumbnailEmoji = "🎐", src }: StudentContentPlayerProps) {
  const [playing, setPlaying] = useState(false);
  const [currentTime] = useState("04:24");
  const [totalTime] = useState("18:30");
  const [progress] = useState(24);

  return (
    <div className="overflow-hidden rounded-2xl border bg-card/40">
      <div className="relative aspect-video bg-gradient-to-br from-card to-background">
        {type === "video" && src ? (
          <video className="h-full w-full" controls src={src} />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            {type === "video" && (
              <>
                <div className="flex flex-col items-center gap-3 text-center">
                  <span className="text-5xl">{thumbnailEmoji}</span>
                  <div>
                    <h3 className="text-lg font-bold">{title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {playing ? "Playing..." : "Click play to start"}
                    </p>
                  </div>
                </div>
                {!playing && (
                  <button
                    onClick={() => setPlaying(true)}
                    className="grid h-16 w-16 place-items-center rounded-full gradient-brand text-white shadow-lg transition-transform hover:scale-110 glow"
                  >
                    <Play className="h-7 w-7 ms-0.5" />
                  </button>
                )}
              </>
            )}
            {type === "youtube" && (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <span className="text-4xl">▶️</span>
                <p className="text-sm">YouTube embed placeholder</p>
              </div>
            )}
            {type === "pdf" && (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <span className="text-4xl">📄</span>
                <p className="text-sm">PDF viewer placeholder</p>
              </div>
            )}
            {type === "text" && (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <span className="text-4xl">📝</span>
                <p className="text-sm">Text content view</p>
              </div>
            )}
          </div>
        )}
      </div>

      {type === "video" && !src && (
        <div className="border-t bg-card/80 px-4 py-2.5">
          <div className="mb-2 flex items-center gap-2">
            <div className="h-1 flex-1 cursor-pointer overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full gradient-brand transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPlaying(!playing)}
                className="grid h-8 w-8 place-items-center rounded-lg transition-colors hover:bg-accent"
              >
                {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </button>
              <span className="text-xs tabular-nums text-muted-foreground">
                {currentTime} / {totalTime}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button className="grid h-8 w-8 place-items-center rounded-lg transition-colors hover:bg-accent">
                <Volume2 className="h-4 w-4 text-muted-foreground" />
              </button>
              <button className="grid h-8 w-8 place-items-center rounded-lg transition-colors hover:bg-accent">
                <Settings className="h-4 w-4 text-muted-foreground" />
              </button>
              <button className="grid h-8 w-8 place-items-center rounded-lg transition-colors hover:bg-accent">
                <Maximize className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
