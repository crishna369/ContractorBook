import type { PaymentMethod, PaymentType } from '../types/api';

export const PAYMENT_TYPE_LABELS: Record<PaymentType, string> = {
  advance: 'Advance',
  salary: 'Salary',
  extra_work: 'Extra work',
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: 'Cash',
  bank: 'Bank / UPI',
};
