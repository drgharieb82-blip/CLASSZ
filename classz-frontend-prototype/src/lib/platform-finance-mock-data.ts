// ── Platform Finance Mock Data ──
// Company-level finance for CLASSZ across ALL academies

export interface PlatformTransaction {
  id: string;
  date: string;
  teacher: string;
  academy: string;
  student: string;
  product: string;
  amount: number;
  platformFee: number;
  netTeacherAmount: number;
  paymentMethod: string;
  status: "completed" | "pending" | "failed" | "refunded";
}

export interface TeacherRevenueRecord {
  id: string;
  teacher: string;
  academy: string;
  grossRevenue: number;
  platformFee: number;
  netRevenue: number;
  pendingBalance: number;
  paidBalance: number;
  refunds: number;
  status: "active" | "suspended" | "pending-review";
}

export interface PlatformWithdrawal {
  id: string;
  teacher: string;
  academy: string;
  amount: number;
  method: string;
  requestedAt: string;
  status: "pending" | "approved" | "rejected" | "paid" | "failed";
  riskFlag: "none" | "low" | "medium" | "high";
  approvedBy: string;
}

export interface PlatformSubscription {
  id: string;
  teacher: string;
  academy: string;
  plan: "Free" | "Pro" | "Premium" | "Enterprise";
  monthlyFee: number;
  status: "active" | "expired" | "cancelled" | "trial";
  renewalDate: string;
  paymentStatus: "paid" | "overdue" | "pending";
}

export interface PlatformInvoice {
  id: string;
  relatedUser: string;
  userType: "teacher" | "student" | "platform";
  academy: string;
  amount: number;
  tax: number;
  status: "issued" | "paid" | "overdue" | "cancelled";
  date: string;
}

export interface PlatformExpense {
  id: string;
  category: string;
  description: string;
  amount: number;
  date: string;
  recurring: boolean;
  approvedBy: string;
}

export interface AffiliatePayoutRecord {
  id: string;
  affiliate: string;
  clicks: number;
  leads: number;
  sales: number;
  commission: number;
  paid: number;
  pending: number;
  status: "active" | "pending" | "paid" | "suspended";
}

export interface FinancialAuditLog {
  id: string;
  action: string;
  actionType: "withdrawal" | "refund" | "invoice" | "subscription" | "adjustment" | "expense" | "tax";
  description: string;
  admin: string;
  teacher: string;
  academy: string;
  amount: number;
  date: string;
}

// ── Stats ──

export const platformFinanceStats = {
  gmv: 2_840_000,
  platformRevenue: 426_000,
  pendingWithdrawals: 89_200,
  monthlyGrowth: 14.2,
  activeSubscriptions: 1_247,
  refunds: 12_400,
  expenses: 184_000,
  netProfit: 242_000,
};

export const subscriptionMetrics = {
  active: 1_247,
  expired: 328,
  churn: 4.8,
  mrr: 62_350,
  arr: 748_200,
  upgrades: 89,
  downgrades: 23,
};

export const taxSummary = {
  taxableRevenue: 426_000,
  deductibleExpenses: 184_000,
  netTax: 36_300,
  vatRate: 15,
};

export const expenseSummary = {
  monthly: 184_000,
  servers: 24_500,
  marketing: 48_000,
  payroll: 82_000,
  netProfit: 242_000,
};

// ── Revenue Trend ──
export const revenueTrend = [
  { month: "Jan", gmv: 380_000, platformRevenue: 57_000, expenses: 28_000 },
  { month: "Feb", gmv: 410_000, platformRevenue: 61_500, expenses: 29_500 },
  { month: "Mar", gmv: 445_000, platformRevenue: 66_750, expenses: 30_200 },
  { month: "Apr", gmv: 468_000, platformRevenue: 70_200, expenses: 31_000 },
  { month: "May", gmv: 502_000, platformRevenue: 75_300, expenses: 32_800 },
  { month: "Jun", gmv: 635_000, platformRevenue: 95_250, expenses: 32_500 },
];

export const platformFeeDistribution = [
  { source: "Course Sales", pct: 52, color: "bg-blue-500" },
  { source: "Session Packs", pct: 18, color: "bg-violet-500" },
  { source: "Subscriptions", pct: 15, color: "bg-emerald-500" },
  { source: "Single Sessions", pct: 10, color: "bg-amber-500" },
  { source: "Other", pct: 5, color: "bg-slate-400" },
];

