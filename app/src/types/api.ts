export type Me = {
  business_id: string;
  business_name: string;
  auth_user_id: string;
  role: string;
};

export type Worker = {
  id: string;
  name: string;
  mobile_number: string | null;
  daily_wage: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type WorkerCreateInput = {
  name: string;
  mobile_number?: string | null;
  daily_wage: number;
};

export type WorkerUpdateInput = {
  name?: string;
  mobile_number?: string | null;
  daily_wage?: number;
  is_active?: boolean;
};

export type Site = {
  id: string;
  name: string;
  start_date: string | null;
  is_active: boolean;
  created_at: string;
};

export type SiteCreateInput = {
  name: string;
  start_date?: string | null;
};

export type SiteUpdateInput = {
  name?: string;
  start_date?: string | null;
  is_active?: boolean;
};

export type AttendanceEntry = {
  id: string;
  worker_id: string;
  site_id: string;
  date: string;
  value: string;
  wage_at_entry: string;
  earnings: string;
  created_at: string;
  updated_at: string;
};

export type AttendanceSiteValueInput = {
  site_id: string;
  value: number;
};

export type AttendanceSaveInput = {
  worker_id: string;
  date: string;
  entries: AttendanceSiteValueInput[];
};

export type PaymentType = 'advance' | 'salary' | 'extra_work';
export type PaymentMethod = 'cash' | 'bank';

export type WorkerPayment = {
  id: string;
  worker_id: string;
  site_id: string | null;
  date: string;
  amount: string;
  payment_type: PaymentType;
  reason: string | null;
  payment_method: PaymentMethod;
  payment_details: string | null;
  created_at: string;
  updated_at: string;
};

export type WorkerPaymentInput = {
  worker_id: string;
  site_id?: string | null;
  date: string;
  amount: number;
  payment_type: PaymentType;
  reason?: string | null;
  payment_method: PaymentMethod;
  payment_details?: string | null;
};

export type AdditionalWork = {
  id: string;
  worker_id: string;
  date: string;
  amount: string;
  description: string;
  created_at: string;
  updated_at: string;
};

export type AdditionalWorkInput = {
  worker_id: string;
  date: string;
  amount: number;
  description: string;
};

export type WorkerBalance = {
  total_earned: string;
  total_paid: string;
  balance_payable: string;
};

export type PaidBy = 'contractor' | 'supervisor';

export type SiteExpense = {
  id: string;
  site_id: string;
  date: string;
  amount: string;
  description: string;
  paid_by: PaidBy;
  payment_method: PaymentMethod;
  created_at: string;
  updated_at: string;
};

export type SiteExpenseInput = {
  site_id: string;
  date: string;
  amount: number;
  description: string;
  paid_by: PaidBy;
  payment_method: PaymentMethod;
};

export type ClientBill = {
  id: string;
  site_id: string;
  bill_date: string;
  bill_amount: string;
  remarks: string | null;
  amount_received: string;
  balance: string;
  created_at: string;
  updated_at: string;
};

export type ClientBillInput = {
  site_id: string;
  bill_date: string;
  bill_amount: number;
  remarks?: string | null;
};

export type BillReceipt = {
  id: string;
  bill_id: string;
  amount_received: string;
  date_received: string;
  payment_method: PaymentMethod;
  created_at: string;
  updated_at: string;
};

export type BillReceiptInput = {
  bill_id: string;
  amount_received: number;
  date_received: string;
  payment_method: PaymentMethod;
};

export type ClientBillDetail = ClientBill & {
  receipts: BillReceipt[];
};

export type MethodBalance = {
  opening: string;
  money_in: string;
  money_out: string;
  balance: string;
};

export type LedgerBalances = {
  as_of_date: string | null;
  cash: MethodBalance;
  bank: MethodBalance;
};

export type LedgerTransaction = {
  id: string;
  date: string;
  type: 'receipt' | 'payment' | 'expense';
  direction: 'in' | 'out';
  amount: string;
  payment_method: PaymentMethod;
  label: string;
  site_id: string | null;
  worker_id: string | null;
};

export type OpeningBalanceInput = {
  opening_cash: number;
  opening_bank: number;
  as_of_date: string;
};

export type MoneyInHand = {
  cash: string;
  bank: string;
  total: string;
};

export type TodayAttendance = {
  marked: number;
  total_active_workers: number;
  labour_cost: string;
};

export type SitePosition = {
  site_id: string;
  name: string;
  received: string;
  labour_cost: string;
  expenses: string;
  position: string;
};

export type Dashboard = {
  money_in_hand: MoneyInHand;
  today_attendance: TodayAttendance;
  payable_total: string;
  receivable_total: string;
  sites: SitePosition[];
};

export type WorkerSiteBreakdown = {
  site_id: string;
  site_name: string;
  days_worked: string;
  earnings: string;
};

export type WorkerReport = {
  worker_id: string;
  from_date: string | null;
  to_date: string | null;
  sites: WorkerSiteBreakdown[];
  attendance_earnings: string;
  additional_work_earnings: string;
  total_earned: string;
  total_paid: string;
  balance_payable: string;
};

export type SiteWorkerBreakdown = {
  worker_id: string;
  worker_name: string;
  days_worked: string;
  labour_cost: string;
};

export type SiteReport = {
  site_id: string;
  from_date: string | null;
  to_date: string | null;
  bill_total: string;
  received_total: string;
  bill_balance: string;
  workers: SiteWorkerBreakdown[];
  labour_cost_total: string;
  expenses_total: string;
  position: string;
};
