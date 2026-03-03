import React, { useState, useMemo } from 'react';
import { Plus, Edit2, Trash2, CheckCircle, XCircle, Calendar, List, Check, ChevronsUpDown, Copy, MessageSquare } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { createSchedule, updateScheduleStatus, checkScheduleConflict } from '@/services/scheduleService';
import { generateScheduleMessage, copyToClipboard } from '@/services/messageService';
import { Schedule, ScheduleFormData } from '@/types/schedule';
import PageHeader from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDateTime } from '@/utils/dateUtils';
import MonthCalendar from '@/components/calendar/MonthCalendar';
import { format } from 'date-fns';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const SchedulesPage = () => {
  const { state, dispatch } = useApp();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null); // 正在编辑的课程
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(''); // 筛选教师，初始为空，后面会设置
  const [studentSearchOpen, setStudentSearchOpen] = useState(false);
  const [studentSearchValue, setStudentSearchValue] = useState('');
  const [copyTargetDates, setCopyTargetDates] = useState<string[]>([]);
  const [copyDateInput, setCopyDateInput] = useState<string>('');
  const [showCopyDialog, setShowCopyDialog] = useState(false);
  const [scheduleToCopy, setScheduleToCopy] = useState<Schedule | null>(null);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [scheduleToToggle, setScheduleToToggle] = useState<Schedule | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState<Schedule | null>(null);
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [showStudentSelectDialog, setShowStudentSelectDialog] = useState(false);
  const [generatedMessage, setGeneratedMessage] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [selectedStudentForMessage, setSelectedStudentForMessage] = useState<string>('');
  
  // 初始化时设置默认选中第一个教师
  React.useEffect(() => {
    if (state.teachers.length > 0 && !selectedTeacherId) {
      setSelectedTeacherId(state.teachers[0].id);
    }
  }, [state.teachers, selectedTeacherId]);
  
  const [formData, setFormData] = useState<ScheduleFormData>({
    teacherId: '',
    studentIds: [],
    subject: '',
    type: 'oneOnOne',
    startTime: '',
    endTime: '',
    notes: '',
  });

  // 获取选中教师的科目列表
  const availableSubjects = useMemo(() => {
    if (!formData.teacherId) return [];
    const teacher = state.teachers.find(t => t.id === formData.teacherId);
    return teacher?.subjects || [];
  }, [formData.teacherId, state.teachers]);

  // 筛选后的学生列表（用于搜索）
  const filteredStudents = useMemo(() => {
    if (!studentSearchValue) return state.students;
    return state.students.filter(s => 
      s.name.toLowerCase().includes(studentSearchValue.toLowerCase()) ||
      s.grade.toLowerCase().includes(studentSearchValue.toLowerCase())
    );
  }, [studentSearchValue, state.students]);

  // 根据选中教师筛选课程
  const displayedSchedules = useMemo(() => {
    if (!selectedTeacherId || selectedTeacherId === 'all') return state.schedules;
    return state.schedules.filter(s => s.teacherId === selectedTeacherId);
  }, [selectedTeacherId, state.schedules]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 验证必填字段并给出友好提示
    if (!formData.teacherId) {
      toast({
        variant: "destructive",
        title: "请选择教师",
      });
      return;
    }
    
    if (formData.studentIds.length === 0) {
      toast({
        variant: "destructive",
        title: "请至少选择一名学生",
      });
      return;
    }
    
    if (!formData.subject) {
      toast({
        variant: "destructive",
        title: "请选择科目",
      });
      return;
    }
    
    if (!formData.startTime || !formData.endTime) {
      toast({
        variant: "destructive",
        title: "请选择开始和结束时间",
      });
      return;
    }
    
    if (formData.startTime >= formData.endTime) {
      toast({
        variant: "destructive",
        title: "结束时间必须晚于开始时间",
      });
      return;
    }
    
    const hasConflict = checkScheduleConflict(
      state.schedules,
      formData.teacherId,
      formData.startTime,
      formData.endTime,
      editingSchedule?.id
    );
    
    if (hasConflict) {
      toast({
        variant: "destructive",
        title: "时间冲突",
        description: "该时间段与其他课程冲突，请选择其他时间",
      });
      return;
    }
    
    if (editingSchedule) {
      const updatedSchedule = {
        ...editingSchedule,
        ...formData,
        updatedAt: new Date().toISOString(),
      };
      dispatch({ type: 'UPDATE_SCHEDULE', payload: updatedSchedule });
      // 成功操作不显示提示
    } else {
      const newSchedule = createSchedule(formData);
      dispatch({ type: 'ADD_SCHEDULE', payload: newSchedule });
      // 成功操作不显示提示
    }
    
    handleCloseDialog();
  };

  const handleCopySchedule = () => {
    if (!scheduleToCopy || copyTargetDates.length === 0) {
      toast({
        variant: "destructive",
        title: "请至少添加一个目标日期",
      });
      return;
    }

    const originalStart = new Date(scheduleToCopy.startTime);
    const originalEnd = new Date(scheduleToCopy.endTime);
    
    const startHours = originalStart.getHours();
    const startMinutes = originalStart.getMinutes();
    const endHours = originalEnd.getHours();
    const endMinutes = originalEnd.getMinutes();
    
    let successCount = 0;
    let conflictDates: string[] = [];
    
    // 遍历所有目标日期
    copyTargetDates.forEach(dateStr => {
      const targetDate = new Date(dateStr);
      const newStart = new Date(targetDate);
      newStart.setHours(startHours, startMinutes, 0, 0);
      
      const newEnd = new Date(targetDate);
      newEnd.setHours(endHours, endMinutes, 0, 0);
      
      const hasConflict = checkScheduleConflict(
        state.schedules,
        scheduleToCopy.teacherId,
        newStart.toISOString(),
        newEnd.toISOString()
      );
      
      if (hasConflict) {
        conflictDates.push(format(targetDate, 'yyyy-MM-dd'));
      } else {
        const newSchedule = createSchedule({
          teacherId: scheduleToCopy.teacherId,
          studentIds: scheduleToCopy.studentIds,
          subject: scheduleToCopy.subject,
          type: scheduleToCopy.type,
          startTime: format(newStart, "yyyy-MM-dd'T'HH:mm"),
          endTime: format(newEnd, "yyyy-MM-dd'T'HH:mm"),
          notes: scheduleToCopy.notes,
        });
        
        dispatch({ type: 'ADD_SCHEDULE', payload: newSchedule });
        successCount++;
      }
    });
    
    // 显示结果提示
    if (conflictDates.length > 0) {
      toast({
        variant: "destructive",
        title: `成功复制 ${successCount} 节课程`,
        description: `以下日期存在冲突：${conflictDates.join(', ')}`,
      });
    }
    
    setShowCopyDialog(false);
    setScheduleToCopy(null);
    setCopyTargetDates([]);
    setCopyDateInput('');
  };

  const handleToggleStatus = (schedule: Schedule) => {
    setScheduleToToggle(schedule);
    setShowStatusDialog(true);
  };

  const confirmToggleStatus = () => {
    if (!scheduleToToggle) return;
    
    const newStatus = scheduleToToggle.status === 'completed' ? 'pending' : 'completed';
    const updated = updateScheduleStatus(scheduleToToggle, newStatus);
    dispatch({ type: 'UPDATE_SCHEDULE', payload: updated });
    
    setShowStatusDialog(false);
    setScheduleToToggle(null);
    setSelectedSchedule(null);
    // 成功操作不显示提示
  };

  const handleDelete = (schedule: Schedule) => {
    setScheduleToDelete(schedule);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (!scheduleToDelete) return;
    
    dispatch({ type: 'DELETE_SCHEDULE', payload: scheduleToDelete.id });
    setShowDeleteDialog(false);
    setScheduleToDelete(null);
    setSelectedSchedule(null);
  };

  const handleGenerateMessage = () => {
    if (!selectedTeacherId || selectedTeacherId === 'all') {
      toast({
        variant: "destructive",
        title: "请先选择教师",
      });
      return;
    }

    // 获取该教师的所有学生
    const teacherSchedules = state.schedules.filter(s => s.teacherId === selectedTeacherId);
    if (teacherSchedules.length === 0) {
      toast({
        variant: "destructive",
        title: "该教师暂无课程安排",
      });
      return;
    }

    // 获取该教师的所有学生ID（去重）
    const studentIds = Array.from(new Set(teacherSchedules.flatMap(s => s.studentIds)));
    
    if (studentIds.length === 0) {
      toast({
        variant: "destructive",
        title: "该教师暂无学生",
      });
      return;
    }

    // 重置月份为当前月
    setSelectedMonth(new Date());
    
    // 无论有多少学生，都显示选择对话框（包含月份选择）
    setShowStudentSelectDialog(true);
  };

  const generateMessageForStudent = (studentId: string) => {
    const student = state.students.find(s => s.id === studentId);
    const teacher = state.teachers.find(t => t.id === selectedTeacherId);

    if (!student || !teacher) {
      toast({
        variant: "destructive",
        title: "数据错误",
      });
      return;
    }

    const message = generateScheduleMessage(
      state.schedules.filter(s => s.teacherId === selectedTeacherId),
      student,
      teacher,
      selectedMonth
    );

    setGeneratedMessage(message);
    setShowStudentSelectDialog(false);
    setShowMessageDialog(true);
  };

  const handleCopyMessage = async () => {
    const success = await copyToClipboard(generatedMessage);
    if (success) {
      toast({
        title: "复制成功",
        description: "消息已复制到剪贴板",
      });
    } else {
      toast({
        variant: "destructive",
        title: "复制失败",
        description: "请手动复制消息",
      });
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingSchedule(null);
    setFormData({
      teacherId: '',
      studentIds: [],
      subject: '',
      type: 'oneOnOne',
      startTime: '',
      endTime: '',
      notes: '',
    });
    setStudentSearchValue('');
  };

  const handleDateClick = (date: Date) => {
    // 设置默认开始时间为上午9:00，结束时间为10:00
    const startTime = new Date(date);
    startTime.setHours(9, 0, 0, 0);
    
    const endTime = new Date(date);
    endTime.setHours(10, 0, 0, 0);
    
    setFormData({
      teacherId: selectedTeacherId && selectedTeacherId !== 'all' ? selectedTeacherId : '',
      studentIds: [],
      subject: '',
      type: 'oneOnOne',
      startTime: format(startTime, "yyyy-MM-dd'T'HH:mm"),
      endTime: format(endTime, "yyyy-MM-dd'T'HH:mm"),
      notes: '',
    });
    setIsDialogOpen(true);
  };

  const handleScheduleClick = (schedule: Schedule) => {
    setSelectedSchedule(schedule);
  };
  
  const handleEditSchedule = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    setFormData({
      teacherId: schedule.teacherId,
      studentIds: schedule.studentIds,
      subject: schedule.subject,
      type: schedule.type,
      startTime: format(new Date(schedule.startTime), "yyyy-MM-dd'T'HH:mm"),
      endTime: format(new Date(schedule.endTime), "yyyy-MM-dd'T'HH:mm"),
      notes: schedule.notes || '',
    });
    setSelectedSchedule(null); // 关闭详情对话框
    setIsDialogOpen(true); // 打开编辑对话框
  };

  const getTeacherName = (teacherId: string) => {
    const teacher = state.teachers.find(t => t.id === teacherId);
    return teacher?.name || '未知教师';
  };

  const getStudentNames = (studentIds: string[]) => {
    return studentIds
      .map(id => state.students.find(s => s.id === id)?.name || '未知学生')
      .join(', ');
  };

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), 'HH:mm');
  };

  const getScheduleFee = (schedule: Schedule) => {
    const students = schedule.studentIds
      .map(id => state.students.find(s => s.id === id))
      .filter(s => s !== undefined);
    
    if (students.length === 0) return 0;
    
    const totalFee = students.reduce((sum, student) => {
      return sum + (student.ratePerClass / schedule.studentIds.length);
    }, 0);
    
    return totalFee;
  };

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title="课程安排"
        description="使用日历视图或列表视图管理课程"
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleGenerateMessage}
              disabled={!selectedTeacherId || selectedTeacherId === 'all'}
              title="生成课程安排消息"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              生成消息
            </Button>
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'calendar' | 'list')}>
              <TabsList>
                <TabsTrigger value="calendar" className="gap-2">
                  <Calendar className="w-4 h-4" />
                  日历
                </TabsTrigger>
                <TabsTrigger value="list" className="gap-2">
                  <List className="w-4 h-4" />
                  列表
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <Button 
              className="bg-primary-600 hover:bg-primary-700"
              onClick={() => setIsDialogOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              添加课程
            </Button>
          </div>
        }
      />

      <div className="flex-1 p-8 overflow-hidden flex flex-col gap-4">
        {/* 教师筛选器 */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-4">
            <Label className="text-sm font-medium whitespace-nowrap">选择教师:</Label>
            <Select value={selectedTeacherId || 'placeholder-teacher-filter'} onValueChange={(value) => {
              if (value !== 'placeholder-teacher-filter') {
                setSelectedTeacherId(value);
              }
            }}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="请选择教师" />
              </SelectTrigger>
              <SelectContent>
                {!selectedTeacherId && (
                  <SelectItem value="placeholder-teacher-filter" disabled>
                    请选择教师
                  </SelectItem>
                )}
                <SelectItem value="all">所有教师</SelectItem>
                {state.teachers.map(teacher => (
                  <SelectItem key={teacher.id} value={teacher.id}>
                    {teacher.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedTeacherId && selectedTeacherId !== 'all' && (
              <span className="text-sm text-gray-600">
                共 {displayedSchedules.length} 节课程
              </span>
            )}
          </div>
        </div>

        {viewMode === 'calendar' ? (
          <MonthCalendar
            schedules={displayedSchedules}
            students={state.students}
            teachers={state.teachers}
            onScheduleClick={handleScheduleClick}
            onDateClick={handleDateClick}
          />
        ) : (
          <div className="bg-white rounded-lg shadow h-full overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>教师</TableHead>
                  <TableHead>学生</TableHead>
                  <TableHead>科目</TableHead>
                  <TableHead>类型</TableHead>
                  <TableHead>开始时间</TableHead>
                  <TableHead>结束时间</TableHead>
                  <TableHead>课程费用</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedSchedules.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-gray-500 py-8">
                      {selectedTeacherId && selectedTeacherId !== 'all' 
                        ? '该教师暂无课程安排，点击右上角添加课程' 
                        : state.teachers.length === 0
                          ? '暂无教师信息，请先添加教师'
                          : '请先选择教师'}
                    </TableCell>
                  </TableRow>
                ) : (
                  displayedSchedules
                    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
                    .map(schedule => (
                      <TableRow key={schedule.id}>
                        <TableCell className="font-medium">{getTeacherName(schedule.teacherId)}</TableCell>
                        <TableCell>{getStudentNames(schedule.studentIds)}</TableCell>
                        <TableCell>{schedule.subject}</TableCell>
                        <TableCell>
                          <Badge variant={schedule.type === 'oneOnOne' ? 'default' : 'secondary'}>
                            {schedule.type === 'oneOnOne' ? '一对一' : '小班课'}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDateTime(schedule.startTime)}</TableCell>
                        <TableCell>{formatDateTime(schedule.endTime)}</TableCell>
                        <TableCell className="text-green-600 font-medium">¥{getScheduleFee(schedule).toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge variant={schedule.status === 'completed' ? 'default' : 'outline'}>
                            {schedule.status === 'completed' ? '已完成' : '待完成'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditSchedule(schedule)}
                              title="编辑课程"
                            >
                              <Edit2 className="w-4 h-4 text-blue-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setScheduleToCopy(schedule);
                                setShowCopyDialog(true);
                              }}
                              title="复制到后续周"
                            >
                              <Copy className="w-4 h-4 text-blue-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleStatus(schedule)}
                              title={schedule.status === 'completed' ? '标记为待完成' : '标记为已完成'}
                            >
                              {schedule.status === 'completed' ? (
                                <XCircle className="w-4 h-4 text-gray-600" />
                              ) : (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(schedule)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* 添加/编辑课程对话框 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingSchedule ? '编辑课程' : '添加课程'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="teacherId">教师 *</Label>
              <Select
                value={formData.teacherId || 'placeholder-teacher'}
                onValueChange={value => {
                  if (value === 'placeholder-teacher') return;
                  setFormData({ 
                    ...formData, 
                    teacherId: value,
                    subject: '', // 切换教师时清空科目
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择教师" />
                </SelectTrigger>
                <SelectContent>
                  {!formData.teacherId && (
                    <SelectItem value="placeholder-teacher" disabled>
                      选择教师
                    </SelectItem>
                  )}
                  {state.teachers.map(teacher => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="subject">科目 *</Label>
              <Select
                value={formData.subject || 'placeholder-subject'}
                onValueChange={value => {
                  if (value === 'placeholder-subject') return;
                  setFormData({ ...formData, subject: value });
                }}
                disabled={!formData.teacherId || availableSubjects.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={
                    !formData.teacherId 
                      ? "请先选择教师" 
                      : availableSubjects.length === 0 
                        ? "该教师暂无科目" 
                        : "选择科目"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {!formData.subject && (
                    <SelectItem value="placeholder-subject" disabled>
                      {!formData.teacherId 
                        ? "请先选择教师" 
                        : availableSubjects.length === 0 
                          ? "该教师暂无科目" 
                          : "选择科目"}
                    </SelectItem>
                  )}
                  {availableSubjects.map(subject => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formData.teacherId && availableSubjects.length === 0 && (
                <p className="text-xs text-amber-600 mt-1">该教师暂无科目，请先在教师管理中添加</p>
              )}
            </div>

            <div>
              <Label htmlFor="type">课程类型 *</Label>
              <Select
                value={formData.type}
                onValueChange={(value: 'oneOnOne' | 'smallClass') => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="oneOnOne">一对一</SelectItem>
                  <SelectItem value="smallClass">小班课</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>学生 * (支持搜索)</Label>
              <Popover open={studentSearchOpen} onOpenChange={setStudentSearchOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={studentSearchOpen}
                    className="w-full justify-between"
                  >
                    {formData.studentIds.length > 0
                      ? `已选择 ${formData.studentIds.length} 位学生`
                      : "搜索并选择学生"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0">
                  <Command>
                    <CommandInput 
                      placeholder="搜索学生姓名或年级..." 
                      value={studentSearchValue}
                      onValueChange={setStudentSearchValue}
                    />
                    <CommandList>
                      <CommandEmpty>未找到学生</CommandEmpty>
                      <CommandGroup>
                        {filteredStudents.map((student) => {
                          const isSelected = formData.studentIds.includes(student.id);
                          return (
                            <CommandItem
                              key={student.id}
                              value={`${student.name}-${student.grade}`}
                              onSelect={() => {
                                if (isSelected) {
                                  setFormData({
                                    ...formData,
                                    studentIds: formData.studentIds.filter(id => id !== student.id)
                                  });
                                } else {
                                  setFormData({
                                    ...formData,
                                    studentIds: [...formData.studentIds, student.id]
                                  });
                                }
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  isSelected ? "opacity-100" : "opacity-0"
                                )}
                              />
                              <div className="flex-1">
                                <div className="font-medium">{student.name}</div>
                                <div className="text-xs text-gray-500">{student.grade}</div>
                              </div>
                              <div className="text-xs text-green-600 font-medium">
                                ¥{student.ratePerClass}/节
                              </div>
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              
              {/* 已选择的学生列表 */}
              {formData.studentIds.length > 0 && (
                <div className="mt-2 p-2 border rounded-md space-y-1 max-h-32 overflow-y-auto bg-gray-50">
                  {formData.studentIds.map(studentId => {
                    const student = state.students.find(s => s.id === studentId);
                    if (!student) return null;
                    return (
                      <div key={studentId} className="flex items-center justify-between text-sm bg-white p-2 rounded">
                        <span>{student.name} ({student.grade})</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-green-600">¥{student.ratePerClass}/节</span>
                          <button
                            type="button"
                            onClick={() => {
                              setFormData({
                                ...formData,
                                studentIds: formData.studentIds.filter(id => id !== studentId)
                              });
                            }}
                            className="text-red-600 hover:text-red-700 text-lg leading-none"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              
              {formData.studentIds.length > 1 && (
                <p className="text-xs text-gray-500 mt-1">
                  小班课：每个学生的费率将按人数分摊
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="startTime">开始时间 *</Label>
              <Input
                id="startTime"
                type="datetime-local"
                value={formData.startTime}
                onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="endTime">结束时间 *</Label>
              <Input
                id="endTime"
                type="datetime-local"
                value={formData.endTime}
                onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="notes">备注</Label>
              <Input
                id="notes"
                value={formData.notes}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                取消
              </Button>
              <Button type="submit" className="bg-primary-600 hover:bg-primary-700">
                {editingSchedule ? '保存' : '创建'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* 课程详情对话框 */}
      <Dialog open={!!selectedSchedule} onOpenChange={() => setSelectedSchedule(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>课程详情</DialogTitle>
          </DialogHeader>
          {selectedSchedule && (
            <div className="space-y-4">
              <div>
                <Label className="text-gray-600">教师</Label>
                <p className="font-medium">{getTeacherName(selectedSchedule.teacherId)}</p>
              </div>
              <div>
                <Label className="text-gray-600">学生</Label>
                <p className="font-medium">{getStudentNames(selectedSchedule.studentIds)}</p>
              </div>
              <div>
                <Label className="text-gray-600">科目</Label>
                <p className="font-medium">{selectedSchedule.subject}</p>
              </div>
              <div>
                <Label className="text-gray-600">课程类型</Label>
                <div>
                  <Badge variant={selectedSchedule.type === 'oneOnOne' ? 'default' : 'secondary'}>
                    {selectedSchedule.type === 'oneOnOne' ? '一对一' : '小班课'}
                  </Badge>
                </div>
              </div>
              <div>
                <Label className="text-gray-600">时间</Label>
                <p className="font-medium">
                  {formatDateTime(selectedSchedule.startTime)} - {formatDateTime(selectedSchedule.endTime)}
                </p>
              </div>
              <div>
                <Label className="text-gray-600">课程费用</Label>
                <p className="font-medium text-green-600 text-lg">
                  ¥{getScheduleFee(selectedSchedule).toFixed(2)}
                </p>
              </div>
              <div>
                <Label className="text-gray-600">状态</Label>
                <div>
                  <Badge variant={selectedSchedule.status === 'completed' ? 'default' : 'outline'}>
                    {selectedSchedule.status === 'completed' ? '已完成' : '待完成'}
                  </Badge>
                </div>
              </div>
              {selectedSchedule.notes && (
                <div>
                  <Label className="text-gray-600">备注</Label>
                  <p className="text-sm">{selectedSchedule.notes}</p>
                </div>
              )}
              
              {/* 操作按钮区域 */}
              <div className="space-y-3 pt-4 border-t">
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={() => handleEditSchedule(selectedSchedule)}
                    className="w-full"
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    编辑课程
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedSchedule(null);
                      setScheduleToCopy(selectedSchedule);
                      setShowCopyDialog(true);
                    }}
                    className="w-full"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    复制课程
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={() => handleToggleStatus(selectedSchedule)}
                    className="w-full"
                  >
                    {selectedSchedule.status === 'completed' ? (
                      <>
                        <XCircle className="w-4 h-4 mr-2" />
                        标记待完成
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        标记已完成
                      </>
                    )}
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleDelete(selectedSchedule)}
                    className="w-full"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    删除课程
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 复制课程对话框 */}
      <Dialog open={showCopyDialog} onOpenChange={setShowCopyDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>复制课程到多个日期</DialogTitle>
          </DialogHeader>
          {scheduleToCopy && (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md space-y-1 text-sm">
                <p className="font-medium text-blue-900">{scheduleToCopy.subject}</p>
                <div className="text-blue-700 space-y-1">
                  <p><span className="font-medium">教师：</span>{getTeacherName(scheduleToCopy.teacherId)}</p>
                  <p><span className="font-medium">学生：</span>{getStudentNames(scheduleToCopy.studentIds)}</p>
                  <p><span className="font-medium">原时间：</span>{formatDateTime(scheduleToCopy.startTime)}</p>
                  <p><span className="font-medium">时长：</span>
                    {formatTime(scheduleToCopy.startTime)} - {formatTime(scheduleToCopy.endTime)}
                  </p>
                </div>
              </div>
              
              <div>
                <Label htmlFor="copyDateInput">添加目标日期 *</Label>
                <div className="flex gap-2">
                  <Input
                    id="copyDateInput"
                    type="date"
                    value={copyDateInput}
                    onChange={e => setCopyDateInput(e.target.value)}
                    min={format(new Date(), 'yyyy-MM-dd')}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (copyDateInput && !copyTargetDates.includes(copyDateInput)) {
                        setCopyTargetDates([...copyTargetDates, copyDateInput]);
                        setCopyDateInput('');
                      }
                    }}
                    disabled={!copyDateInput || copyTargetDates.includes(copyDateInput)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  课程将保持原有的上课时间（{formatTime(scheduleToCopy.startTime)} - {formatTime(scheduleToCopy.endTime)}）
                </p>
              </div>

              {/* 已选择的日期列表 */}
              {copyTargetDates.length > 0 && (
                <div>
                  <Label className="text-sm text-gray-700">已选择日期 ({copyTargetDates.length})</Label>
                  <div className="mt-2 space-y-2 max-h-48 overflow-y-auto p-2 border rounded-md bg-gray-50">
                    {copyTargetDates
                      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
                      .map((date, index) => (
                        <div 
                          key={index} 
                          className="flex items-center justify-between bg-white p-2 rounded text-sm"
                        >
                          <span className="font-medium">
                            {format(new Date(date), 'yyyy年MM月dd日')}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setCopyTargetDates(copyTargetDates.filter(d => d !== date));
                            }}
                            className="text-red-600 hover:text-red-700 text-lg leading-none"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 justify-end pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowCopyDialog(false);
                    setScheduleToCopy(null);
                    setCopyTargetDates([]);
                    setCopyDateInput('');
                  }}
                >
                  取消
                </Button>
                <Button 
                  type="button" 
                  className="bg-primary-600 hover:bg-primary-700"
                  onClick={handleCopySchedule}
                  disabled={copyTargetDates.length === 0}
                >
                  确认复制 ({copyTargetDates.length})
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 标记完成/待完成确认对话框 */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {scheduleToToggle?.status === 'completed' ? '标记为待完成' : '标记为已完成'}
            </DialogTitle>
          </DialogHeader>
          {scheduleToToggle && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-md space-y-2">
                <p className="font-medium text-blue-900">{scheduleToToggle.subject}</p>
                <div className="text-sm text-blue-700 space-y-1">
                  <p><span className="font-medium">教师：</span>{getTeacherName(scheduleToToggle.teacherId)}</p>
                  <p><span className="font-medium">学生：</span>{getStudentNames(scheduleToToggle.studentIds)}</p>
                  <p><span className="font-medium">时间：</span>{formatDateTime(scheduleToToggle.startTime)}</p>
                  <p><span className="font-medium">费用：</span>¥{getScheduleFee(scheduleToToggle).toFixed(2)}</p>
                </div>
              </div>
              
              <p className="text-sm text-gray-600">
                {scheduleToToggle.status === 'completed' 
                  ? '确认要将此课程标记为【待完成】吗？' 
                  : '确认要将此课程标记为【已完成】吗？'}
              </p>

              <div className="flex gap-3 justify-end pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowStatusDialog(false);
                    setScheduleToToggle(null);
                  }}
                >
                  取消
                </Button>
                <Button 
                  type="button" 
                  className={scheduleToToggle.status === 'completed' 
                    ? 'bg-gray-600 hover:bg-gray-700' 
                    : 'bg-green-600 hover:bg-green-700'}
                  onClick={confirmToggleStatus}
                >
                  {scheduleToToggle.status === 'completed' 
                    ? '标记为待完成' 
                    : '标记为已完成'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 删除课程确认对话框 */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>删除课程</DialogTitle>
          </DialogHeader>
          {scheduleToDelete && (
            <div className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-md space-y-2">
                <p className="font-medium text-red-900">{scheduleToDelete.subject}</p>
                <div className="text-sm text-red-700 space-y-1">
                  <p><span className="font-medium">教师：</span>{getTeacherName(scheduleToDelete.teacherId)}</p>
                  <p><span className="font-medium">学生：</span>{getStudentNames(scheduleToDelete.studentIds)}</p>
                  <p><span className="font-medium">时间：</span>{formatDateTime(scheduleToDelete.startTime)}</p>
                  <p><span className="font-medium">费用：</span>¥{getScheduleFee(scheduleToDelete).toFixed(2)}</p>
                </div>
              </div>
              
              <p className="text-sm text-gray-600">
                确定要删除这节课程吗？删除后将无法恢复。
              </p>

              <div className="flex gap-3 justify-end pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowDeleteDialog(false);
                    setScheduleToDelete(null);
                  }}
                >
                  取消
                </Button>
                <Button 
                  type="button" 
                  variant="destructive"
                  onClick={confirmDelete}
                >
                  确认删除
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 选择学生对话框 */}
      <Dialog open={showStudentSelectDialog} onOpenChange={setShowStudentSelectDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>生成课程安排消息</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* 月份选择 */}
            <div>
              <Label htmlFor="messageMonth">选择月份</Label>
              <Input
                id="messageMonth"
                type="month"
                value={format(selectedMonth, 'yyyy-MM')}
                onChange={(e) => {
                  const newDate = new Date(e.target.value);
                  setSelectedMonth(newDate);
                }}
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                将生成该月的课程安排，并显示上个月的上课记录
              </p>
            </div>

            {/* 学生选择 */}
            <div>
              <Label>选择学生</Label>
              <div className="mt-2 space-y-2">
                {(() => {
                  const teacherSchedules = state.schedules.filter(s => s.teacherId === selectedTeacherId);
                  const studentIds = Array.from(new Set(teacherSchedules.flatMap(s => s.studentIds)));
                  const students = studentIds.map(id => state.students.find(s => s.id === id)).filter(s => s !== undefined);
                  
                  return students.map(student => (
                    <Button
                      key={student.id}
                      variant="outline"
                      className="w-full justify-start text-left h-auto py-3"
                      onClick={() => {
                        setSelectedStudentForMessage(student.id);
                        generateMessageForStudent(student.id);
                      }}
                    >
                      <div className="flex-1">
                        <div className="font-medium">{student.name}</div>
                        <div className="text-xs text-gray-500">{student.grade}</div>
                      </div>
                    </Button>
                  ));
                })()}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 生成消息对话框 */}
      <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>课程安排消息</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 border rounded-md font-mono text-sm whitespace-pre-wrap max-h-96 overflow-y-auto">
              {generatedMessage}
            </div>
            
            <div className="flex gap-3 justify-end pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowMessageDialog(false)}
              >
                关闭
              </Button>
              <Button 
                type="button" 
                className="bg-primary-600 hover:bg-primary-700"
                onClick={handleCopyMessage}
              >
                <Copy className="w-4 h-4 mr-2" />
                复制消息
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SchedulesPage;