export const topEarningTeachers = [
  { name: "Dr. Ahmed Kamal", academy: "Math Masters Academy", revenue: 124_000, fee: 18_600 },
  { name: "Prof. Sara Nabil", academy: "Science Hub", revenue: 98_500, fee: 14_775 },
  { name: "Mr. Tarek Mostafa", academy: "Physics Pro", revenue: 87_200, fee: 13_080 },
  { name: "Ms. Dina Farouk", academy: "Chemistry World", revenue: 76_800, fee: 11_520 },
  { name: "Dr. Omar Hassan", academy: "Bio Academy", revenue: 68_400, fee: 10_260 },
];

export const revenueBySource = [
  { source: "Platform Fees", amount: 284_000, pct: 66.7 },
  { source: "Teacher Subscriptions", amount: 62_350, pct: 14.6 },
  { source: "Ads Revenue", amount: 38_200, pct: 9.0 },
  { source: "Affiliate Revenue", amount: 24_800, pct: 5.8 },
  { source: "Enterprise Plans", amount: 16_650, pct: 3.9 },
];

// ── Transactions ──
export const platformTransactions: PlatformTransaction[] = [
  { id: "TXN-10001", date: "2026-06-24", teacher: "Dr. Ahmed Kamal", academy: "Math Masters Academy", student: "Aya Mansour", product: "Full Course", amount: 200, platformFee: 30, netTeacherAmount: 170, paymentMethod: "Visa", status: "completed" },
  { id: "TXN-10002", date: "2026-06-24", teacher: "Prof. Sara Nabil", academy: "Science Hub", student: "Omar Tarek", product: "Session Pack", amount: 80, platformFee: 12, netTeacherAmount: 68, paymentMethod: "Wallet", status: "completed" },
  { id: "TXN-10003", date: "2026-06-23", teacher: "Mr. Tarek Mostafa", academy: "Physics Pro", student: "Lina Fares", product: "Full Course", amount: 250, platformFee: 37.5, netTeacherAmount: 212.5, paymentMethod: "Mastercard", status: "completed" },
  { id: "TXN-10004", date: "2026-06-23", teacher: "Dr. Ahmed Kamal", academy: "Math Masters Academy", student: "Karim Adel", product: "Single Session", amount: 25, platformFee: 3.75, netTeacherAmount: 21.25, paymentMethod: "Vodafone Cash", status: "pending" },
  { id: "TXN-10005", date: "2026-06-22", teacher: "Ms. Dina Farouk", academy: "Chemistry World", student: "Tamer Gamal", product: "Full Course", amount: 180, platformFee: 27, netTeacherAmount: 153, paymentMethod: "InstaPay", status: "completed" },
  { id: "TXN-10006", date: "2026-06-22", teacher: "Prof. Sara Nabil", academy: "Science Hub", student: "Ali Shaker", product: "Session Pack", amount: 80, platformFee: 12, netTeacherAmount: 68, paymentMethod: "Wallet", status: "failed" },
  { id: "TXN-10007", date: "2026-06-21", teacher: "Dr. Omar Hassan", academy: "Bio Academy", student: "Mariam Lotfy", product: "Full Course", amount: 180, platformFee: 27, netTeacherAmount: 153, paymentMethod: "Visa", status: "completed" },
  { id: "TXN-10008", date: "2026-06-21", teacher: "Mr. Tarek Mostafa", academy: "Physics Pro", student: "Sara Mahmoud", product: "Single Session", amount: 25, platformFee: 3.75, netTeacherAmount: 21.25, paymentMethod: "Wallet", status: "refunded" },
  { id: "TXN-10009", date: "2026-06-20", teacher: "Dr. Ahmed Kamal", academy: "Math Masters Academy", student: "Hadi Wael", product: "Full Course", amount: 200, platformFee: 30, netTeacherAmount: 170, paymentMethod: "Mastercard", status: "completed" },
  { id: "TXN-10010", date: "2026-06-20", teacher: "Ms. Dina Farouk", academy: "Chemistry World", student: "Nour Ibrahim", product: "Session Pack", amount: 95, platformFee: 14.25, netTeacherAmount: 80.75, paymentMethod: "Visa", status: "completed" },
  { id: "TXN-10011", date: "2026-06-19", teacher: "Prof. Sara Nabil", academy: "Science Hub", student: "Yasmin Reda", product: "Full Course", amount: 220, platformFee: 33, netTeacherAmount: 187, paymentMethod: "InstaPay", status: "completed" },
  { id: "TXN-10012", date: "2026-06-19", teacher: "Dr. Omar Hassan", academy: "Bio Academy", student: "Mohamed Sami", product: "Single Session", amount: 30, platformFee: 4.5, netTeacherAmount: 25.5, paymentMethod: "Vodafone Cash", status: "pending" },
];

