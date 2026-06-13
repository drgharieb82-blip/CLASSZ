export type ChatMessage = {
  id: string;
  conversationId: string;
  role: "student" | "teacher" | "assistant";
  content: string;
  createdAt: string;
  status?: "sending" | "sent" | "failed";
};

export type Conversation = {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
};

export type StudentWeakness = {
  id: string;
  studentId: string;
  conceptId: string;
  conceptName: string;
  score: number;
  severity: "low" | "medium" | "high";
};

export type RevisionSuggestion = {
  id: string;
  conceptId: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
};

export type QuestionExplanation = {
  id: string;
  questionId: string;
  conceptId: string;
  summary: string;
  steps: string[];
};
