import { clsx } from "clsx";

import type { ChatMessage } from "../types";

type ChatBubbleProps = {
  message?: ChatMessage;
};

export function ChatBubble({ message }: ChatBubbleProps) {
  const isAssistant = message?.role === "assistant";

  return (
    <article
      className={clsx(
        "max-w-[min(100%,42rem)] rounded-xl border px-4 py-3 text-sm leading-6 shadow-sm transition duration-200",
        isAssistant
          ? "border-teal-200 bg-teal-50 text-slate-900 dark:border-teal-300/20 dark:bg-teal-400/10 dark:text-teal-50"
          : "ms-auto border-slate-200 bg-white text-slate-900 dark:border-white/10 dark:bg-white/8 dark:text-white",
      )}
    >
      <p>{message?.content ?? "Assistant teacher message placeholder"}</p>
    </article>
  );
}
