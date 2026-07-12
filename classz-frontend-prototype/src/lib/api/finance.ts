import { api } from "./client";

export type FinanceTransactionType = "payment" | "refund" | "topup" | "adjustment";
export type FinanceTransactionStatus = "pending" | "paid" | "refunded" | "rejected";
export type CouponDiscountType = "percent" | "fixed";
export type InvoiceStatus = "issued" | "paid" | "overdue" | "cancelled";
export type SubscriptionPlan = "free" | "pro" | "premium" | "enterprise";
export type SubscriptionStatus = "active" | "trial" | "expired" | "cancelled";
export type SubscriptionPaymentStatus = "paid" | "overdue" | "pending";
export type PayoutStatus = "pending" | "approved" | "rejected" | "paid";

export interface RevenueTrendPoint {
  month: string;
  gmv: number;
  platform_revenue: number;
}

export interface FinanceDashboard {
  gmv: number;
  platform_revenue: number;
  refunds: number;
  pending_payouts: number;
  active_subscriptions: number;
  mrr: number;
  platform_fee_percent: number;
  revenue_trend: RevenueTrendPoint[];
}

export interface FinanceTransaction {
  id: string;
  public_code: string;
  student_id: string;
  student_name: string;
  course_id: string | null;
  course_title: string | null;
  teacher_id: string | null;
  teacher_name: string | null;
  type: FinanceTransactionType;
  amount: number;
  status: FinanceTransactionStatus;
  coupon_code: string | null;
  note: string | null;
  created_at: string;
}

export interface TeacherRevenue {
  teacher_id: string;
  teacher_name: string;
  gross_revenue: number;
  platform_fee: number;
  net_revenue: number;
  refunds: number;
  paid_out: number;
  pending_payout: number;
  available_balance: number;
}

export interface Coupon {
  id: string;
  public_code: string;
  code: string;
  discount_type: CouponDiscountType;
  discount_value: number;
  course_id: string | null;
  course_title: string | null;
  max_redemptions: number | null;
  redemption_count: number;
  is_active: boolean;
  valid_from: string | null;
  valid_until: string | null;
  created_at: string;
}

export interface CouponCreatePayload {
  code: string;
  discount_type: CouponDiscountType;
  discount_value: number;
  course_id?: string | null;
  max_redemptions?: number | null;
  valid_from?: string | null;
  valid_until?: string | null;
}

export interface CouponUpdatePayload {
  is_active?: boolean;
  max_redemptions?: number | null;
  valid_until?: string | null;
}

export interface Invoice {
  id: string;
  public_code: string;
  user_id: string;
  user_name: string;
  user_role: string;
  course_id: string | null;
  course_title: string | null;
  amount: number;
  tax_amount: number;
  total_amount: number;
  status: InvoiceStatus;
  note: string | null;
  issued_at: string;
  paid_at: string | null;
}

export interface TeacherSubscription {
  id: string;
  teacher_id: string;
  teacher_name: string;
  plan: SubscriptionPlan;
  monthly_fee: number;
  status: SubscriptionStatus;
  payment_status: SubscriptionPaymentStatus;
  renewal_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface TeacherSubscriptionUpdatePayload {
  plan?: SubscriptionPlan;
  status?: SubscriptionStatus;
  record_payment?: boolean;
}

export interface PayoutRequest {
  id: string;
  public_code: string;
  teacher_id: string;
  teacher_name: string;
  amount: number;
  method: string;
  status: PayoutStatus;
  note: string | null;
  requested_at: string;
  decided_at: string | null;
}

export function getFinanceDashboard(): Promise<FinanceDashboard> {
  return api.get<FinanceDashboard>("/api/finance/dashboard");
}

export function listFinancePayments(): Promise<FinanceTransaction[]> {
  return api.get<FinanceTransaction[]>("/api/finance/payments");
}

export function listTeacherRevenue(): Promise<TeacherRevenue[]> {
  return api.get<TeacherRevenue[]>("/api/finance/teacher-revenue");
}

export function listInvoices(): Promise<Invoice[]> {
  return api.get<Invoice[]>("/api/finance/invoices");
}

export function listCoupons(): Promise<Coupon[]> {
  return api.get<Coupon[]>("/api/finance/coupons");
}

export function createCoupon(payload: CouponCreatePayload): Promise<Coupon> {
  return api.post<Coupon>("/api/finance/coupons", payload);
}

export function updateCoupon(couponId: string, payload: CouponUpdatePayload): Promise<Coupon> {
  return api.patch<Coupon>(`/api/finance/coupons/${encodeURIComponent(couponId)}`, payload);
}

export function deleteCoupon(couponId: string): Promise<void> {
  return api.delete<void>(`/api/finance/coupons/${encodeURIComponent(couponId)}`);
}

export function listSubscriptions(): Promise<TeacherSubscription[]> {
  return api.get<TeacherSubscription[]>("/api/finance/subscriptions");
}

export function updateSubscription(
  teacherId: string,
  payload: TeacherSubscriptionUpdatePayload,
): Promise<TeacherSubscription> {
  return api.patch<TeacherSubscription>(`/api/finance/subscriptions/${encodeURIComponent(teacherId)}`, payload);
}

export function listPayoutRequests(): Promise<PayoutRequest[]> {
  return api.get<PayoutRequest[]>("/api/finance/payouts");
}

export function decidePayoutRequest(
  payoutId: string,
  payload: { status: PayoutStatus; note?: string | null },
): Promise<PayoutRequest> {
  return api.post<PayoutRequest>(`/api/finance/payouts/${encodeURIComponent(payoutId)}/decide`, payload);
}
