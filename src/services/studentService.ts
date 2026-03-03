import { Student, StudentFormData } from '@/types/student';
import { generateId, getCurrentTimestamp } from '@/utils/storageUtils';

export const createStudent = (formData: StudentFormData): Student => {
  return {
    id: generateId(),
    ...formData,
    createdAt: getCurrentTimestamp(),
    updatedAt: getCurrentTimestamp(),
  };
};

export const updateStudent = (student: Student, formData: Partial<StudentFormData>): Student => {
  return {
    ...student,
    ...formData,
    updatedAt: getCurrentTimestamp(),
  };
};

export const validateStudentForm = (formData: StudentFormData): string[] => {
  const errors: string[] = [];
  
  if (!formData.name.trim()) {
    errors.push('学生姓名不能为空');
  }
  
  if (!formData.grade.trim()) {
    errors.push('年级不能为空');
  }
  
  if (!formData.parentContact.trim()) {
    errors.push('家长联系方式不能为空');
  }
  
  if (formData.customRate !== undefined && formData.customRate < 0) {
    errors.push('自定义费率不能为负数');
  }
  
  return errors;
};
