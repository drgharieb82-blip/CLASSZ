export interface SaleRecord {
  id: string; studentName: string; product: string; course: string; amount: number;
  paymentMethod: string; date: string; status: "completed" | "pending" | "failed" | "refunded";
}

export interface OrderRecord {
  id: string; studentName: string; course: string; items: string; amount: number;
  date: string; status: "pending" | "paid" | "failed" | "refunded" | "cancelled";
}

export interface CouponRecord {
  id: string; code: string; discountType: "percentage" | "fixed"; discountValue: number;
  course: string; uses: number; maxUses: number; expires: string; active: boolean;
}

export interface SubscriptionPlan {
  id: string; name: string; period: "monthly" | "quarterly" | "yearly" | "custom";
  price: number; activeSubs: number; expiredSubs: number; revenue: number;
}

export interface PayoutRecord {
  id: string; amount: number; method: string; accountInfo: string;
  requestedAt: string; processedAt: string; status: "pending" | "processing" | "completed" | "rejected";
}

export interface ExpenseRecord {
  id: string; category: string; description: string; amount: number; date: string; recurring: boolean;
}

export interface InvoiceRecord {
  id: string; studentName: string; course: string; amount: number; tax: number;
  total: number; date: string; status: "issued" | "paid" | "overdue";
}

export interface CampaignRecord {
  id: string; name: string; type: string; budget: number; spent: number;
  leads: number; conversions: number; status: "active" | "paused" | "ended";
}

export const revenueStats = {
  todayRevenue: 2450, monthlyRevenue: 68400, pendingRevenue: 8200,
  availableBalance: 42800, withdrawable: 38500, refunds: 1200, netProfit: 54600,
  dailyRevenue: [1800, 2200, 1950, 2450, 2100, 2800, 2450],
  monthlyTrend: [
    { month: "Jan", revenue: 42000 }, { month: "Feb", revenue: 48000 },
    { month: "Mar", revenue: 52000 }, { month: "Apr", revenue: 55000 },
    { month: "May", revenue: 61000 }, { month: "Jun", revenue: 68400 },
  ],
};

export const sales: SaleRecord[] = [
  { id: "SAL-001", studentName: "Aya Mansour", product: "Full Course", course: "Advanced Mathematics", amount: 200, paymentMethod: "Visa", date: "2026-06-23", status: "completed" },
  { id: "SAL-002", studentName: "Omar Tarek", product: "Session Pack", course: "Advanced Mathematics", amount: 80, paymentMethod: "Wallet", date: "2026-06-23", status: "completed" },
  { id: "SAL-003", studentName: "Lina Fares", product: "Full Course", course: "Calculus Masterclass", amount: 250, paymentMethod: "Visa", date: "2026-06-22", status: "completed" },
  { id: "SAL-004", studentName: "Karim Adel", product: "Single Session", course: "Advanced Mathematics", amount: 25, paymentMethod: "Vodafone Cash", date: "2026-06-22", status: "pending" },
  { id: "SAL-005", studentName: "Tamer Gamal", product: "Full Course", course: "Statistics & Probability", amount: 180, paymentMethod: "InstaPay", date: "2026-06-21", status: "completed" },
  { id: "SAL-006", studentName: "Ali Shaker", product: "Session Pack", course: "Calculus Masterclass", amount: 80, paymentMethod: "Wallet", date: "2026-06-21", status: "failed" },
  { id: "SAL-007", studentName: "Mariam Lotfy", product: "Full Course", course: "Statistics & Probability", amount: 180, paymentMethod: "Visa", date: "2026-06-20", status: "completed" },
  { id: "SAL-008", studentName: "Sara Mahmoud", product: "Single Session", course: "Advanced Mathematics", amount: 25, paymentMethod: "Wallet", date: "2026-06-20", status: "refunded" },
  { id: "SAL-009", studentName: "Hadi Wael", product: "Full Course", course: "Advanced Mathematics", amount: 200, paymentMethod: "Mastercard", date: "2026-06-19", status: "completed" },
  { id: "SAL-010", studentName: "Nour Sami", product: "Session Pack", course: "Statistics & Probability", amount: 60, paymentMethod: "Vodafone Cash", date: "2026-06-19", status: "completed" },
];

export const orders: OrderRecord[] = sales.map((s, i) => ({
  id: `ORD-${String(i + 1).padStart(3, "0")}`, studentName: s.studentName,
  course: s.course, items: s.product, amount: s.amount, date: s.date,
  status: (s.status === "completed" ? "paid" : s.status) as OrderRecord["status"],
}));

export const coupons: CouponRecord[] = [
  { id: "CPN-001", code: "MATH100", discountType: "percentage", discountValue: 100, course: "Advanced Mathematics", uses: 5, maxUses: 10, expires: "2026-07-01", active: true },
  { id: "CPN-002", code: "TOP10", discountType: "percentage", discountValue: 50, course: "All Courses", uses: 8, maxUses: 20, expires: "2026-06-30", active: true },
  { id: "CPN-003", code: "SUMMER2026", discountType: "percentage", discountValue: 30, course: "All Courses", uses: 120, maxUses: 500, expires: "2026-08-31", active: true },
  { id: "CPN-004", code: "CALC25", discountType: "fixed", discountValue: 25, course: "Calculus Masterclass", uses: 15, maxUses: 50, expires: "2026-07-15", active: true },
  { id: "CPN-005", code: "WELCOME", discountType: "percentage", discountValue: 20, course: "All Courses", uses: 340, maxUses: 1000, expires: "2026-12-31", active: true },
  { id: "CPN-006", code: "EXPIRED50", discountType: "percentage", discountValue: 50, course: "All Courses", uses: 45, maxUses: 100, expires: "2026-04-01", active: false },
];

