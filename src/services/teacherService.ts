import { Teacher, TeacherFormData } from '@/types/teacher';
import { generateId, getCurrentTimestamp } from '@/utils/storageUtils';

export const createTeacher = (formData: TeacherFormData): Teacher => {
  return {
    id: generateId(),
    ...formData,
    createdAt: getCurrentTimestamp(),
    updatedAt: getCurrentTimestamp(),
  };
};

export const updateTeacher = (teacher: Teacher, formData: Partial<TeacherFormData>): Teacher => {
  return {
    ...teacher,
    ...formData,
    updatedAt: getCurrentTimestamp(),
  };
};

export const validateTeacherForm = (formData: TeacherFormData): string[] => {
  const errors: string[] = [];
  
  if (!formData.name.trim()) {
    errors.push('教师姓名不能为空');
  }
  
  if (!formData.email.trim()) {
    errors.push('电子邮箱不能为空');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.push('电子邮箱格式不正确');
  }
  
  if (!formData.phone.trim()) {
    errors.push('联系电话不能为空');
  }
  
  if (formData.subjects.length === 0) {
    errors.push('至少选择一门科目');
  }
  
  if (formData.hourlyRate <= 0) {
    errors.push('课时费率必须大于0');
  }
  
  return errors;
};
