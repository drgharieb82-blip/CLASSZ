import { api } from "./client";

export type WalletTransactionType = "payment" | "refund" | "topup" | "adjustment";
export type WalletTransactionStatus = "pending" | "paid" | "refunded" | "rejected";

export interface WalletTransactionRead {
  id: string;
  public_code: string;
  student_id: string;
  student_name: string;
  course_id: string | null;
  course_title: string | null;
  type: WalletTransactionType;
  amount: number;
  status: WalletTransactionStatus;
  coupon_code: string | null;
  note: string | null;
  created_at: string;
}

export interface WalletTransactionCreatePayload {
  student_id: string;
  course_id?: string | null;
  type: WalletTransactionType;
  amount: number;
  status?: WalletTransactionStatus;
  coupon_code?: string | null;
  note?: string | null;
}

export interface WalletTransactionUpdatePayload {
  status?: WalletTransactionStatus;
  note?: string | null;
}

export interface WalletRead {
  student_id: string;
  balance: number;
}

export interface WalletRechargePayload {
  amount: number;
  payment_method: string;
  note?: string | null;
}

export function listTransactions(courseId: string): Promise<WalletTransactionRead[]> {
  return api.get<WalletTransactionRead[]>(`/api/wallets/transactions?course_id=${encodeURIComponent(courseId)}`);
}

export function createTransaction(data: WalletTransactionCreatePayload): Promise<WalletTransactionRead> {
  return api.post<WalletTransactionRead>("/api/wallets/transactions", data);
}

export function updateTransaction(transactionId: string, data: WalletTransactionUpdatePayload): Promise<WalletTransactionRead> {
  return api.patch<WalletTransactionRead>(`/api/wallets/transactions/${encodeURIComponent(transactionId)}`, data);
}

export function getWallet(studentId: string): Promise<WalletRead> {
  return api.get<WalletRead>(`/api/wallets/${encodeURIComponent(studentId)}`);
}

export function getMyWallet(): Promise<WalletRead> {
  return api.get<WalletRead>("/api/wallets/me");
}

export function listMyWalletTransactions(): Promise<WalletTransactionRead[]> {
  return api.get<WalletTransactionRead[]>("/api/wallets/me/transactions");
}

export function rechargeMyWallet(payload: WalletRechargePayload): Promise<WalletTransactionRead> {
  return api.post<WalletTransactionRead>("/api/wallets/me/recharge", payload);
}
