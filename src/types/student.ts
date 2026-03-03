export interface Student {
  id: string;
  name: string;
  grade: string;
  parentContact: string;
  ratePerClass: number; // 每节课费率
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudentFormData {
  name: string;
  grade: string;
  parentContact: string;
  ratePerClass: number; // 每节课费率
  notes?: string;
}
