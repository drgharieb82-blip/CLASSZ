const YEAR = new Date().getFullYear().toString().slice(-2);
const PREFIX = "CLS";

let counter = 0;
const assignedCodes = new Map<string, string>();

export function generateStudentCode(userId: string): string {
  const existing = assignedCodes.get(userId);
  if (existing) return existing;

  counter++;
  const code = `${PREFIX}-${YEAR}-${counter.toString().padStart(6, "0")}`;
  assignedCodes.set(userId, code);
  return code;
}

export function getStudentCode(userId: string): string {
  return assignedCodes.get(userId) ?? generateStudentCode(userId);
}

const mockStudentCodes: Record<string, string> = {
  "s1": "CLS-26-000001",
  "s2": "CLS-26-000002",
  "s3": "CLS-26-000003",
  "s4": "CLS-26-000004",
  "s5": "CLS-26-000005",
  "s6": "CLS-26-000006",
  "s7": "CLS-26-000007",
  "s8": "CLS-26-000008",
  "s9": "CLS-26-000009",
  "s10": "CLS-26-000010",
  "current": "CLS-26-000004",
};

export function getMockStudentCode(userId: string): string {
  return mockStudentCodes[userId] ?? getStudentCode(userId);
}

export function getCurrentStudentCode(): string {
  return mockStudentCodes["current"];
}

export function formatStudentCode(code: string): string {
  return code;
}

export function isValidStudentCode(code: string): boolean {
  return /^CLS-\d{2}-\d{6}$/.test(code);
}
