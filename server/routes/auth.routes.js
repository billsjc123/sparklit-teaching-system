import express from 'express';
import { login, createUser, changePassword, updateUser, getUserById, getAllUsers, deleteUser } from '../services/auth.service.js';
import { updateSessionExpiry } from '../utils/session.js';

const router = express.Router();

/**
 * 登录
 * POST /api/auth/login
 * Body: { username, password, rememberMe }
 */
router.post('/login', async (req, res) => {
  const { username, password, rememberMe = false } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: '用户名和密码不能为空' });
  }

  const result = await login(username, password);

  if (result.success) {
    // 创建 session
    req.session.userId = result.user.id;
    req.session.username = result.user.username;
    req.session.role = result.user.role;
    req.session.teacherId = result.user.teacherId;

    // 设置 cookie 过期时间
    updateSessionExpiry(req, rememberMe);

    res.json({
      success: true,
      message: '登录成功',
      user: result.user
    });
  } else {
    res.status(401).json(result);
  }
});

/**
 * 注销
 * POST /api/auth/logout
 */
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ success: false, message: '注销失败' });
    }
    res.clearCookie('teaching.sid');
    res.json({ success: true, message: '注销成功' });
  });
});

/**
 * 获取当前用户信息
 * GET /api/auth/me
 */
router.get('/me', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ success: false, message: '未登录' });
  }

  const user = getUserById(req.session.userId);
  
  if (!user) {
    return res.status(404).json({ success: false, message: '用户不存在' });
  }

  res.json({
    success: true,
    user
  });
});

/**
 * Admin 注册（需要已有 admin 权限）
 * POST /api/auth/register-admin
 * Body: { username, password }
 */
router.post('/register-admin', async (req, res) => {
  // 检查权限
  if (!req.session.userId || req.session.role !== 'admin') {
    return res.status(403).json({ success: false, message: '无权限执行此操作' });
  }

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: '用户名和密码不能为空' });
  }

  // 手动创建带指定密码的 admin
  const { hashPassword } = await import('../utils/password.js');
  const hashedPassword = await hashPassword(password);
  
  const now = new Date().toISOString();
  const userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const { userDb } = await import('../database.js');
  
  if (userDb.usernameExists(username)) {
    return res.status(400).json({ success: false, message: '用户名已存在' });
  }

  userDb.create({
    id: userId,
    username,
    password: hashedPassword,
    role: 'admin',
    teacherId: null,
    createdAt: now,
    updatedAt: now
  });

  res.json({
    success: true,
    message: 'Admin 账号创建成功',
    user: { id: userId, username, role: 'admin' }
  });
});

export default router;
