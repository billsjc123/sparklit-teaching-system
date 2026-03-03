export type ScheduleType = 'oneOnOne' | 'smallClass';
export type ScheduleStatus = 'completed' | 'pending';

export interface Schedule {
  id: string;
  teacherId: string;
  studentIds: string[];
  subject: string;
  type: ScheduleType;
  startTime: string;
  endTime: string;
  status: ScheduleStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ScheduleFormData {
  teacherId: string;
  studentIds: string[];
  subject: string;
  type: ScheduleType;
  startTime: string;
  endTime: string;
  rate: number;
  notes?: string;
}
