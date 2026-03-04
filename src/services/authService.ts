import axios from 'axios';
import type { 
  User, 
  LoginRequest, 
  LoginResponse, 
  RegisterAdminRequest,
  CreateTeacherUserRequest,
  CreateTeacherUserResponse,
  ChangePasswordRequest,
  UpdateUserRequest 
} from '../types/auth';

// 开发环境使用代理，生产环境使用相对路径
const API_BASE_URL = import.meta.env.DEV ? '/api' : '/api';

// 配置 axios 实例，支持发送 cookie
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * 用户登录
 */
export async function login(data: LoginRequest): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>('/auth/login', data);
  return response.data;
}

/**
 * 用户注销
 */
export async function logout(): Promise<void> {
  await apiClient.post('/auth/logout');
}

/**
 * 获取当前登录用户信息
 */
export async function getCurrentUser(): Promise<User | null> {
  const response = await apiClient.get<{ success: boolean; user: User }>('/auth/me');
  return response.data.user;
}

/**
 * Admin 注册
 */
export async function registerAdmin(data: RegisterAdminRequest): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>('/auth/register-admin', data);
  return response.data;
}

/**
 * 创建教师账号
 */
export async function createTeacherUser(data: CreateTeacherUserRequest): Promise<CreateTeacherUserResponse> {
  const response = await apiClient.post<CreateTeacherUserResponse>('/users/teacher', data);
  return response.data;
}

/**
 * 获取所有用户
 */
export async function getAllUsers(): Promise<User[]> {
  const response = await apiClient.get<{ success: boolean; users: User[] }>('/users');
  return response.data.users;
}

/**
 * 获取单个用户信息
 */
export async function getUserById(userId: string): Promise<User> {
  const response = await apiClient.get<{ success: boolean; user: User }>(`/users/${userId}`);
  return response.data.user;
}

/**
 * 修改密码
 */
export async function changePassword(userId: string, data: ChangePasswordRequest): Promise<{ success: boolean; message: string }> {
  const response = await apiClient.put<{ success: boolean; message: string }>(`/users/${userId}/password`, data);
  return response.data;
}

/**
 * 更新用户信息
 */
export async function updateUser(userId: string, data: UpdateUserRequest): Promise<{ success: boolean; message: string }> {
  const response = await apiClient.put<{ success: boolean; message: string }>(`/users/${userId}`, data);
  return response.data;
}

/**
 * 删除用户
 */
export async function deleteUser(userId: string): Promise<{ success: boolean; message: string }> {
  const response = await apiClient.delete<{ success: boolean; message: string }>(`/users/${userId}`);
  return response.data;
}

/**
 * 管理员重置用户密码
 */
export async function adminResetPassword(userId: string): Promise<{ success: boolean; newPassword?: string; message: string }> {
  const response = await apiClient.post<{ success: boolean; newPassword?: string; message: string }>(`/users/${userId}/reset-password`);
  return response.data;
}

// 导出 apiClient 供其他服务使用
export default apiClient;
