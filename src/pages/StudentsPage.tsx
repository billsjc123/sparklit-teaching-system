import React, { useState } from 'react';
import { Plus, Edit2, Trash2, AlertTriangle } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { createStudent, updateStudent } from '@/services/studentService';
import { Student, StudentFormData } from '@/types/student';
import PageHeader from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';

const StudentsPage = () => {
  const { state, dispatch } = useApp();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [formData, setFormData] = useState<StudentFormData>({
    name: '',
    grade: '',
    parentContact: '',
    ratePerClass: 0,
    currency: 'CNY', // 默认人民币
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 验证必填字段
    if (!formData.name.trim()) {
      alert('❌ 请输入学生姓名');
      return;
    }
    
    if (!formData.grade.trim()) {
      alert('❌ 请输入年级');
      return;
    }
    
    if (!formData.parentContact.trim()) {
      alert('❌ 请输入家长联系方式');
      return;
    }
    
    if (formData.ratePerClass <= 0) {
      alert('❌ 课程费率必须大于0');
      return;
    }
    
    if (editingStudent) {
      const updated = updateStudent(editingStudent, formData);
      dispatch({ type: 'UPDATE_STUDENT', payload: updated });
      alert('✅ 学生信息更新成功');
    } else {
      const newStudent = createStudent(formData);
      dispatch({ type: 'ADD_STUDENT', payload: newStudent });
      alert('✅ 学生添加成功');
    }
    
    handleCloseDialog();
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      grade: student.grade,
      parentContact: student.parentContact,
      ratePerClass: student.ratePerClass,
      currency: student.currency,
      notes: student.notes || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    const student = state.students.find(s => s.id === id);
    if (!student) return;
    
    setStudentToDelete(student);
    setDeleteConfirmText('');
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!studentToDelete) return;
    
    const expectedText = `我确认删除${studentToDelete.name.trim()}`;
    if (deleteConfirmText.trim() !== expectedText) {
      alert('❌ 确认文本不正确，请重新输入');
      return;
    }
    
    // 检查是否有关联的课程
    const relatedSchedules = state.schedules.filter(s => s.studentIds.includes(studentToDelete.id));
    
    // 先删除相关课程
    relatedSchedules.forEach(schedule => {
      dispatch({ type: 'DELETE_SCHEDULE', payload: schedule.id });
    });
    
    // 再删除学生
    dispatch({ type: 'DELETE_STUDENT', payload: studentToDelete.id });
    
    // 关闭对话框并重置状态
    setDeleteDialogOpen(false);
    setStudentToDelete(null);
    setDeleteConfirmText('');
    
    // 操作反馈
    if (relatedSchedules.length > 0) {
      alert(`✅ 已删除学生"${studentToDelete.name}"及其 ${relatedSchedules.length} 节相关课程`);
    } else {
      alert(`✅ 已删除学生"${studentToDelete.name}"`);
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingStudent(null);
    setFormData({
      name: '',
      grade: '',
      parentContact: '',
      ratePerClass: 0,
      currency: 'CNY',
      notes: '',
    });
  };

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title="学生管理"
        description="管理所有学生信息和课程费率"
        actions={
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary-600 hover:bg-primary-700">
                <Plus className="w-4 h-4 mr-2" />
                添加学生
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingStudent ? '编辑学生' : '添加学生'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">姓名 *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="grade">年级 *</Label>
                  <Input
                    id="grade"
                    value={formData.grade}
                    onChange={e => setFormData({ ...formData, grade: e.target.value })}
                    required
                    placeholder="例如：初一、高二"
                  />
                </div>
                
                <div>
                  <Label htmlFor="parentContact">家长联系方式 *</Label>
                  <Input
                    id="parentContact"
                    value={formData.parentContact}
                    onChange={e => setFormData({ ...formData, parentContact: e.target.value })}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="ratePerClass">每节课费率 *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="ratePerClass"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.ratePerClass}
                      onChange={e => setFormData({ 
                        ...formData, 
                        ratePerClass: parseFloat(e.target.value) || 0
                      })}
                      required
                      placeholder="例如：100"
                      className="flex-1"
                    />
                    <select
                      id="currency"
                      value={formData.currency}
                      onChange={e => setFormData({ 
                        ...formData, 
                        currency: e.target.value as 'CNY' | 'HKD'
                      })}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                    >
                      <option value="CNY">人民币 (¥)</option>
                      <option value="HKD">港币 (HK$)</option>
                    </select>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">设置该学生每节课的费用（如100元/节、200元/节）</p>
                </div>
                
                <div>
                  <Label htmlFor="notes">备注</Label>
                  <Input
                    id="notes"
                    value={formData.notes}
                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="可选备注信息"
                  />
                </div>
                
                <div className="flex gap-3 justify-end pt-4">
                  <Button type="button" variant="outline" onClick={handleCloseDialog}>
                    取消
                  </Button>
                  <Button type="submit" className="bg-primary-600 hover:bg-primary-700">
                    {editingStudent ? '更新' : '创建'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="flex-1 p-8">
        <div className="bg-white rounded-lg shadow">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>姓名</TableHead>
                <TableHead>年级</TableHead>
                <TableHead>家长联系方式</TableHead>
                <TableHead>每节课费率</TableHead>
                <TableHead>币种</TableHead>
                <TableHead>备注</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {state.students.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                    暂无学生数据，点击右上角添加学生
                  </TableCell>
                </TableRow>
              ) : (
                state.students.map(student => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell>{student.grade}</TableCell>
                    <TableCell>{student.parentContact}</TableCell>
                    <TableCell className="text-green-600 font-medium">
                      {student.currency === 'CNY' ? '¥' : 'HK$'}{student.ratePerClass.toFixed(2)}/节
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        student.currency === 'CNY' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {student.currency === 'CNY' ? '人民币' : '港币'}
                      </span>
                    </TableCell>
                    <TableCell className="text-gray-600 text-sm">{student.notes || '-'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(student)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(student.id)}
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
      </div>

      {/* 删除确认对话框 */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              删除学生确认
            </DialogTitle>
            <DialogDescription>
              此操作无法撤销，请谨慎操作
            </DialogDescription>
          </DialogHeader>
          
          {studentToDelete && (
            <div className="space-y-4">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="font-semibold">您即将删除学生：{studentToDelete.name}</p>
                    {state.schedules.filter(s => s.studentIds.includes(studentToDelete.id)).length > 0 && (
                      <p className="text-sm">
                        该学生还有 <span className="font-bold">{state.schedules.filter(s => s.studentIds.includes(studentToDelete.id)).length}</span> 节课程安排，删除后相关课程也将被删除。
                      </p>
                    )}
                  </div>
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="confirmText" className="text-base">
                  请输入以下文本以确认删除：
                </Label>
                <div className="p-3 bg-gray-100 rounded border-2 border-gray-300 font-mono text-center">
                  我确认删除{studentToDelete.name.trim()}
                </div>
                <Input
                  id="confirmText"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="请输入上方的确认文本"
                  className="font-mono"
                />
                {deleteConfirmText && deleteConfirmText.trim() !== `我确认删除${studentToDelete.name.trim()}` && (
                  <p className="text-sm text-red-600">确认文本不匹配</p>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setStudentToDelete(null);
                setDeleteConfirmText('');
              }}
            >
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={!studentToDelete || deleteConfirmText.trim() !== `我确认删除${studentToDelete.name.trim()}`}
            >
              确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentsPage;
