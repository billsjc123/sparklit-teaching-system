export interface User {
  id: string;
  username: string;
  role: 'admin' | 'teacher';
  teacherId?: string;
  teacherName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  username: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  success: boolean;
  message?: string;
  user?: User;
}

export interface RegisterAdminRequest {
  username: string;
  password: string;
}

export interface CreateTeacherUserRequest {
  username: string;
  teacherId: string;
}

export interface CreateTeacherUserResponse {
  success: boolean;
  message?: string;
  user?: User;
  initialPassword?: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export interface UpdateUserRequest {
  username: string;
  teacherId?: string;
}
