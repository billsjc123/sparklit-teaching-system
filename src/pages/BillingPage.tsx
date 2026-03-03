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

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">总收入</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary-600">
                ¥{report.totalRevenue.toFixed(2)}
              </p>
              <p className="text-sm text-gray-500 mt-1">本月总计（合并）</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">人民币收入</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600">
                ¥{report.totalRevenueCNY.toFixed(2)}
              </p>
              <p className="text-sm text-gray-500 mt-1">{report.studentBillingsCNY.length} 位学生</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">港币收入</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-purple-600">
                HK${report.totalRevenueHKD.toFixed(2)}
              </p>
              <p className="text-sm text-gray-500 mt-1">{report.studentBillingsHKD.length} 位学生</p>
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
        </div>

        <Tabs defaultValue="students" className="w-full">
          <TabsList>
            <TabsTrigger value="students">学生费用明细</TabsTrigger>
            <TabsTrigger value="teachers">教师工作统计</TabsTrigger>
            <TabsTrigger value="teacher-revenue">教师收入统计</TabsTrigger>
          </TabsList>

          <TabsContent value="students" className="mt-6">
            {/* 人民币学生 */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    人民币 (¥)
                  </span>
                  <span className="text-gray-600 text-base">
                    {report.studentBillingsCNY.length} 位学生，总计 ¥{report.totalRevenueCNY.toFixed(2)}
                  </span>
                </h3>
                <div className="bg-white rounded-lg shadow">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>学生姓名</TableHead>
                        <TableHead>完成课程数</TableHead>
                        <TableHead className="text-right">总费用 (¥)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {report.studentBillingsCNY.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center text-gray-500 py-8">
                            本月暂无人民币费用记录
                          </TableCell>
                        </TableRow>
                      ) : (
                        report.studentBillingsCNY.map(billing => (
                          <TableRow key={billing.studentId}>
                            <TableCell className="font-medium">{billing.studentName}</TableCell>
                            <TableCell>{billing.completedCount} 节</TableCell>
                            <TableCell className="text-right font-semibold text-blue-600">
                              ¥{billing.totalAmount.toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* 港币学生 */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                    港币 (HK$)
                  </span>
                  <span className="text-gray-600 text-base">
                    {report.studentBillingsHKD.length} 位学生，总计 HK${report.totalRevenueHKD.toFixed(2)}
                  </span>
                </h3>
                <div className="bg-white rounded-lg shadow">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>学生姓名</TableHead>
                        <TableHead>完成课程数</TableHead>
                        <TableHead className="text-right">总费用 (HK$)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {report.studentBillingsHKD.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center text-gray-500 py-8">
                            本月暂无港币费用记录
                          </TableCell>
                        </TableRow>
                      ) : (
                        report.studentBillingsHKD.map(billing => (
                          <TableRow key={billing.studentId}>
                            <TableCell className="font-medium">{billing.studentName}</TableCell>
                            <TableCell>{billing.completedCount} 节</TableCell>
                            <TableCell className="text-right font-semibold text-purple-600">
                              HK${billing.totalAmount.toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>

            {/* 详细课程明细 */}
            {report.studentBillings.length > 0 && (
              <div className="mt-8 space-y-4">
                <h3 className="text-lg font-semibold">详细课程明细</h3>
                {report.studentBillings.map(billing => (
                  <Card key={billing.studentId}>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <span>{billing.studentName}</span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          billing.currency === 'CNY' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {billing.currency === 'CNY' ? '人民币' : '港币'}
                        </span>
                        <span className="text-gray-600 font-normal">
                          - 共 {billing.completedCount} 节课，总计 {billing.currency === 'CNY' ? '¥' : 'HK$'}{billing.totalAmount.toFixed(2)}
                        </span>
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
                              <TableCell className="text-right">
                                {billing.currency === 'CNY' ? '¥' : 'HK$'}{schedule.amount.toFixed(2)}
                              </TableCell>
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

          <TabsContent value="teacher-revenue" className="mt-6">
            <div className="space-y-6">
              {/* 教师收入汇总表 */}
              <div className="bg-white rounded-lg shadow">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>教师姓名</TableHead>
                      <TableHead>完成课程数</TableHead>
                      <TableHead className="text-right">人民币收入 (¥)</TableHead>
                      <TableHead className="text-right">港币收入 (HK$)</TableHead>
                      <TableHead className="text-right">总收入 (合并)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {report.teacherRevenues.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                          本月暂无教师收入数据
                        </TableCell>
                      </TableRow>
                    ) : (
                      report.teacherRevenues.map(revenue => (
                        <TableRow key={revenue.teacherId}>
                          <TableCell className="font-medium">{revenue.teacherName}</TableCell>
                          <TableCell>{revenue.completedCount} 节</TableCell>
                          <TableCell className="text-right font-semibold text-blue-600">
                            {revenue.totalRevenueCNY > 0 ? `¥${revenue.totalRevenueCNY.toFixed(2)}` : '-'}
                          </TableCell>
                          <TableCell className="text-right font-semibold text-purple-600">
                            {revenue.totalRevenueHKD > 0 ? `HK$${revenue.totalRevenueHKD.toFixed(2)}` : '-'}
                          </TableCell>
                          <TableCell className="text-right font-semibold text-green-600">
                            ¥{revenue.totalRevenue.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* 详细课程明细 */}
              {report.teacherRevenues.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">详细课程明细</h3>
                  {report.teacherRevenues.map(revenue => (
                    <Card key={revenue.teacherId}>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <span>{revenue.teacherName}</span>
                          <span className="text-gray-600 font-normal">
                            - 共 {revenue.completedCount} 节课
                          </span>
                          {revenue.totalRevenueCNY > 0 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              人民币 ¥{revenue.totalRevenueCNY.toFixed(2)}
                            </span>
                          )}
                          {revenue.totalRevenueHKD > 0 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              港币 HK${revenue.totalRevenueHKD.toFixed(2)}
                            </span>
                          )}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>日期时间</TableHead>
                              <TableHead>科目</TableHead>
                              <TableHead>学生</TableHead>
                              <TableHead className="text-right">收入</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {revenue.schedules.map(schedule => (
                              <TableRow key={schedule.id}>
                                <TableCell>{new Date(schedule.date).toLocaleString('zh-CN')}</TableCell>
                                <TableCell>{schedule.subject}</TableCell>
                                <TableCell>{schedule.studentNames.join(', ')}</TableCell>
                                <TableCell className="text-right">
                                  {schedule.currency === 'CNY' ? '¥' : 'HK$'}{schedule.amount.toFixed(2)}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default BillingPage;
