import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
  requireTeacher?: boolean;
}

export function ProtectedRoute({ 
  children, 
  requireAdmin = false,
  requireTeacher = false 
}: ProtectedRouteProps) {
  const { isAuthenticated, isAdmin, isTeacher, isLoading } = useAuth();

  // 正在加载认证状态
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 text-sm">加载中...</p>
        </div>
      </div>
    );
  }

  // 未登录，重定向到登录页
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 需要 Admin 权限但用户不是 Admin
  if (requireAdmin && !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center space-y-4">
          <div className="text-6xl text-red-500">🚫</div>
          <h2 className="text-2xl font-bold text-gray-800">无权限访问</h2>
          <p className="text-gray-600">此页面需要管理员权限</p>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            返回
          </button>
        </div>
      </div>
    );
  }

  // 需要 Teacher 权限但用户不是 Teacher
  if (requireTeacher && !isTeacher) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center space-y-4">
          <div className="text-6xl text-red-500">🚫</div>
          <h2 className="text-2xl font-bold text-gray-800">无权限访问</h2>
          <p className="text-gray-600">此页面需要教师权限</p>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            返回
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