export const subscriptionPlans: SubscriptionPlan[] = [
  { id: "SUB-M", name: "Monthly", period: "monthly", price: 49, activeSubs: 320, expiredSubs: 85, revenue: 15680 },
  { id: "SUB-Q", name: "Quarterly", period: "quarterly", price: 129, activeSubs: 180, expiredSubs: 42, revenue: 23220 },
  { id: "SUB-Y", name: "Yearly", period: "yearly", price: 399, activeSubs: 95, expiredSubs: 20, revenue: 37905 },
  { id: "SUB-C", name: "VIP Lifetime", period: "custom", price: 799, activeSubs: 12, expiredSubs: 0, revenue: 9588 },
];

export const payouts: PayoutRecord[] = [
  { id: "PAY-001", amount: 15000, method: "Bank Transfer", accountInfo: "CIB •••4521", requestedAt: "2026-06-20", processedAt: "2026-06-22", status: "completed" },
  { id: "PAY-002", amount: 8000, method: "Vodafone Cash", accountInfo: "+20 100•••567", requestedAt: "2026-06-22", processedAt: "", status: "processing" },
  { id: "PAY-003", amount: 5000, method: "InstaPay", accountInfo: "tarek@instapay", requestedAt: "2026-06-23", processedAt: "", status: "pending" },
  { id: "PAY-004", amount: 12000, method: "Bank Transfer", accountInfo: "CIB •••4521", requestedAt: "2026-06-10", processedAt: "2026-06-12", status: "completed" },
  { id: "PAY-005", amount: 3000, method: "Vodafone Cash", accountInfo: "+20 100•••567", requestedAt: "2026-06-05", processedAt: "2026-06-06", status: "completed" },
];

export const expenses: ExpenseRecord[] = [
  { id: "EXP-001", category: "Salaries", description: "Team salaries — June", amount: 22000, date: "2026-06-01", recurring: true },
  { id: "EXP-002", category: "Ads", description: "Facebook Ads — June", amount: 5500, date: "2026-06-01", recurring: true },
  { id: "EXP-003", category: "Ads", description: "Google Ads — June", amount: 3200, date: "2026-06-01", recurring: true },
  { id: "EXP-004", category: "Video Editing", description: "Freelancer — 15 sessions", amount: 4500, date: "2026-06-10", recurring: false },
  { id: "EXP-005", category: "Tools", description: "Zoom Pro + Canva Pro", amount: 800, date: "2026-06-01", recurring: true },
  { id: "EXP-006", category: "Printing", description: "PDF booklets — 500 copies", amount: 2000, date: "2026-06-15", recurring: false },
  { id: "EXP-007", category: "Other", description: "Domain renewal + hosting", amount: 600, date: "2026-06-05", recurring: true },
];

export const invoices: InvoiceRecord[] = [
  { id: "INV-001", studentName: "Aya Mansour", course: "Advanced Mathematics", amount: 200, tax: 28, total: 228, date: "2026-06-01", status: "paid" },
  { id: "INV-002", studentName: "Lina Fares", course: "Calculus Masterclass", amount: 250, tax: 35, total: 285, date: "2026-06-05", status: "paid" },
  { id: "INV-003", studentName: "Tamer Gamal", course: "Statistics & Probability", amount: 180, tax: 25.2, total: 205.2, date: "2026-06-10", status: "paid" },
  { id: "INV-004", studentName: "Karim Adel", course: "Advanced Mathematics", amount: 25, tax: 3.5, total: 28.5, date: "2026-06-22", status: "issued" },
  { id: "INV-005", studentName: "Ali Shaker", course: "Advanced Mathematics", amount: 200, tax: 28, total: 228, date: "2026-05-20", status: "overdue" },
];

export const campaigns: CampaignRecord[] = [
  { id: "CMP-001", name: "Summer Math Boost", type: "Facebook", budget: 5000, spent: 3200, leads: 450, conversions: 85, status: "active" },
  { id: "CMP-002", name: "Calculus Launch", type: "Google", budget: 3000, spent: 2800, leads: 320, conversions: 62, status: "active" },
  { id: "CMP-003", name: "Referral Program", type: "Organic", budget: 0, spent: 0, leads: 180, conversions: 45, status: "active" },
  { id: "CMP-004", name: "Ramadan Promo", type: "Facebook", budget: 4000, spent: 4000, leads: 600, conversions: 120, status: "ended" },
  { id: "CMP-005", name: "Instagram Stories", type: "Instagram", budget: 2000, spent: 800, leads: 150, conversions: 22, status: "paused" },
];

export const revenueShares = [
  { id: "RS-001", memberName: "Mr. Tarek Nabil", role: "Assistant Teacher", shareType: "percentage" as const, shareValue: 15, earned: 12450, paid: 9800, pending: 2650 },
  { id: "RS-002", memberName: "Sara Adel", role: "Content Manager", shareType: "fixed" as const, shareValue: 3500, earned: 14000, paid: 14000, pending: 0 },
  { id: "RS-003", memberName: "Dina Youssef", role: "Assistant Teacher", shareType: "percentage" as const, shareValue: 12, earned: 9960, paid: 7200, pending: 2760 },
  { id: "RS-004", memberName: "Ahmed Kamal", role: "Assistant Teacher", shareType: "percentage" as const, shareValue: 10, earned: 6840, paid: 5000, pending: 1840 },
  { id: "RS-005", memberName: "Platform Fee", role: "Platform", shareType: "percentage" as const, shareValue: 15, earned: 10260, paid: 10260, pending: 0 },
];
