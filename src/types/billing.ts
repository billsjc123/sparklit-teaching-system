export interface BillingRecord {
  id: string;
  studentId: string;
  scheduleId: string;
  amount: number;
  month: string;
  createdAt: string;
}

export interface MonthlyBilling {
  studentId: string;
  studentName: string;
  month: string;
  totalAmount: number;
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
  studentBillings: MonthlyBilling[];
  teacherStats: {
    teacherId: string;
    teacherName: string;
    completedCount: number;
    totalHours: number;
  }[];
}
