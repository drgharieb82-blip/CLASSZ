import type { ChatMessage, Conversation, QuestionExplanation, RevisionSuggestion, StudentWeakness } from "../types";

const conversationId = "mock-assistant-conversation";

const delay = () => 300 + Math.floor(Math.random() * 501);

function simulateApi<T>(data: T): Promise<T> {
  return new Promise((resolve) => {
    window.setTimeout(() => resolve(data), delay());
  });
}

function createMessage(role: ChatMessage["role"], content: string): ChatMessage {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    conversationId,
    role,
    content,
    createdAt: new Date().toISOString(),
    status: "sent",
  };
}

const conversation: Conversation = {
  id: conversationId,
  title: "Electrochemistry support",
  createdAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
  updatedAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
  messages: [
    {
      id: "mock-1",
      conversationId,
      role: "student",
      content: "Explain oxidation number.",
      createdAt: new Date(Date.now() - 1000 * 60 * 16).toISOString(),
      status: "sent",
    },
    {
      id: "mock-2",
      conversationId,
      role: "assistant",
      content: "Oxidation number represents the apparent charge of an atom inside a compound. It helps track electron movement in redox reactions.",
      createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      status: "sent",
    },
    {
      id: "mock-3",
      conversationId,
      role: "student",
      content: "Generate practice questions.",
      createdAt: new Date(Date.now() - 1000 * 60 * 11).toISOString(),
      status: "sent",
    },
    {
      id: "mock-4",
      conversationId,
      role: "assistant",
      content: "Try balancing the following redox reaction, then identify which element is oxidized and which is reduced: Fe2+ + MnO4- -> Fe3+ + Mn2+.",
      createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
      status: "sent",
    },
  ],
};

const weaknesses: StudentWeakness[] = [
  {
    id: "weakness-1",
    studentId: "student-1",
    conceptId: "electrochemistry",
    conceptName: "Electrochemistry",
    concept: "Electrochemistry",
    score: 62,
    severity: "medium",
    confidenceLevel: "medium",
    priority: "medium",
    progress: 62,
    recommendation: "Review the difference between oxidation and reduction, then solve mixed redox examples.",
  },
  {
    id: "weakness-2",
    studentId: "student-1",
    conceptId: "oxidation-number",
    conceptName: "Oxidation Number",
    concept: "Oxidation Number",
    score: 35,
    severity: "high",
    confidenceLevel: "low",
    priority: "high",
    progress: 35,
    recommendation: "Review lesson 3 and solve 10 practice questions.",
  },
  {
    id: "weakness-3",
    studentId: "student-1",
    conceptId: "galvanic-cell",
    conceptName: "Galvanic Cell",
    concept: "Galvanic Cell",
    score: 71,
    severity: "low",
    confidenceLevel: "high",
    priority: "low",
    progress: 71,
    recommendation: "Rewatch the salt bridge section and complete two diagram labeling questions.",
  },
];

const revisionSuggestions: RevisionSuggestion[] = [
  {
    id: "revision-1",
    conceptId: "oxidation-number",
    title: "Review Oxidation Number.",
    description: "Revisit the rules for assigning oxidation numbers in neutral compounds and polyatomic ions.",
    priority: "high",
  },
  {
    id: "revision-2",
    conceptId: "electrochemistry",
    title: "Solve 10 practice questions.",
    description: "Focus on mixed redox questions that require identifying oxidation and reduction before balancing.",
    priority: "medium",
  },
  {
    id: "revision-3",
    conceptId: "galvanic-cell",
    title: "Watch lesson 3 again.",
    description: "Review the anode, cathode, salt bridge, and electron flow explanation before the next quiz.",
    priority: "medium",
  },
];

const questionExplanation: QuestionExplanation = {
  id: "explanation-1",
  questionId: "redox-question-12",
  conceptId: "oxidation-number",
  questionTitle: "Which element is reduced in the redox reaction Fe2+ + MnO4- -> Fe3+ + Mn2+?",
  selectedAnswer: "Iron is reduced because Fe2+ becomes Fe3+.",
  correctAnswer: "Manganese is reduced because Mn changes from +7 in MnO4- to +2 in Mn2+.",
  wrongExplanation:
    "The selected answer is wrong because Fe2+ loses an electron and becomes Fe3+. Losing electrons means oxidation, not reduction.",
  correctExplanation:
    "The correct answer is manganese because its oxidation number decreases from +7 to +2. A decrease in oxidation number means the atom gained electrons and was reduced.",
  relatedConcept: "Oxidation Number",
  difficulty: "medium",
  summary:
    "The selected answer is wrong because it treats oxygen as changing oxidation number, but oxygen remains -2 in this reaction. The correct answer focuses on manganese, which decreases from +7 to +2, so it is reduced.",
  steps: [
    "Assign oxidation numbers to each element before and after the reaction.",
    "Compare the oxidation number changes instead of only looking at the compound charge.",
    "The element with a lower oxidation number after the reaction is reduced.",
    "The correct answer is correct because Mn gains electrons, moving from +7 to +2.",
  ],
};

function buildAssistantReply(message: string): ChatMessage {
  const normalizedMessage = message.toLowerCase();

  if (normalizedMessage.includes("practice") || normalizedMessage.includes("question")) {
    return createMessage(
      "assistant",
      "Try these: 1. Find the oxidation number of Mn in KMnO4. 2. Identify the oxidized element in Zn + Cu2+ -> Zn2+ + Cu. 3. Explain electron flow in a galvanic cell.",
    );
  }

  if (normalizedMessage.includes("wrong") || normalizedMessage.includes("answer")) {
    return createMessage(
      "assistant",
      "Your selected answer is likely wrong because it tracks the compound charge instead of the atom oxidation number. Check which atom actually gains or loses electrons.",
    );
  }

  if (normalizedMessage.includes("oxidation")) {
    return createMessage(
      "assistant",
      "Oxidation number is the apparent charge assigned to an atom. In redox lessons, it helps you detect which element lost electrons and which gained electrons.",
    );
  }

  return createMessage(
    "assistant",
    "A clear way to teach this is to start with the concept rule, solve one small example, then ask students to explain the reason behind each step.",
  );
}

export const assistantService = {
  getConversation() {
    return simulateApi(conversation);
  },

  async sendMessage(message: string) {
    const userMessage = createMessage("student", message);
    const assistantMessage = buildAssistantReply(message);

    return simulateApi({
      userMessage,
      assistantMessage,
    });
  },

  getWeaknessAnalysis() {
    return simulateApi(weaknesses);
  },

  getRevisionSuggestions() {
    return simulateApi(revisionSuggestions);
  },

  getQuestionExplanation() {
    return simulateApi(questionExplanation);
  },
};
