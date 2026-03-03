import { Schedule } from '@/types/schedule';
import { Student } from '@/types/student';
import { Teacher } from '@/types/teacher';
import { format, startOfMonth, endOfMonth, isSameMonth } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export interface MessageConfig {
  studentName: string;
  teacherName: string;
  subject: string;
  paymentMethods: {
    payme?: string;
    fps?: string;
  };
  greeting?: string;
  notes?: string;
}

/**
 * 生成课程安排消息
 */
export function generateScheduleMessage(
  schedules: Schedule[],
  student: Student,
  teacher: Teacher,
  targetMonth: Date,
  config?: Partial<MessageConfig>
): string {
  // 筛选学生相关的课程
  const studentSchedules = schedules.filter(s => s.studentIds.includes(student.id));
  
  // 筛选当月课程
  const monthStart = startOfMonth(targetMonth);
  const monthEnd = endOfMonth(targetMonth);
  
  const currentMonthSchedules = studentSchedules.filter(s => {
    const scheduleDate = new Date(s.startTime);
    return scheduleDate >= monthStart && scheduleDate <= monthEnd;
  }).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  // 获取上个月的课程（用于计算余额）
  const lastMonth = new Date(targetMonth);
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  const lastMonthStart = startOfMonth(lastMonth);
  const lastMonthEnd = endOfMonth(lastMonth);
  
  const lastMonthSchedules = studentSchedules.filter(s => {
    const scheduleDate = new Date(s.startTime);
    return scheduleDate >= lastMonthStart && scheduleDate <= lastMonthEnd;
  }).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  // 计算上个月的余额（已支付但未上的课程数）
  const completedLastMonth = lastMonthSchedules.filter(s => s.status === 'completed').length;
  const totalLastMonth = lastMonthSchedules.length;
  const remainingClasses = totalLastMonth - completedLastMonth;

  // 构建消息
  const monthName = format(targetMonth, 'M月', { locale: zhCN });
  const lastMonthName = format(lastMonth, 'M月', { locale: zhCN });
  
  const greeting = config?.greeting || `早安 ${student.name}媽咪！`;
  const subject = config?.subject || (teacher.subjects[0] || '課程');
  
  let message = `${greeting}這是${student.name} ${monthName}的${subject}安排，如果需要調整可以隨時跟我說～\n`;
  
  // 上个月课程回顾
  if (lastMonthSchedules.length > 0) {
    message += `*${student.name} ${lastMonthName}${subject}安排*\n`;
    
    lastMonthSchedules.forEach(schedule => {
      const date = new Date(schedule.startTime);
      const endDate = new Date(schedule.endTime);
      const dateStr = format(date, 'd/M', { locale: zhCN });
      const weekday = format(date, 'EEE', { locale: zhCN });
      
      // 格式化时间：3-5pm 或 4-5pm
      const startHour = date.getHours();
      const endHour = endDate.getHours();
      const timeStr = `${startHour}-${endHour}pm`;
      
      const statusIcon = schedule.status === 'completed' ? '☑️' : '✖️';
      const statusText = schedule.status === 'completed' ? '已上' : (schedule.notes || 'cancel');
      
      message += `${dateStr}      ${weekday} ${timeStr}    ${statusIcon}   ${statusText}\n`;
    });
    
    if (remainingClasses > 0) {
      message += `餘${getNumberEmoji(remainingClasses)}堂課費\n`;
    }
    message += '\n';
  }
  
  // 当月课程安排
  message += `*${student.name} ${monthName}${subject}安排*\n`;
  
  if (currentMonthSchedules.length === 0) {
    message += '暫無課程安排\n';
  } else {
    currentMonthSchedules.forEach(schedule => {
      const date = new Date(schedule.startTime);
      const endDate = new Date(schedule.endTime);
      const dateStr = format(date, 'd/M', { locale: zhCN });
      const weekday = format(date, 'EEE', { locale: zhCN });
      
      // 格式化时间：3-5pm 或 4-5pm
      const startHour = date.getHours();
      const endHour = endDate.getHours();
      const timeStr = `${startHour}-${endHour}pm`;
      
      message += `${dateStr}      ${weekday} ${timeStr}\n`;
    });
  }
  
  message += '———————\n';
  
  // 支付说明
  message += '如果確認沒問題的話，可以安排預繳費來鎖定時段，轉賬成功後截圖發到我們的WhatsApp對話，以留底保存。';
  message += '如需要調整，開課前6小時告知都可以靈活取消或調整（如果2次以上在6小時內臨時取消且沒有提供合適理由會扣除半堂課費🙏）';
  message += '轉賬方式可以通過：\n\n';
  
  // 支付方式
  const paymentName = config?.paymentMethods?.payme || 'Jennifer Li';
  const fpsName = config?.paymentMethods?.fps || 'LI JUNTING';
  const phone = teacher.phone || '95120176';
  
  message += `1️⃣ payme：${phone} ${paymentName}\n`;
  message += `2️⃣ fps：${phone} 中國銀行 ${fpsName}\n`;
  
  if (config?.notes) {
    message += `\n${config.notes}`;
  }
  
  return message;
}

/**
 * 将数字转换为表情符号
 */
function getNumberEmoji(num: number): string {
  const emojis = ['0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣'];
  if (num < 10) {
    return emojis[num];
  }
  return num.toString();
}

/**
 * 复制文本到剪贴板
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy text: ', err);
    // 降级方案
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (fallbackErr) {
      console.error('Fallback copy failed: ', fallbackErr);
      return false;
    }
  }
}
