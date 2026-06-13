import { useCallback, useEffect, useState } from "react";

import { assistantProvider } from "../services";
import type { ChatMessage, QuestionExplanation, RevisionSuggestion, StudentWeakness } from "../types";

type AssistantConversationState = {
  messages: ChatMessage[];
  input: string;
  loading: boolean;
  error: string | null;
  sending: boolean;
  weaknesses: StudentWeakness[];
  revisionSuggestions: RevisionSuggestion[];
  questionExplanation: QuestionExplanation | null;
  setInput: (value: string) => void;
  sendMessage: (message?: string) => Promise<void>;
  retry: () => Promise<void>;
  clearConversation: () => void;
};

const fallbackError = "Assistant mock data could not be loaded. Please try again.";

export function useAssistantConversation(): AssistantConversationState {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [weaknesses, setWeaknesses] = useState<StudentWeakness[]>([]);
  const [revisionSuggestions, setRevisionSuggestions] = useState<RevisionSuggestion[]>([]);
  const [questionExplanation, setQuestionExplanation] = useState<QuestionExplanation | null>(null);

  const loadConversation = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [conversation, weaknessAnalysis, suggestions, explanation] = await Promise.all([
        assistantProvider.getConversation(),
        assistantProvider.getWeaknessAnalysis(),
        assistantProvider.getRevisionSuggestions(),
        assistantProvider.getQuestionExplanation(),
      ]);

      setMessages(conversation.messages);
      setWeaknesses(weaknessAnalysis);
      setRevisionSuggestions(suggestions);
      setQuestionExplanation(explanation);
    } catch {
      setError(fallbackError);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadConversation();
  }, [loadConversation]);

  const sendMessage = useCallback(
    async (message?: string) => {
      const content = (message ?? input).trim();
      if (!content || sending) {
        return;
      }

      setInput("");
      setSending(true);
      setError(null);

      try {
        const { userMessage, assistantMessage } = await assistantProvider.sendMessage(content);
        setMessages((currentMessages) => [...currentMessages, userMessage, assistantMessage]);
      } catch {
        setInput(content);
        setError("Message could not be sent in mock mode. Please retry.");
      } finally {
        setSending(false);
      }
    },
    [input, sending],
  );

  const clearConversation = useCallback(() => {
    setMessages([]);
    setInput("");
    setError(null);
    setSending(false);
  }, []);

  return {
    messages,
    input,
    loading,
    error,
    sending,
    weaknesses,
    revisionSuggestions,
    questionExplanation,
    setInput,
    sendMessage,
    retry: loadConversation,
    clearConversation,
  };
}
