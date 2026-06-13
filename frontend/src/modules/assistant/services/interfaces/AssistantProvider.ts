import type { Conversation, QuestionExplanation, RevisionSuggestion, StudentWeakness, ChatMessage } from "../../types";

export type SendMessageResult = {
  userMessage: ChatMessage;
  assistantMessage: ChatMessage;
};

export type AssistantProvider = {
  getConversation: () => Promise<Conversation>;
  sendMessage: (message: string) => Promise<SendMessageResult>;
  getWeaknessAnalysis: () => Promise<StudentWeakness[]>;
  getRevisionSuggestions: () => Promise<RevisionSuggestion[]>;
  getQuestionExplanation: () => Promise<QuestionExplanation>;
};
