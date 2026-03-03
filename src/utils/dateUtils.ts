import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

export const formatDate = (date: string | Date): string => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'yyyy-MM-dd');
};

export const formatDateTime = (date: string | Date): string => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'yyyy-MM-dd HH:mm');
};

export const formatTime = (date: string | Date): string => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'HH:mm');
};

export const getMonthString = (date: Date = new Date()): string => {
  return format(date, 'yyyy-MM');
};

export const isInMonth = (date: string, month: string): boolean => {
  const d = parseISO(date);
  const monthDate = parseISO(`${month}-01`);
  const start = startOfMonth(monthDate);
  const end = endOfMonth(monthDate);
  return isWithinInterval(d, { start, end });
};

export const calculateDuration = (startTime: string, endTime: string): number => {
  const start = parseISO(startTime);
  const end = parseISO(endTime);
  return (end.getTime() - start.getTime()) / (1000 * 60 * 60);
};

export const generateTimeSlots = (): string[] => {
  const slots: string[] = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      slots.push(time);
    }
  }
  return slots;
};