// ── Teacher Revenue ──
export const teacherRevenueRecords: TeacherRevenueRecord[] = [
  { id: "TR-001", teacher: "Dr. Ahmed Kamal", academy: "Math Masters Academy", grossRevenue: 124_000, platformFee: 18_600, netRevenue: 105_400, pendingBalance: 8_200, paidBalance: 97_200, refunds: 1_200, status: "active" },
  { id: "TR-002", teacher: "Prof. Sara Nabil", academy: "Science Hub", grossRevenue: 98_500, platformFee: 14_775, netRevenue: 83_725, pendingBalance: 5_400, paidBalance: 78_325, refunds: 800, status: "active" },
  { id: "TR-003", teacher: "Mr. Tarek Mostafa", academy: "Physics Pro", grossRevenue: 87_200, platformFee: 13_080, netRevenue: 74_120, pendingBalance: 12_500, paidBalance: 61_620, refunds: 2_100, status: "active" },
  { id: "TR-004", teacher: "Ms. Dina Farouk", academy: "Chemistry World", grossRevenue: 76_800, platformFee: 11_520, netRevenue: 65_280, pendingBalance: 4_800, paidBalance: 60_480, refunds: 600, status: "active" },
  { id: "TR-005", teacher: "Dr. Omar Hassan", academy: "Bio Academy", grossRevenue: 68_400, platformFee: 10_260, netRevenue: 58_140, pendingBalance: 3_200, paidBalance: 54_940, refunds: 400, status: "active" },
  { id: "TR-006", teacher: "Mr. Youssef Ali", academy: "Arabic Academy", grossRevenue: 54_200, platformFee: 8_130, netRevenue: 46_070, pendingBalance: 6_100, paidBalance: 39_970, refunds: 1_800, status: "pending-review" },
  { id: "TR-007", teacher: "Ms. Reem Khaled", academy: "English Masters", grossRevenue: 42_800, platformFee: 6_420, netRevenue: 36_380, pendingBalance: 2_800, paidBalance: 33_580, refunds: 300, status: "active" },
  { id: "TR-008", teacher: "Dr. Hossam Magdy", academy: "History Hub", grossRevenue: 38_600, platformFee: 5_790, netRevenue: 32_810, pendingBalance: 0, paidBalance: 32_810, refunds: 0, status: "suspended" },
];

// ── Withdrawals ──
export const platformWithdrawals: PlatformWithdrawal[] = [
  { id: "WD-5001", teacher: "Dr. Ahmed Kamal", academy: "Math Masters Academy", amount: 8_200, method: "Bank Transfer", requestedAt: "2026-06-24", status: "pending", riskFlag: "none", approvedBy: "-" },
  { id: "WD-5002", teacher: "Mr. Tarek Mostafa", academy: "Physics Pro", amount: 12_500, method: "Bank Transfer", requestedAt: "2026-06-23", status: "pending", riskFlag: "medium", approvedBy: "-" },
  { id: "WD-5003", teacher: "Prof. Sara Nabil", academy: "Science Hub", amount: 5_400, method: "InstaPay", requestedAt: "2026-06-22", status: "approved", riskFlag: "none", approvedBy: "Admin Ali" },
  { id: "WD-5004", teacher: "Ms. Dina Farouk", academy: "Chemistry World", amount: 4_800, method: "Vodafone Cash", requestedAt: "2026-06-21", status: "paid", riskFlag: "none", approvedBy: "Admin Ali" },
  { id: "WD-5005", teacher: "Mr. Youssef Ali", academy: "Arabic Academy", amount: 6_100, method: "Bank Transfer", requestedAt: "2026-06-20", status: "rejected", riskFlag: "high", approvedBy: "Admin Sara" },
  { id: "WD-5006", teacher: "Dr. Omar Hassan", academy: "Bio Academy", amount: 3_200, method: "InstaPay", requestedAt: "2026-06-19", status: "paid", riskFlag: "none", approvedBy: "Admin Ali" },
  { id: "WD-5007", teacher: "Ms. Reem Khaled", academy: "English Masters", amount: 2_800, method: "Bank Transfer", requestedAt: "2026-06-18", status: "paid", riskFlag: "low", approvedBy: "Admin Sara" },
  { id: "WD-5008", teacher: "Dr. Hossam Magdy", academy: "History Hub", amount: 4_500, method: "Vodafone Cash", requestedAt: "2026-06-17", status: "failed", riskFlag: "none", approvedBy: "Admin Ali" },
];

