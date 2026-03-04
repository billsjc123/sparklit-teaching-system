import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types/auth';
import * as authService from '../services/authService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isTeacher: boolean;
  isLoading: boolean;
  login: (username: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 初始化时尝试获取当前用户信息
  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    setIsLoading(true);
    authService.getCurrentUser()
      .then(user => {
        setUser(user);
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  async function login(username: string, password: string, rememberMe = false) {
    try {
      const result = await authService.login({ username, password, rememberMe });
      if (result.success && result.user) {
        setUser(result.user);
      } else {
        throw new Error(result.message || '登录失败');
      }
    } catch (error: any) {
      // 处理 Axios 错误
      if (error.response) {
        // 服务器返回了错误响应（如 401）
        const message = error.response.data?.message || '用户名或密码错误';
        throw new Error(message);
      } else if (error.request) {
        // 请求已发送但没有收到响应
        throw new Error('无法连接到服务器，请检查网络连接');
      } else if (error.message) {
        // 其他错误
        throw error;
      } else {
        throw new Error('登录失败，请稍后重试');
      }
    }
  }

  async function logout() {
    await authService.logout();
    setUser(null);
  }

  async function refreshUser() {
    const updatedUser = await authService.getCurrentUser();
    setUser(updatedUser);
  }

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isTeacher: user?.role === 'teacher',
    isLoading,
    login,
    logout,
    refreshUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
