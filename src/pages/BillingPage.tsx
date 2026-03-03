import React, { useState, useMemo } from 'react';
import { Download, Calendar } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { generateMonthlyReport } from '@/services/billingService';
import { getMonthString } from '@/utils/dateUtils';
import { downloadJSON } from '@/utils/storageUtils';
import PageHeader from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const BillingPage = () => {
  const { state } = useApp();
  const [selectedMonth, setSelectedMonth] = useState(getMonthString());

  const report = useMemo(() => {
    return generateMonthlyReport(
      selectedMonth,
      state.students,
      state.schedules,
      state.teachers
    );
  }, [selectedMonth, state.students, state.schedules, state.teachers]);

  const handleExport = () => {
    const filename = `费用报表-${selectedMonth}.json`;
    downloadJSON(report, filename);
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedMonth(e.target.value);
  };

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title="费用管理"
        description="查看和导出月度费用统计报表"
        actions={
          <Button onClick={handleExport} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            导出报表
          </Button>
        }
      />

      <div className="flex-1 p-8 space-y-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-600" />
            <label htmlFor="month" className="text-sm font-medium">选择月份：</label>
          </div>
          <input
            id="month"
            type="month"
            value={selectedMonth}
            onChange={handleMonthChange}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">总收入</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary-600">
                ¥{report.totalRevenue.toFixed(2)}
              </p>
              <p className="text-sm text-gray-500 mt-1">本月总计</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">完成课程数</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">
                {state.schedules.filter(s => 
                  s.status === 'completed' && 
                  s.startTime.startsWith(selectedMonth)
                ).length}
              </p>
              <p className="text-sm text-gray-500 mt-1">本月总计</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">学生人数</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600">
                {report.studentBillings.length}
              </p>
              <p className="text-sm text-gray-500 mt-1">有课程记录的学生</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="students" className="w-full">
          <TabsList>
            <TabsTrigger value="students">学生费用明细</TabsTrigger>
            <TabsTrigger value="teachers">教师工作统计</TabsTrigger>
          </TabsList>

          <TabsContent value="students" className="mt-6">
            <div className="bg-white rounded-lg shadow">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>学生姓名</TableHead>
                    <TableHead>完成课程数</TableHead>
                    <TableHead className="text-right">总费用</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {report.studentBillings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-gray-500 py-8">
                        本月暂无费用记录
                      </TableCell>
                    </TableRow>
                  ) : (
                    report.studentBillings.map(billing => (
                      <TableRow key={billing.studentId}>
                        <TableCell className="font-medium">{billing.studentName}</TableCell>
                        <TableCell>{billing.completedCount} 节</TableCell>
                        <TableCell className="text-right font-semibold text-primary-600">
                          ¥{billing.totalAmount.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {report.studentBillings.length > 0 && (
              <div className="mt-6 space-y-4">
                <h3 className="text-lg font-semibold">详细课程明细</h3>
                {report.studentBillings.map(billing => (
                  <Card key={billing.studentId}>
                    <CardHeader>
                      <CardTitle className="text-base">
                        {billing.studentName} - 共 {billing.completedCount} 节课，总计 ¥{billing.totalAmount.toFixed(2)}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>日期时间</TableHead>
                            <TableHead>科目</TableHead>
                            <TableHead className="text-right">费用</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {billing.schedules.map(schedule => (
                            <TableRow key={schedule.id}>
                              <TableCell>{new Date(schedule.date).toLocaleString('zh-CN')}</TableCell>
                              <TableCell>{schedule.subject}</TableCell>
                              <TableCell className="text-right">¥{schedule.amount.toFixed(2)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="teachers" className="mt-6">
            <div className="bg-white rounded-lg shadow">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>教师姓名</TableHead>
                    <TableHead>完成课程数</TableHead>
                    <TableHead className="text-right">总课时 (小时)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {report.teacherStats.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-gray-500 py-8">
                        本月暂无教师统计数据
                      </TableCell>
                    </TableRow>
                  ) : (
                    report.teacherStats.map(stat => (
                      <TableRow key={stat.teacherId}>
                        <TableCell className="font-medium">{stat.teacherName}</TableCell>
                        <TableCell>{stat.completedCount} 节</TableCell>
                        <TableCell className="text-right font-semibold text-primary-600">
                          {stat.totalHours.toFixed(2)} 小时
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default BillingPage;