// ── Subscriptions ──
export const platformSubscriptions: PlatformSubscription[] = [
  { id: "SUB-001", teacher: "Dr. Ahmed Kamal", academy: "Math Masters Academy", plan: "Premium", monthlyFee: 99, status: "active", renewalDate: "2026-07-15", paymentStatus: "paid" },
  { id: "SUB-002", teacher: "Prof. Sara Nabil", academy: "Science Hub", plan: "Pro", monthlyFee: 49, status: "active", renewalDate: "2026-07-10", paymentStatus: "paid" },
  { id: "SUB-003", teacher: "Mr. Tarek Mostafa", academy: "Physics Pro", plan: "Premium", monthlyFee: 99, status: "active", renewalDate: "2026-07-20", paymentStatus: "paid" },
  { id: "SUB-004", teacher: "Ms. Dina Farouk", academy: "Chemistry World", plan: "Pro", monthlyFee: 49, status: "active", renewalDate: "2026-07-05", paymentStatus: "pending" },
  { id: "SUB-005", teacher: "Dr. Omar Hassan", academy: "Bio Academy", plan: "Enterprise", monthlyFee: 199, status: "active", renewalDate: "2026-07-25", paymentStatus: "paid" },
  { id: "SUB-006", teacher: "Mr. Youssef Ali", academy: "Arabic Academy", plan: "Free", monthlyFee: 0, status: "active", renewalDate: "-", paymentStatus: "paid" },
  { id: "SUB-007", teacher: "Ms. Reem Khaled", academy: "English Masters", plan: "Pro", monthlyFee: 49, status: "expired", renewalDate: "2026-06-01", paymentStatus: "overdue" },
  { id: "SUB-008", teacher: "Dr. Hossam Magdy", academy: "History Hub", plan: "Premium", monthlyFee: 99, status: "cancelled", renewalDate: "-", paymentStatus: "paid" },
  { id: "SUB-009", teacher: "Dr. Laila Mahmoud", academy: "Geography Pro", plan: "Pro", monthlyFee: 49, status: "trial", renewalDate: "2026-07-01", paymentStatus: "pending" },
  { id: "SUB-010", teacher: "Mr. Hassan Saeed", academy: "IT Masters", plan: "Enterprise", monthlyFee: 199, status: "active", renewalDate: "2026-08-01", paymentStatus: "paid" },
];

// ── Invoices ──
export const platformInvoices: PlatformInvoice[] = [
  { id: "INV-20001", relatedUser: "Dr. Ahmed Kamal", userType: "teacher", academy: "Math Masters Academy", amount: 99, tax: 14.85, status: "paid", date: "2026-06-15" },
  { id: "INV-20002", relatedUser: "Aya Mansour", userType: "student", academy: "Math Masters Academy", amount: 200, tax: 30, status: "paid", date: "2026-06-24" },
  { id: "INV-20003", relatedUser: "Prof. Sara Nabil", userType: "teacher", academy: "Science Hub", amount: 49, tax: 7.35, status: "paid", date: "2026-06-10" },
  { id: "INV-20004", relatedUser: "Omar Tarek", userType: "student", academy: "Science Hub", amount: 80, tax: 12, status: "paid", date: "2026-06-24" },
  { id: "INV-20005", relatedUser: "CLASSZ Platform", userType: "platform", academy: "-", amount: 24_500, tax: 3_675, status: "issued", date: "2026-06-01" },
  { id: "INV-20006", relatedUser: "Mr. Tarek Mostafa", userType: "teacher", academy: "Physics Pro", amount: 99, tax: 14.85, status: "overdue", date: "2026-05-20" },
  { id: "INV-20007", relatedUser: "Lina Fares", userType: "student", academy: "Physics Pro", amount: 250, tax: 37.5, status: "paid", date: "2026-06-23" },
  { id: "INV-20008", relatedUser: "Ms. Dina Farouk", userType: "teacher", academy: "Chemistry World", amount: 49, tax: 7.35, status: "pending", date: "2026-06-05" },
  { id: "INV-20009", relatedUser: "CLASSZ Platform", userType: "platform", academy: "-", amount: 48_000, tax: 7_200, status: "paid", date: "2026-05-01" },
  { id: "INV-20010", relatedUser: "Mohamed Sami", userType: "student", academy: "Bio Academy", amount: 30, tax: 4.5, status: "cancelled", date: "2026-06-19" },
];

