import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Lock, DollarSign } from 'lucide-react';
import { changePassword } from '../services/authService';
import apiClient from '../services/authService';
import type { Teacher } from '../types';

export default function TeacherProfile() {
  const { user } = useAuth();
  const { state } = useApp();
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (user?.teacherId) {
      loadTeacherData();
      loadStats();
    }
  }, [user, state.teachers]);

  async function loadTeacherData() {
    if (!user?.teacherId) return;
    
    // 从 AppContext 的 state 中查找教师信息
    const teacherData = state.teachers.find(t => t.id === user.teacherId);
    if (teacherData) {
      setTeacher(teacherData);
    }
  }

  async function loadStats() {
    if (!user?.teacherId) return;

    apiClient.get(`/stats/teacher/${user.teacherId}`)
      .then(response => {
        setStats(response.data.stats);
      })
      .catch(error => {
        console.error('加载统计信息失败:', error);
      });
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();

    if (!oldPassword || !newPassword || !confirmPassword) {
      toast({
        title: '错误',
        description: '请填写所有字段',
        variant: 'destructive'
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: '错误',
        description: '新密码长度不能少于6位',
        variant: 'destructive'
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: '错误',
        description: '两次输入的密码不一致',
        variant: 'destructive'
      });
      return;
    }

    if (!user?.id) return;

    setIsChangingPassword(true);
    
    changePassword(user.id, { oldPassword, newPassword })
      .then(() => {
        toast({
          title: '修改成功',
          description: '密码已更新'
        });
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      })
      .catch(error => {
        toast({
          title: '修改失败',
          description: error.response?.data?.message || '无法修改密码',
          variant: 'destructive'
        });
      })
      .finally(() => {
        setIsChangingPassword(false);
      });
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">个人中心</h1>
        <p className="text-gray-600">管理您的个人信息和账户设置</p>
      </div>

      <Tabs defaultValue="info" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="info" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            个人信息
          </TabsTrigger>
          <TabsTrigger value="password" className="flex items-center gap-2">
            <Lock className="w-4 h-4" />
            修改密码
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            费用统计
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <Card className="shadow-lg border-0">
            <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-blue-100/50">
              <CardTitle className="text-2xl">个人信息</CardTitle>
              <CardDescription>查看您的账户和教师信息</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm font-medium text-gray-700">用户名</Label>
                  <p className="mt-1 text-base text-gray-900 font-medium">{user?.username}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">角色</Label>
                  <p className="mt-1">
                    <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-700">
                      教师
                    </span>
                  </p>
                </div>
              </div>

              {teacher && (
                <>
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">教师信息</h3>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">姓名</Label>
                        <p className="mt-1 text-base text-gray-900">{teacher.name}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">联系电话</Label>
                        <p className="mt-1 text-base text-gray-900">{teacher.phone || '-'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">邮箱</Label>
                        <p className="mt-1 text-base text-gray-900">{teacher.email || '-'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">授课科目</Label>
                        <p className="mt-1 text-base text-gray-900">
                          {Array.isArray(teacher.subjects) ? teacher.subjects.join(', ') : teacher.subjects}
                        </p>
                      </div>
                    </div>
                  </div>
                  {teacher.notes && (
                    <div className="border-t pt-6">
                      <Label className="text-sm font-medium text-gray-700">备注</Label>
                      <p className="mt-1 text-base text-gray-600">{teacher.notes}</p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="password">
          <Card className="shadow-lg border-0">
            <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-blue-100/50">
              <CardTitle className="text-2xl">修改密码</CardTitle>
              <CardDescription>定期更新密码以保护账户安全</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleChangePassword} className="space-y-5 max-w-md">
                <div className="space-y-2">
                  <Label htmlFor="old-password">旧密码</Label>
                  <Input
                    id="old-password"
                    type="password"
                    placeholder="请输入旧密码"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    disabled={isChangingPassword}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-password">新密码</Label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="请输入新密码（至少6位）"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={isChangingPassword}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">确认密码</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="请再次输入新密码"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isChangingPassword}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isChangingPassword}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                >
                  {isChangingPassword ? '修改中...' : '修改密码'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats">
          <Card className="shadow-lg border-0">
            <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-blue-100/50">
              <CardTitle className="text-2xl">费用统计</CardTitle>
              <CardDescription>查看您的课程费用统计信息</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {stats ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-blue-700">总收入</span>
                      <DollarSign className="w-5 h-5 text-blue-600" />
                    </div>
                    <p className="text-3xl font-bold text-blue-900">¥{stats.totalIncome.toFixed(2)}</p>
                    <p className="text-xs text-blue-600 mt-1">{stats.totalCount} 节课程</p>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-green-700">已完成</span>
                      <DollarSign className="w-5 h-5 text-green-600" />
                    </div>
                    <p className="text-3xl font-bold text-green-900">¥{stats.completedIncome.toFixed(2)}</p>
                    <p className="text-xs text-green-600 mt-1">{stats.completedCount} 节课程</p>
                  </div>

                  <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-6 border border-amber-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-amber-700">待完成</span>
                      <DollarSign className="w-5 h-5 text-amber-600" />
                    </div>
                    <p className="text-3xl font-bold text-amber-900">¥{stats.pendingIncome.toFixed(2)}</p>
                    <p className="text-xs text-amber-600 mt-1">{stats.pendingCount} 节课程</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
