export interface Teacher {
  id: string;
  name: string;
  email: string;
  phone: string;
  subjects: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TeacherFormData {
  name: string;
  email: string;
  phone: string;
  subjects: string[];
  hourlyRate: number;
}