// ── Expenses ──
export const platformExpenses: PlatformExpense[] = [
  { id: "EXP-001", category: "Servers", description: "AWS hosting - June 2026", amount: 12_400, date: "2026-06-01", recurring: true, approvedBy: "Admin Ali" },
  { id: "EXP-002", category: "Servers", description: "CDN & storage - June 2026", amount: 4_800, date: "2026-06-01", recurring: true, approvedBy: "Admin Ali" },
  { id: "EXP-003", category: "Servers", description: "Database cluster", amount: 7_300, date: "2026-06-01", recurring: true, approvedBy: "Admin Ali" },
  { id: "EXP-004", category: "Marketing", description: "Google Ads - June", amount: 18_000, date: "2026-06-01", recurring: true, approvedBy: "Admin Sara" },
  { id: "EXP-005", category: "Marketing", description: "Facebook & Instagram Ads", amount: 14_000, date: "2026-06-01", recurring: true, approvedBy: "Admin Sara" },
  { id: "EXP-006", category: "Marketing", description: "Influencer campaign", amount: 8_000, date: "2026-06-10", recurring: false, approvedBy: "Admin Sara" },
  { id: "EXP-007", category: "Marketing", description: "Content production", amount: 8_000, date: "2026-06-05", recurring: true, approvedBy: "Admin Sara" },
  { id: "EXP-008", category: "Employees", description: "Engineering team payroll", amount: 45_000, date: "2026-06-25", recurring: true, approvedBy: "Admin Ali" },
  { id: "EXP-009", category: "Employees", description: "Support team payroll", amount: 18_000, date: "2026-06-25", recurring: true, approvedBy: "Admin Ali" },
  { id: "EXP-010", category: "Employees", description: "Management payroll", amount: 19_000, date: "2026-06-25", recurring: true, approvedBy: "Admin Ali" },
  { id: "EXP-011", category: "Support", description: "Intercom subscription", amount: 2_800, date: "2026-06-01", recurring: true, approvedBy: "Admin Ali" },
  { id: "EXP-012", category: "Tools", description: "Figma, GitHub, Jira licenses", amount: 3_200, date: "2026-06-01", recurring: true, approvedBy: "Admin Ali" },
  { id: "EXP-013", category: "Legal", description: "Legal counsel retainer", amount: 5_000, date: "2026-06-01", recurring: true, approvedBy: "Admin Ali" },
  { id: "EXP-014", category: "Payment Gateway", description: "Stripe processing fees", amount: 8_500, date: "2026-06-30", recurring: true, approvedBy: "Admin Ali" },
  { id: "EXP-015", category: "Miscellaneous", description: "Office supplies", amount: 2_000, date: "2026-06-15", recurring: false, approvedBy: "Admin Sara" },
  { id: "EXP-016", category: "Miscellaneous", description: "Team event", amount: 8_000, date: "2026-06-20", recurring: false, approvedBy: "Admin Sara" },
];

// ── Affiliate Payouts ──
export const affiliatePayouts: AffiliatePayoutRecord[] = [
  { id: "AFF-001", affiliate: "EduBlog Network", clicks: 12_400, leads: 620, sales: 186, commission: 9_300, paid: 7_400, pending: 1_900, status: "active" },
  { id: "AFF-002", affiliate: "StudyTips Channel", clicks: 8_200, leads: 410, sales: 123, commission: 6_150, paid: 4_920, pending: 1_230, status: "active" },
  { id: "AFF-003", affiliate: "LearnArabic Site", clicks: 5_600, leads: 280, sales: 84, commission: 4_200, paid: 4_200, pending: 0, status: "paid" },
  { id: "AFF-004", affiliate: "MathGenius Blog", clicks: 4_100, leads: 205, sales: 61, commission: 3_050, paid: 0, pending: 3_050, status: "pending" },
  { id: "AFF-005", affiliate: "ParentHub Forum", clicks: 3_200, leads: 160, sales: 48, commission: 2_400, paid: 2_400, pending: 0, status: "paid" },
  { id: "AFF-006", affiliate: "TechEd Review", clicks: 2_800, leads: 140, sales: 42, commission: 2_100, paid: 1_680, pending: 420, status: "active" },
  { id: "AFF-007", affiliate: "Dr. Nadia Podcast", clicks: 1_900, leads: 95, sales: 28, commission: 1_400, paid: 0, pending: 1_400, status: "pending" },
  { id: "AFF-008", affiliate: "SchoolZone Portal", clicks: 1_200, leads: 60, sales: 18, commission: 900, paid: 0, pending: 0, status: "suspended" },
];

