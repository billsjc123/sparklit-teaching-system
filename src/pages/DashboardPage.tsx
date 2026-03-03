import React from 'react';
import { Download, Upload, Database, Calendar, Users, GraduationCap } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { exportData, importData } from '@/services/dataService';
import PageHeader from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getMonthString } from '@/utils/dateUtils';
import { generateMonthlyReport } from '@/services/billingService';

const DashboardPage = () => {
  const { state, dispatch } = useApp();
  const currentMonth = getMonthString();
  const monthlyReport = generateMonthlyReport(currentMonth, state.students, state.schedules, state.teachers);

  const handleExport = () => {
    exportData(state);
  };

  const handleImport = () => {
    importData((data) => {
      dispatch({ type: 'LOAD_DATA', payload: data });
      alert('数据导入成功！');
    });
  };

  // 获取今天的所有课程
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayEnd = new Date(today);
  todayEnd.setHours(23, 59, 59, 999);

  const todaySchedules = state.schedules
    .filter(s => {
      const scheduleDate = new Date(s.startTime);
      return scheduleDate >= today && scheduleDate <= todayEnd;
    })
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  const getTeacherName = (teacherId: string) => {
    return state.teachers.find(t => t.id === teacherId)?.name || '未知教师';
  };

  const getStudentNames = (studentIds: string[]) => {
    return studentIds
      .map(id => state.students.find(s => s.id === id)?.name || '未知学生')
      .join(', ');
  };

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title="仪表板"
        description="系统概览和快速操作"
        actions={
          <div className="flex gap-3">
            <Button onClick={handleImport} variant="outline">
              <Upload className="w-4 h-4 mr-2" />
              导入数据
            </Button>
            <Button onClick={handleExport} className="bg-primary-600 hover:bg-primary-700">
              <Download className="w-4 h-4 mr-2" />
              备份数据
            </Button>
          </div>
        }
      />

      <div className="flex-1 p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">教师总数</CardTitle>
              <Users className="w-4 h-4 text-primary-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary-600">{state.teachers.length}</div>
              <p className="text-xs text-gray-500 mt-1">系统中的教师人数</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">学生总数</CardTitle>
              <GraduationCap className="w-4 h-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{state.students.length}</div>
              <p className="text-xs text-gray-500 mt-1">系统中的学生人数</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">本月课程</CardTitle>
              <Calendar className="w-4 h-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {state.schedules.filter(s => s.startTime.startsWith(currentMonth)).length}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                已完成 {state.schedules.filter(s => s.startTime.startsWith(currentMonth) && s.status === 'completed').length} 节
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">本月收入</CardTitle>
              <Database className="w-4 h-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                ¥{monthlyReport.totalRevenue.toFixed(2)}
              </div>
              <p className="text-xs text-gray-500 mt-1">已完成课程总收入</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>今日课程安排</CardTitle>
          </CardHeader>
          <CardContent>
            {todaySchedules.length === 0 ? (
              <p className="text-gray-500 text-center py-8">今日暂无课程安排</p>
            ) : (
              <div className="space-y-3">
                {todaySchedules.map(schedule => (
                  <div
                    key={schedule.id}
                    className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                      schedule.status === 'completed' 
                        ? 'bg-green-50 border border-green-200' 
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{schedule.subject}</span>
                        <span className="px-2 py-0.5 bg-primary-100 text-primary-700 rounded text-xs">
                          {schedule.type === 'oneOnOne' ? '一对一' : '小班课'}
                        </span>
                        {schedule.status === 'completed' && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">
                            已完成
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        教师：{getTeacherName(schedule.teacherId)} | 学生：{getStudentNames(schedule.studentIds)}
                      </p>
                    </div>
                    <div className="text-right text-sm text-gray-600">
                      {new Date(schedule.startTime).toLocaleString('zh-CN', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
