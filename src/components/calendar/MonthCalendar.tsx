import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Schedule, Student, Teacher } from '@/types';
import { Badge } from '@/components/ui/badge';
import { format, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, isToday } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface MonthCalendarProps {
  schedules: Schedule[];
  students: Student[];
  teachers: Teacher[];
  onScheduleClick: (schedule: Schedule) => void;
  onDateClick: (date: Date) => void;
}

const MonthCalendar: React.FC<MonthCalendarProps> = ({
  schedules,
  students,
  teachers,
  onScheduleClick,
  onDateClick,
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  
  // 获取月份的所有日期
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // 计算第一天是星期几，补充前面的空白
  const firstDayOfWeek = monthStart.getDay();
  const startPadding = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1; // 周一为第一天

  const goToPreviousMonth = () => {
    setCurrentMonth(addMonths(currentMonth, -1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const goToCurrentMonth = () => {
    setCurrentMonth(new Date());
  };

  const getSchedulesForDay = (date: Date) => {
    return schedules.filter(schedule => {
      const scheduleDate = new Date(schedule.startTime);
      return isSameDay(scheduleDate, date);
    }).sort((a, b) => 
      new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );
  };

  const getTeacherName = (teacherId: string) => {
    return teachers.find(t => t.id === teacherId)?.name || '未知';
  };

  const getStudentNames = (studentIds: string[]) => {
    return studentIds
      .map(id => students.find(s => s.id === id)?.name || '未知')
      .join(', ');
  };

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), 'HH:mm');
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow">
      {/* 头部导航 */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold">
            {format(currentMonth, 'yyyy年MM月', { locale: zhCN })}
          </h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={goToCurrentMonth}>
              本月
            </Button>
            <Button variant="outline" size="sm" onClick={goToNextMonth}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="text-sm text-gray-600">
          共 {schedules.filter(s => isSameMonth(new Date(s.startTime), currentMonth)).length} 节课程
        </div>
      </div>

      {/* 星期标题行 */}
      <div className="grid grid-cols-7 border-b bg-gray-50">
        {['一', '二', '三', '四', '五', '六', '日'].map((day, idx) => (
          <div
            key={idx}
            className="p-3 text-center text-sm font-medium text-gray-700 border-r last:border-r-0"
          >
            星期{day}
          </div>
        ))}
      </div>

      {/* 日历主体 */}
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-7 auto-rows-fr min-h-full">
          {/* 前面的空白格子 */}
          {Array.from({ length: startPadding }).map((_, idx) => (
            <div key={`padding-${idx}`} className="border-r border-b bg-gray-50/50" />
          ))}
          
          {/* 日期格子 */}
          {daysInMonth.map((date, idx) => {
            const daySchedules = getSchedulesForDay(date);
            const isCurrentDay = isToday(date);
            
            return (
              <div
                key={idx}
                className={`border-r border-b p-2 min-h-[120px] hover:bg-gray-50 transition-colors ${
                  isCurrentDay ? 'bg-primary-50' : ''
                }`}
              >
                {/* 日期数字 */}
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-lg font-semibold ${
                      isCurrentDay
                        ? 'bg-primary-600 text-white rounded-full w-8 h-8 flex items-center justify-center'
                        : 'text-gray-900'
                    }`}
                  >
                    {format(date, 'd')}
                  </span>
                  {daySchedules.length === 0 && (
                    <button
                      onClick={() => onDateClick(date)}
                      className="opacity-0 hover:opacity-100 transition-opacity p-1 hover:bg-primary-100 rounded"
                      title="添加课程"
                    >
                      <Plus className="w-4 h-4 text-primary-600" />
                    </button>
                  )}
                </div>

                {/* 课程列表 */}
                <div className="space-y-1">
                  {daySchedules.map((schedule) => (
                    <div
                      key={schedule.id}
                      className={`text-xs p-2 rounded cursor-pointer hover:shadow-md transition-shadow ${
                        schedule.status === 'completed'
                          ? 'bg-green-100 border border-green-300'
                          : 'bg-blue-100 border border-blue-300'
                      }`}
                      onClick={() => onScheduleClick(schedule)}
                    >
                      <div className="flex items-start justify-between gap-1 mb-1">
                        <span className="font-semibold text-gray-900">
                          {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                        </span>
                        {schedule.status === 'completed' && (
                          <Badge variant="default" className="text-[8px] px-1 py-0 h-4">
                            ✓
                          </Badge>
                        )}
                      </div>
                      <div className="text-gray-700 font-medium truncate">
                        {schedule.subject}
                      </div>
                      <div className="text-gray-600 truncate text-[10px] mt-1">
                        👨‍🏫 {getTeacherName(schedule.teacherId)}
                      </div>
                      <div className="text-gray-600 truncate text-[10px]">
                        👨‍🎓 {getStudentNames(schedule.studentIds)}
                      </div>
                      {schedule.type === 'smallClass' && (
                        <Badge variant="secondary" className="text-[8px] px-1 py-0 mt-1">
                          小班课
                        </Badge>
                      )}
                    </div>
                  ))}
                  
                  {/* 添加课程按钮 */}
                  {daySchedules.length > 0 && (
                    <button
                      onClick={() => onDateClick(date)}
                      className="w-full py-2 text-xs text-primary-600 hover:bg-primary-50 rounded border border-dashed border-primary-300 hover:border-primary-500 transition-colors"
                    >
                      + 添加课程
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 底部图例 */}
      <div className="flex items-center gap-4 p-4 border-t bg-gray-50 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded"></div>
          <span>待完成</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
          <span>已完成</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-primary-600 rounded-full"></div>
          <span>今天</span>
        </div>
        <div className="text-gray-500 ml-auto">
          点击日期或课程卡片进行操作
        </div>
      </div>
    </div>
  );
};

export default MonthCalendar;