// ── Audit Logs ──
export const financialAuditLogs: FinancialAuditLog[] = [
  { id: "AL-001", action: "Withdrawal Approved", actionType: "withdrawal", description: "Approved withdrawal WD-5003 for Prof. Sara Nabil", admin: "Admin Ali", teacher: "Prof. Sara Nabil", academy: "Science Hub", amount: 5_400, date: "2026-06-22 14:32" },
  { id: "AL-002", action: "Refund Issued", actionType: "refund", description: "Refund issued for TXN-10008 — student requested cancellation", admin: "Admin Sara", teacher: "Mr. Tarek Mostafa", academy: "Physics Pro", amount: 25, date: "2026-06-21 16:10" },
  { id: "AL-003", action: "Invoice Generated", actionType: "invoice", description: "Platform invoice INV-20005 generated for server costs", admin: "System", teacher: "-", academy: "-", amount: 24_500, date: "2026-06-01 09:00" },
  { id: "AL-004", action: "Subscription Renewed", actionType: "subscription", description: "Premium plan renewed for Dr. Ahmed Kamal", admin: "System", teacher: "Dr. Ahmed Kamal", academy: "Math Masters Academy", amount: 99, date: "2026-06-15 00:01" },
  { id: "AL-005", action: "Manual Adjustment", actionType: "adjustment", description: "Credit adjustment +$200 for billing error on Prof. Sara Nabil's account", admin: "Admin Ali", teacher: "Prof. Sara Nabil", academy: "Science Hub", amount: 200, date: "2026-06-18 11:45" },
  { id: "AL-006", action: "Expense Created", actionType: "expense", description: "New expense EXP-016: Team event ($8,000)", admin: "Admin Sara", teacher: "-", academy: "-", amount: 8_000, date: "2026-06-20 10:30" },
  { id: "AL-007", action: "Tax Report Generated", actionType: "tax", description: "Q2 2026 tax report generated", admin: "Admin Ali", teacher: "-", academy: "-", amount: 36_300, date: "2026-06-24 08:00" },
  { id: "AL-008", action: "Withdrawal Rejected", actionType: "withdrawal", description: "Withdrawal WD-5005 rejected — high risk flag", admin: "Admin Sara", teacher: "Mr. Youssef Ali", academy: "Arabic Academy", amount: 6_100, date: "2026-06-20 15:22" },
  { id: "AL-009", action: "Withdrawal Paid", actionType: "withdrawal", description: "Withdrawal WD-5004 marked as paid via Vodafone Cash", admin: "Admin Ali", teacher: "Ms. Dina Farouk", academy: "Chemistry World", amount: 4_800, date: "2026-06-21 17:00" },
  { id: "AL-010", action: "Invoice Generated", actionType: "invoice", description: "Student receipt generated for Aya Mansour", admin: "System", teacher: "Dr. Ahmed Kamal", academy: "Math Masters Academy", amount: 200, date: "2026-06-24 12:05" },
  { id: "AL-011", action: "Subscription Cancelled", actionType: "subscription", description: "Dr. Hossam Magdy cancelled Premium plan", admin: "System", teacher: "Dr. Hossam Magdy", academy: "History Hub", amount: 99, date: "2026-06-16 09:30" },
  { id: "AL-012", action: "Expense Created", actionType: "expense", description: "New expense EXP-015: Office supplies ($2,000)", admin: "Admin Sara", teacher: "-", academy: "-", amount: 2_000, date: "2026-06-15 14:20" },
];

// ── Report Types ──
export const reportTypes = [
  { key: "gmv", label: "pf.gmvReport" },
  { key: "platform-revenue", label: "pf.platformRevenueReport" },
  { key: "teacher-revenue", label: "pf.teacherRevenueReport" },
  { key: "withdrawals", label: "pf.withdrawalsReport" },
  { key: "subscriptions", label: "pf.subscriptionsReport" },
  { key: "expenses", label: "pf.expensesReport" },
  { key: "profit", label: "pf.profitReport" },
  { key: "tax", label: "pf.taxReport" },
];
