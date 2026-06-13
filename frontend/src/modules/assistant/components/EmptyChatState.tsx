import { MessageCircle, Sparkles } from "lucide-react";

import { EmptyState } from "../../../components/ui/EmptyState";

type EmptyChatStateProps = {
  onPromptSelect?: (prompt: string) => void;
};

const prompts = ["Explain this concept.", "Generate practice questions.", "Why is my answer wrong?"];

export function EmptyChatState({ onPromptSelect }: EmptyChatStateProps) {
  return (
    <div className="flex min-h-[24rem] items-center justify-center p-4">
      <EmptyState
        title="Ask anything about your lesson"
        description="Use the assistant teacher mock chat to explore explanations, practice, and feedback flows."
        icon={<MessageCircle className="h-5 w-5" aria-hidden="true" />}
        action={
          <div className="flex flex-wrap justify-center gap-2">
            {prompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => onPromptSelect?.(prompt)}
                className="ui-button"
              >
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                {prompt}
              </button>
            ))}
          </div>
        }
      />
    </div>
  );
}
