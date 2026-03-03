import { Schedule, Student } from '@/types';
import { MonthlyBilling, BillingReport } from '@/types/billing';
import { isInMonth } from '@/utils/dateUtils';

export const calculateMonthlyFee = (
  studentId: string,
  month: string,
  schedules: Schedule[],
  student: Student
): number => {
  const studentSchedules = schedules.filter(
    s => s.studentIds.includes(studentId) && 
         s.status === 'completed' && 
         isInMonth(s.startTime, month)
  );

  return studentSchedules.reduce((total, schedule) => {
    // 小班课时，费用按学生数量分摊
    const studentCount = schedule.studentIds.length;
    const feePerStudent = student.ratePerClass / studentCount;
    return total + feePerStudent;
  }, 0);
};

export const generateMonthlyBilling = (
  student: Student,
  month: string,
  schedules: Schedule[]
): MonthlyBilling => {
  const studentSchedules = schedules.filter(
    s => s.studentIds.includes(student.id) && 
         s.status === 'completed' && 
         isInMonth(s.startTime, month)
  );

  const schedulesDetail = studentSchedules.map(schedule => {
    const studentCount = schedule.studentIds.length;
    // 小班课时，每个学生的费用是其单节课费率除以学生数
    const amount = student.ratePerClass / studentCount;
    
    return {
      id: schedule.id,
      date: schedule.startTime,
      subject: schedule.subject,
      amount,
    };
  });

  const totalAmount = schedulesDetail.reduce((sum, s) => sum + s.amount, 0);

  return {
    studentId: student.id,
    studentName: student.name,
    month,
    totalAmount,
    completedCount: studentSchedules.length,
    schedules: schedulesDetail,
  };
};

export const generateMonthlyReport = (
  month: string,
  students: Student[],
  schedules: Schedule[],
  teachers: { id: string; name: string }[]
): BillingReport => {
  const studentBillings = students
    .map(student => generateMonthlyBilling(student, month, schedules))
    .filter(billing => billing.completedCount > 0);

  const totalRevenue = studentBillings.reduce((sum, b) => sum + b.totalAmount, 0);

  const teacherStats = teachers.map(teacher => {
    const teacherSchedules = schedules.filter(
      s => s.teacherId === teacher.id && 
           s.status === 'completed' && 
           isInMonth(s.startTime, month)
    );

    // 计算总课时（小时）
    const totalHours = teacherSchedules.reduce((sum, schedule) => {
      const startTime = new Date(schedule.startTime);
      const endTime = new Date(schedule.endTime);
      const hours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
      return sum + hours;
    }, 0);

    return {
      teacherId: teacher.id,
      teacherName: teacher.name,
      completedCount: teacherSchedules.length,
      totalHours,
    };
  });

  return {
    month,
    totalRevenue,
    studentBillings,
    teacherStats,
  };
};
