import express from 'express';
import { requireAuth, requireAdmin, requireAdminOrSelf } from '../middlewares/auth.middleware.js';
import { createUser, changePassword, updateUser, getUserById, getAllUsers, deleteUser, adminResetPassword } from '../services/auth.service.js';
import { teacherDb } from '../database.js';

const router = express.Router();

/**
 * 获取所有用户（需要 admin 权限）
 * GET /api/users
 */
router.get('/', requireAdmin, (req, res) => {
  const users = getAllUsers();
  
  // 关联教师信息
  const usersWithTeacherInfo = users.map(user => {
    if (user.teacherId) {
      const teacher = teacherDb.getById(user.teacherId);
      return {
        ...user,
        teacherName: teacher?.name || null
      };
    }
    return user;
  });
  
  res.json({
    success: true,
    users: usersWithTeacherInfo
  });
});

/**
 * 获取单个用户信息（需要登录）
 * GET /api/users/:id
 */
router.get('/:id', requireAuth, (req, res) => {
  const { id } = req.params;
  
  // 检查权限：只能查看自己的信息，除非是 admin
  if (req.session.role !== 'admin' && req.session.userId !== id) {
    return res.status(403).json({
      success: false,
      message: '无权限查看其他用户信息'
    });
  }
  
  const user = getUserById(id);
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: '用户不存在'
    });
  }
  
  // 关联教师信息
  if (user.teacherId) {
    const teacher = teacherDb.getById(user.teacherId);
    user.teacherName = teacher?.name || null;
  }
  
  res.json({
    success: true,
    user
  });
});

/**
 * 创建教师账号（需要 admin 权限）
 * POST /api/users/teacher
 * Body: { username, teacherId }
 */
router.post('/teacher', requireAdmin, async (req, res) => {
  const { username, teacherId } = req.body;
  
  if (!username || !teacherId) {
    return res.status(400).json({
      success: false,
      message: '用户名和教师ID不能为空'
    });
  }
  
  // 验证教师是否存在
  const teacher = teacherDb.getById(teacherId);
  if (!teacher) {
    return res.status(404).json({
      success: false,
      message: '教师不存在'
    });
  }
  
  const result = await createUser({
    username,
    role: 'teacher',
    teacherId
  });
  
  if (result.success) {
    res.json({
      success: true,
      message: '教师账号创建成功',
      user: result.user,
      initialPassword: result.initialPassword // 返回初始密码
    });
  } else {
    res.status(400).json(result);
  }
});

/**
 * 修改密码
 * PUT /api/users/:id/password
 * Body: { oldPassword, newPassword }
 */
router.put('/:id/password', requireAdminOrSelf, async (req, res) => {
  const { id } = req.params;
  const { oldPassword, newPassword } = req.body;
  
  if (!oldPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: '旧密码和新密码不能为空'
    });
  }
  
  if (newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      message: '新密码长度不能少于6位'
    });
  }
  
  const result = await changePassword(id, oldPassword, newPassword);
  
  if (result.success) {
    res.json(result);
  } else {
    res.status(400).json(result);
  }
});

/**
 * 更新用户信息（不包括密码）
 * PUT /api/users/:id
 * Body: { username, teacherId }
 */
router.put('/:id', requireAdminOrSelf, async (req, res) => {
  const { id } = req.params;
  const { username, teacherId } = req.body;
  
  if (!username) {
    return res.status(400).json({
      success: false,
      message: '用户名不能为空'
    });
  }
  
  const result = await updateUser(id, { username, teacherId });
  
  if (result.success) {
    res.json(result);
  } else {
    res.status(400).json(result);
  }
});

/**
 * 删除用户（需要 admin 权限）
 * DELETE /api/users/:id
 */
router.delete('/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  
  // 不能删除自己
  if (req.session.userId === id) {
    return res.status(400).json({
      success: false,
      message: '不能删除自己的账号'
    });
  }
  
  const result = deleteUser(id);
  res.json(result);
});

/**
 * 管理员重置用户密码（需要 admin 权限）
 * POST /api/users/:id/reset-password
 */
router.post('/:id/reset-password', requireAdmin, async (req, res) => {
  const { id } = req.params;
  
  const result = await adminResetPassword(id);
  
  if (result.success) {
    res.json(result);
  } else {
    res.status(400).json(result);
  }
});

export default router;
