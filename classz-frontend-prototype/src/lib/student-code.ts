/**
 * CLASSZ Global Identity - Frontend Display Layer
 *
 * This module defines code formats and provides display/validation utilities.
 * It does NOT generate codes for production use — that is the backend's responsibility.
 *
 * The CodeGeneratorService in backend/app/core/identity.py is the single source of truth.
 * Frontend only receives codes from the API and displays them.
 *
 * Mock generators below are TEMPORARY for prototype development only.
 */

export type EntityType =
  | "student" | "teacher" | "parent" | "assistant"
  | "developer" | "finance" | "admin"
  | "super_admin"
  | "course" | "chapter" | "session" | "question" | "quiz" | "assignment"
  | "certificate" | "payment" | "wallet_transaction"
  | "support_ticket" | "ai_request";

interface CodeFormat {
  prefix: string;
  sequenceDigits: number;
}

export const CODE_FORMATS: Record<EntityType, CodeFormat> = {
  student: { prefix: "CLS", sequenceDigits: 6 },
  teacher: { prefix: "TCH", sequenceDigits: 4 },
  parent: { prefix: "PRT", sequenceDigits: 4 },
  assistant: { prefix: "AST", sequenceDigits: 4 },
  developer: { prefix: "DEV", sequenceDigits: 4 },
  finance: { prefix: "FIN", sequenceDigits: 4 },
  admin: { prefix: "ADM", sequenceDigits: 4 },
  super_admin: { prefix: "SUP", sequenceDigits: 4 },
  course: { prefix: "CRS", sequenceDigits: 4 },
  chapter: { prefix: "CHP", sequenceDigits: 4 },
  session: { prefix: "SES", sequenceDigits: 4 },
  question: { prefix: "QST", sequenceDigits: 6 },
  quiz: { prefix: "QZ", sequenceDigits: 4 },
  assignment: { prefix: "ASN", sequenceDigits: 4 },
  certificate: { prefix: "CERT", sequenceDigits: 6 },
  payment: { prefix: "PAY", sequenceDigits: 6 },
  wallet_transaction: { prefix: "WLT", sequenceDigits: 6 },
  support_ticket: { prefix: "TKT", sequenceDigits: 4 },
  ai_request: { prefix: "AIR", sequenceDigits: 6 },
};

// --- Display & Validation (production-safe) ---

export function formatPublicCode(code: string): string {
  return code;
}

export function isValidPublicCode(code: string): boolean {
  return /^[A-Z]{2,4}-\d{2}-\d{4,6}$/.test(code);
}

export function parsePublicCode(code: string): { prefix: string; year: number; sequence: number } | null {
  const parts = code.split("-");
  if (parts.length !== 3) return null;
  const prefix = parts[0];
  const year = parseInt(parts[1], 10);
  const sequence = parseInt(parts[2], 10);
  if (isNaN(year) || isNaN(sequence)) return null;
  return { prefix, year, sequence };
}

export function getEntityTypeFromCode(code: string): EntityType | null {
  const parsed = parsePublicCode(code);
  if (!parsed) return null;
  for (const [type, fmt] of Object.entries(CODE_FORMATS)) {
    if (fmt.prefix === parsed.prefix) return type as EntityType;
  }
  return null;
}

// --- Mock Generator (TEMPORARY - for prototype/dev only) ---
// In production, codes come exclusively from backend API responses.

const mockCounters: Record<string, number> = {};

export function mockGenerateCode(entityType: EntityType, year?: number): string {
  const fmt = CODE_FORMATS[entityType];
  const yy = year ?? new Date().getFullYear() % 100;
  const key = `${entityType}:${yy}`;
  mockCounters[key] = (mockCounters[key] ?? 0) + 1;
  return `${fmt.prefix}-${yy.toString().padStart(2, "0")}-${mockCounters[key].toString().padStart(fmt.sequenceDigits, "0")}`;
}

// Pre-assigned mock codes for current demo user
export function getCurrentStudentCode(): string {
  return "CLS-26-000004";
}

// Legacy compat
export function generateStudentCode(_userId: string): string {
  return mockGenerateCode("student");
}
