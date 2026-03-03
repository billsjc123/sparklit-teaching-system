import React, { useState } from 'react';
import { Plus, Edit2, Trash2, AlertTriangle } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { createTeacher, updateTeacher } from '@/services/teacherService';
import { Teacher, TeacherFormData } from '@/types/teacher';
import PageHeader from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';

const TeachersPage = () => {
  const { state, dispatch } = useApp();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState<Teacher | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [formData, setFormData] = useState<TeacherFormData>({
    name: '',
    email: '',
    phone: '',
    subjects: [],
  });
  const [subjectInput, setSubjectInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 验证必填字段
    if (!formData.name.trim()) {
      alert('❌ 请输入教师姓名');
      return;
    }
    
    if (!formData.email.trim()) {
      alert('❌ 请输入电子邮箱');
      return;
    }
    
    if (!formData.phone.trim()) {
      alert('❌ 请输入联系电话');
      return;
    }
    
    if (editingTeacher) {
      const updated = updateTeacher(editingTeacher, formData);
      dispatch({ type: 'UPDATE_TEACHER', payload: updated });
      alert('✅ 教师信息更新成功');
    } else {
      const newTeacher = createTeacher(formData);
      dispatch({ type: 'ADD_TEACHER', payload: newTeacher });
      alert('✅ 教师添加成功');
    }
    
    handleCloseDialog();
  };

  const handleEdit = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      name: teacher.name,
      email: teacher.email,
      phone: teacher.phone,
      subjects: teacher.subjects,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    const teacher = state.teachers.find(t => t.id === id);
    if (!teacher) return;
    
    setTeacherToDelete(teacher);
    setDeleteConfirmText('');
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!teacherToDelete) return;
    
    const expectedText = `我确认删除${teacherToDelete.name}`;
    if (deleteConfirmText !== expectedText) {
      alert('❌ 确认文本不正确，请重新输入');
      return;
    }
    
    // 检查是否有关联的课程
    const relatedSchedules = state.schedules.filter(s => s.teacherId === teacherToDelete.id);
    
    // 先删除相关课程
    relatedSchedules.forEach(schedule => {
      dispatch({ type: 'DELETE_SCHEDULE', payload: schedule.id });
    });
    
    // 再删除教师
    dispatch({ type: 'DELETE_TEACHER', payload: teacherToDelete.id });
    
    // 关闭对话框并重置状态
    setDeleteDialogOpen(false);
    setTeacherToDelete(null);
    setDeleteConfirmText('');
    
    // 操作反馈
    if (relatedSchedules.length > 0) {
      alert(`✅ 已删除教师"${teacherToDelete.name}"及其 ${relatedSchedules.length} 节相关课程`);
    } else {
      alert(`✅ 已删除教师"${teacherToDelete.name}"`);
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingTeacher(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      subjects: [],
    });
    setSubjectInput('');
  };

  const handleAddSubject = () => {
    if (subjectInput.trim() && !formData.subjects.includes(subjectInput.trim())) {
      setFormData({
        ...formData,
        subjects: [...formData.subjects, subjectInput.trim()],
      });
      setSubjectInput('');
    }
  };

  const handleRemoveSubject = (subject: string) => {
    setFormData({
      ...formData,
      subjects: formData.subjects.filter(s => s !== subject),
    });
  };

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title="教师管理"
        description="管理所有教师信息和授课科目"
        actions={
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary-600 hover:bg-primary-700">
                <Plus className="w-4 h-4 mr-2" />
                添加教师
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingTeacher ? '编辑教师' : '添加教师'}</DialogTitle>
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
                  <Label htmlFor="email">电子邮箱 *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone">联系电话 *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="subjects">科目</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      id="subjects"
                      value={subjectInput}
                      onChange={e => setSubjectInput(e.target.value)}
                      placeholder="输入科目后回车添加"
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddSubject();
                        }
                      }}
                    />
                    <Button type="button" onClick={handleAddSubject} variant="outline">
                      添加
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.subjects.map(subject => (
                      <span
                        key={subject}
                        className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm flex items-center gap-2"
                      >
                        {subject}
                        <button
                          type="button"
                          onClick={() => handleRemoveSubject(subject)}
                          className="hover:text-primary-900"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="flex gap-3 justify-end pt-4">
                  <Button type="button" variant="outline" onClick={handleCloseDialog}>
                    取消
                  </Button>
                  <Button type="submit" className="bg-primary-600 hover:bg-primary-700">
                    {editingTeacher ? '更新' : '创建'}
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
                <TableHead>电子邮箱</TableHead>
                <TableHead>联系电话</TableHead>
                <TableHead>科目</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {state.teachers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                    暂无教师数据，点击右上角添加教师
                  </TableCell>
                </TableRow>
              ) : (
                state.teachers.map(teacher => (
                  <TableRow key={teacher.id}>
                    <TableCell className="font-medium">{teacher.name}</TableCell>
                    <TableCell>{teacher.email}</TableCell>
                    <TableCell>{teacher.phone}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {teacher.subjects.map(subject => (
                          <span
                            key={subject}
                            className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                          >
                            {subject}
                          </span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(teacher)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(teacher.id)}
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
              删除教师确认
            </DialogTitle>
            <DialogDescription>
              此操作无法撤销，请谨慎操作
            </DialogDescription>
          </DialogHeader>
          
          {teacherToDelete && (
            <div className="space-y-4">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="font-semibold">您即将删除教师：{teacherToDelete.name}</p>
                    {state.schedules.filter(s => s.teacherId === teacherToDelete.id).length > 0 && (
                      <p className="text-sm">
                        该教师还有 <span className="font-bold">{state.schedules.filter(s => s.teacherId === teacherToDelete.id).length}</span> 节课程安排，删除后相关课程也将被删除。
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
                  我确认删除{teacherToDelete.name}
                </div>
                <Input
                  id="confirmText"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="请输入上方的确认文本"
                  className="font-mono"
                />
                {deleteConfirmText && deleteConfirmText !== `我确认删除${teacherToDelete.name}` && (
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
                setTeacherToDelete(null);
                setDeleteConfirmText('');
              }}
            >
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={!teacherToDelete || deleteConfirmText !== `我确认删除${teacherToDelete.name}`}
            >
              确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeachersPage;
