export type Currency = 'CNY' | 'HKD'; // 人民币或港币

export interface Student {
  id: string;
  name: string;
  grade: string;
  parentContact: string;
  ratePerClass: number; // 每节课费率
  currency: Currency; // 币种
  teacherId?: string; // 绑定的教师ID
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudentFormData {
  name: string;
  grade: string;
  parentContact: string;
  ratePerClass: number; // 每节课费率
  currency: Currency; // 币种
  teacherId?: string; // 绑定的教师ID
  customRate?: number;
  notes?: string;
}
