import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { User, UserPlus, Trash2, Check, RefreshCw } from 'lucide-react';
import { getAllUsers, createTeacherUser, deleteUser, adminResetPassword } from '../services/authService';
import type { User as UserType } from '../types/auth';

export default function AdminDashboard() {
  const { state } = useApp();
  const [users, setUsers] = useState<UserType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [username, setUsername] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<{id: string, username: string} | null>(null);
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
  const [resetPasswordData, setResetPasswordData] = useState<{username: string, newPassword: string} | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setIsLoading(true);
    getAllUsers()
      .then((usersData) => {
        setUsers(usersData);
      })
      .catch((error) => {
        console.error('加载数据失败:', error);
        toast({
          title: '加载失败',
          description: '无法加载用户列表',
          variant: 'destructive'
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  async function handleCreateTeacher() {
    if (!username.trim()) {
      toast({
        title: '错误',
        description: '请输入用户名',
        variant: 'destructive'
      });
      return;
    }

    if (!selectedTeacherId) {
      toast({
        title: '错误',
        description: '请选择教师',
        variant: 'destructive'
      });
      return;
    }

    setIsCreating(true);
    
    createTeacherUser({ username, teacherId: selectedTeacherId })
      .then((result) => {
        if (result.success) {
          setGeneratedPassword(result.initialPassword || '');
          toast({
            title: '创建成功',
            description: '教师账号已创建，请记录初始密码'
          });
          loadData();
          setUsername('');
          setSelectedTeacherId('');
        }
      })
      .catch((error) => {
        console.error('创建失败:', error);
        toast({
          title: '创建失败',
          description: error.response?.data?.message || '无法创建教师账号',
          variant: 'destructive'
        });
      })
      .finally(() => {
        setIsCreating(false);
      });
  }

  function handleDeleteUser(userId: string, username: string) {
    setUserToDelete({ id: userId, username });
    setDeleteDialogOpen(true);
  }

  async function confirmDelete() {
    if (!userToDelete) return;

    deleteUser(userToDelete.id)
      .then(() => {
        toast({
          title: '删除成功',
          description: `用户 "${userToDelete.username}" 已删除`
        });
        loadData();
        setDeleteDialogOpen(false);
        setUserToDelete(null);
      })
      .catch((error) => {
        console.error('删除失败:', error);
        toast({
          title: '删除失败',
          description: error.response?.data?.message || '无法删除用户',
          variant: 'destructive'
        });
      });
  }

  async function handleResetPassword(userId: string, username: string) {
    try {
      const result = await adminResetPassword(userId);
      if (result.success && result.newPassword) {
        setResetPasswordData({ username, newPassword: result.newPassword });
        setResetPasswordDialogOpen(true);
      } else {
        toast({
          title: '重置失败',
          description: result.message || '无法重置密码',
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      console.error('重置密码失败:', error);
      
      let errorMessage = '无法重置密码，请稍后重试';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: '重置失败',
        description: errorMessage,
        variant: 'destructive'
      });
    }
  }

  function resetDialog() {
    setIsDialogOpen(false);
    setUsername('');
    setSelectedTeacherId('');
    setGeneratedPassword('');
  }

  // 过滤出尚未创建账号的教师
  const availableTeachers = state.teachers.filter(teacher => 
    !users.some(user => user.teacherId === teacher.id)
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">用户管理</h1>
        <p className="text-gray-600">管理系统用户和教师账号</p>
      </div>

      <Card className="shadow-lg border-0">
        <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-blue-100/50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">用户列表</CardTitle>
              <CardDescription className="mt-1">查看和管理所有系统用户</CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-md">
                  <UserPlus className="w-4 h-4 mr-2" />
                  创建教师账号
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>创建教师账号</DialogTitle>
                  <DialogDescription>
                    为教师创建登录账号，系统将自动生成初始密码
                  </DialogDescription>
                </DialogHeader>

                {generatedPassword ? (
                  <div className="space-y-4 py-4">
                    <div className="text-center space-y-3">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                        <Check className="w-8 h-8 text-green-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">账号创建成功！</h3>
                      <p className="text-sm text-gray-600">请记录以下初始密码并告知教师</p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 border-2 border-dashed border-gray-300">
                      <p className="text-xs text-gray-600 mb-2">初始密码（请手动复制）</p>
                      <code className="text-2xl font-mono font-bold text-blue-600 select-all cursor-text block">
                        {generatedPassword}
                      </code>
                    </div>

                    <Button onClick={resetDialog} className="w-full">
                      完成
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="teacher">选择教师</Label>
                      <Select value={selectedTeacherId} onValueChange={setSelectedTeacherId}>
                        <SelectTrigger>
                          <SelectValue placeholder="请选择教师" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableTeachers
                            .filter(teacher => teacher.id && teacher.id.trim() !== '')
                            .map(teacher => (
                              <SelectItem key={teacher.id} value={teacher.id}>
                                {teacher.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      {availableTeachers.length === 0 && (
                        <p className="text-xs text-amber-600">所有教师都已创建账号</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="username">用户名</Label>
                      <Input
                        id="username"
                        placeholder="请输入用户名"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        disabled={isCreating}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={handleCreateTeacher}
                        disabled={isCreating || !selectedTeacherId || !username.trim()}
                        className="flex-1"
                      >
                        {isCreating ? '创建中...' : '创建账号'}
                      </Button>
                      <Button onClick={resetDialog} variant="outline">
                        取消
                      </Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <User className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">暂无用户</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 text-left">
                    <th className="pb-3 text-sm font-semibold text-gray-700">用户名</th>
                    <th className="pb-3 text-sm font-semibold text-gray-700">角色</th>
                    <th className="pb-3 text-sm font-semibold text-gray-700">关联教师</th>
                    <th className="pb-3 text-sm font-semibold text-gray-700">创建时间</th>
                    <th className="pb-3 text-sm font-semibold text-gray-700 text-right">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-4 text-sm font-medium text-gray-900">{user.username}</td>
                      <td className="py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.role === 'admin' 
                            ? 'bg-purple-100 text-purple-700' 
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {user.role === 'admin' ? '管理员' : '教师'}
                        </span>
                      </td>
                      <td className="py-4 text-sm text-gray-600">
                        {user.teacherName || '-'}
                      </td>
                      <td className="py-4 text-sm text-gray-600">
                        {new Date(user.createdAt).toLocaleDateString('zh-CN')}
                      </td>
                      <td className="py-4 text-right">
                        {user.role !== 'admin' && (
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleResetPassword(user.id, user.username)}
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              title="重置密码"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteUser(user.id, user.username)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              title="删除用户"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 删除确认对话框 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除用户 "{userToDelete?.username}" 吗？此操作不可恢复。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setUserToDelete(null)}>取消</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 重置密码结果对话框 */}
      <Dialog open={resetPasswordDialogOpen} onOpenChange={setResetPasswordDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>密码重置成功</DialogTitle>
            <DialogDescription>
              用户 "{resetPasswordData?.username}" 的密码已重置
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-sm text-gray-600">请记录以下新密码并告知教师</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 border-2 border-dashed border-gray-300">
              <p className="text-xs text-gray-600 mb-2">新密码（请手动复制）</p>
              <code className="text-xl font-mono font-bold text-blue-600 select-all cursor-text block break-all">
                {resetPasswordData?.newPassword}
              </code>
            </div>

            <Button 
              onClick={() => {
                setResetPasswordDialogOpen(false);
                setResetPasswordData(null);
              }} 
              className="w-full"
            >
              完成
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
