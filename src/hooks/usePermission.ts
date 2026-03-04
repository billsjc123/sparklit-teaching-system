import { useAuth } from '../contexts/AuthContext';

export function usePermission() {
  const { user, isAdmin, isTeacher } = useAuth();

  /**
   * 检查是否可以访问某个功能
   */
  function canAccess(requiredRole?: 'admin' | 'teacher'): boolean {
    if (!requiredRole) return true;
    if (requiredRole === 'admin') return isAdmin;
    if (requiredRole === 'teacher') return isTeacher || isAdmin; // Admin 也可以访问 Teacher 的功能
    return false;
  }

  /**
   * 检查是否可以编辑某个教师的数据
   */
  function canEditTeacher(teacherId: string): boolean {
    if (isAdmin) return true;
    if (isTeacher && user?.teacherId === teacherId) return true;
    return false;
  }

  /**
   * 检查是否可以查看某个教师的数据
   */
  function canViewTeacher(teacherId: string): boolean {
    return canEditTeacher(teacherId);
  }

  /**
   * 检查是否可以创建课程
   */
  function canCreateSchedule(): boolean {
    return isAdmin || isTeacher;
  }

  /**
   * 检查是否可以编辑课程
   */
  function canEditSchedule(teacherId: string): boolean {
    if (isAdmin) return true;
    if (isTeacher && user?.teacherId === teacherId) return true;
    return false;
  }

  /**
   * 检查是否可以删除课程（只有 Admin 可以）
   */
  function canDeleteSchedule(): boolean {
    return isAdmin;
  }

  return {
    isAdmin,
    isTeacher,
    canAccess,
    canEditTeacher,
    canViewTeacher,
    canCreateSchedule,
    canEditSchedule,
    canDeleteSchedule
  };
}
