import { Schedule, ScheduleFormData, ScheduleStatus } from '@/types/schedule';
import { generateId, getCurrentTimestamp } from '@/utils/storageUtils';

export const createSchedule = (formData: ScheduleFormData): Schedule => {
  return {
    id: generateId(),
    ...formData,
    status: 'pending',
    createdAt: getCurrentTimestamp(),
    updatedAt: getCurrentTimestamp(),
  };
};

export const updateSchedule = (schedule: Schedule, updates: Partial<Schedule>): Schedule => {
  return {
    ...schedule,
    ...updates,
    updatedAt: getCurrentTimestamp(),
  };
};

export const updateScheduleStatus = (schedule: Schedule, status: ScheduleStatus): Schedule => {
  return {
    ...schedule,
    status,
    updatedAt: getCurrentTimestamp(),
  };
};

export const validateScheduleForm = (formData: ScheduleFormData): string[] => {
  const errors: string[] = [];
  
  if (!formData.teacherId) {
    errors.push('请选择教师');
  }
  
  if (formData.studentIds.length === 0) {
    errors.push('请至少选择一名学生');
  }
  
  if (!formData.subject.trim()) {
    errors.push('请输入科目');
  }
  
  if (!formData.startTime) {
    errors.push('请选择开始时间');
  }
  
  if (!formData.endTime) {
    errors.push('请选择结束时间');
  }
  
  if (formData.startTime && formData.endTime && formData.startTime >= formData.endTime) {
    errors.push('结束时间必须晚于开始时间');
  }
  
  if (formData.rate <= 0) {
    errors.push('课时费率必须大于0');
  }
  
  return errors;
};

export const checkScheduleConflict = (
  schedules: Schedule[],
  teacherId: string,
  startTime: string,
  endTime: string,
  excludeId?: string
): boolean => {
  // 检查任意课程的时间冲突（不限于同一教师）
  return schedules.some(schedule => {
    if (schedule.id === excludeId) return false;
    
    const scheduleStart = new Date(schedule.startTime).getTime();
    const scheduleEnd = new Date(schedule.endTime).getTime();
    const newStart = new Date(startTime).getTime();
    const newEnd = new Date(endTime).getTime();
    
    // 时间段有重叠就算冲突
    return (newStart < scheduleEnd && newEnd > scheduleStart);
  });
};
