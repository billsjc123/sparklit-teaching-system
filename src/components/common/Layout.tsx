import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Users, GraduationCap, Calendar, DollarSign, Settings, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();
  const { toast } = useToast();

  const navItems = [
    { id: 'dashboard', label: '仪表板', icon: Settings, path: '/dashboard' },
    { id: 'users', label: '用户管理', icon: UserIcon, path: '/admin/users', adminOnly: true },
    { id: 'teachers', label: '教师管理', icon: Users, path: '/teachers', adminOnly: true },
    { id: 'students', label: '学生管理', icon: GraduationCap, path: '/students', adminOnly: true },
    { id: 'schedules', label: '课程安排', icon: Calendar, path: '/schedules' },
    { id: 'billing', label: '费用管理', icon: DollarSign, path: '/billing' },
  ];

  // 根据角色过滤导航项
  const filteredNavItems = navItems.filter(item => {
    if (item.adminOnly && !isAdmin) return false;
    return true;
  });

  async function handleLogout() {
    logout()
      .then(() => {
        toast({
          title: '已登出',
          description: '您已成功登出系统'
        });
        navigate('/login');
      })
      .catch((error) => {
        console.error('登出失败:', error);
        toast({
          title: '登出失败',
          description: '请稍后重试',
          variant: 'destructive'
        });
      });
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm">
        <div className="h-16 flex items-center justify-center border-b border-gray-200 bg-gradient-to-r from-blue-500 to-blue-600">
          <h1 className="text-xl font-bold text-white">教学管理系统</h1>
        </div>
        
        <nav className="flex-1 p-4">
          {filteredNavItems.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.id}
                to={item.path}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 font-medium shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* 用户信息和退出 */}
        <div className="p-4 border-t border-gray-200">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-gray-900">{user?.username}</p>
                  <p className="text-xs text-gray-500">
                    {user?.role === 'admin' ? '管理员' : '教师'}
                  </p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>我的账户</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/profile')}>
                <UserIcon className="mr-2 h-4 w-4" />
                <span>个人设置</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                <span>退出登录</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <p className="text-xs text-gray-500 text-center mt-4">
            版本 2.0.0
          </p>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
};

export default Layout;
