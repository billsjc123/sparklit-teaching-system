import { Schedule, Student } from '@/types';
import { MonthlyBilling, BillingReport, TeacherRevenue } from '@/types/billing';
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
    currency: student.currency,
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

  // 分别统计人民币和港币
  const studentBillingsCNY = studentBillings.filter(b => b.currency === 'CNY');
  const studentBillingsHKD = studentBillings.filter(b => b.currency === 'HKD');

  const totalRevenueCNY = studentBillingsCNY.reduce((sum, b) => sum + b.totalAmount, 0);
  const totalRevenueHKD = studentBillingsHKD.reduce((sum, b) => sum + b.totalAmount, 0);

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

  // 计算教师收入统计
  const teacherRevenues: TeacherRevenue[] = teachers.map(teacher => {
    const teacherSchedules = schedules.filter(
      s => s.teacherId === teacher.id && 
           s.status === 'completed' && 
           isInMonth(s.startTime, month)
    );

    let totalRevenueCNY = 0;
    let totalRevenueHKD = 0;

    const schedulesDetail = teacherSchedules.map(schedule => {
      const startTime = new Date(schedule.startTime);
      const endTime = new Date(schedule.endTime);
      const hours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);

      // 计算该课程的收入（所有学生的费用总和）
      let scheduleRevenue = 0;
      let currency = 'CNY';
      const studentNames: string[] = [];

      schedule.studentIds.forEach(studentId => {
        const student = students.find(s => s.id === studentId);
        if (student) {
          studentNames.push(student.name);
          const studentCount = schedule.studentIds.length;
          const feePerStudent = student.ratePerClass / studentCount;
          scheduleRevenue += feePerStudent;
          currency = student.currency; // 假设同一课程的学生使用相同币种
        }
      });

      // 累加到对应币种
      if (currency === 'CNY') {
        totalRevenueCNY += scheduleRevenue;
      } else {
        totalRevenueHKD += scheduleRevenue;
      }

      return {
        id: schedule.id,
        date: schedule.startTime,
        subject: schedule.subject,
        studentNames,
        currency: currency as 'CNY' | 'HKD',
        amount: scheduleRevenue,
      };
    });

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
      totalRevenueCNY,
      totalRevenueHKD,
      schedules: schedulesDetail,
    };
  }).filter(tr => tr.completedCount > 0); // 只显示有课程的教师

  return {
    month,
    totalRevenueCNY,
    totalRevenueHKD,
    studentBillings,
    studentBillingsCNY,
    studentBillingsHKD,
    teacherStats,
    teacherRevenues,
  };
};
