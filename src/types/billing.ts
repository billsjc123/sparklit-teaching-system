import { Currency } from './student';

export interface BillingRecord {
  id: string;
  studentId: string;
  scheduleId: string;
  amount: number;
  currency: Currency;
  month: string;
  createdAt: string;
}

export interface MonthlyBilling {
  studentId: string;
  studentName: string;
  month: string;
  totalAmount: number;
  currency: Currency;
  completedCount: number;
  schedules: {
    id: string;
    date: string;
    subject: string;
    amount: number;
  }[];
}

export interface BillingReport {
  month: string;
  totalRevenue: number;
  totalRevenueCNY: number; // 人民币总收入
  totalRevenueHKD: number; // 港币总收入
  studentBillings: MonthlyBilling[];
  studentBillingsCNY: MonthlyBilling[]; // 人民币学生账单
  studentBillingsHKD: MonthlyBilling[]; // 港币学生账单
  teacherStats: {
    teacherId: string;
    teacherName: string;
    completedCount: number;
    totalHours: number;
  }[];
}
