import { userDb } from '../database.js';
import { hashPassword, verifyPassword, generateRandomPassword } from '../utils/password.js';

/**
 * 用户登录
 * @param {string} username 用户名
 * @param {string} password 密码
 * @returns {Promise<{success: boolean, user?: object, message?: string}>}
 */
export async function login(username, password) {
  // 查找用户
  const user = userDb.getByUsername(username);
  
  if (!user) {
    return { success: false, message: '用户名或密码错误' };
  }

  // 验证密码
  const isValid = await verifyPassword(password, user.password);
  
  if (!isValid) {
    return { success: false, message: '用户名或密码错误' };
  }

  // 返回用户信息（不包含密码）
  const { password: _, ...userWithoutPassword } = user;
  return { success: true, user: userWithoutPassword };
}

/**
 * 创建用户
 * @param {object} userData 用户数据
 * @returns {Promise<{success: boolean, user?: object, initialPassword?: string, message?: string}>}
 */
export async function createUser(userData) {
  const { username, role, teacherId } = userData;

  // 检查用户名是否已存在
  if (userDb.usernameExists(username)) {
    return { success: false, message: '用户名已存在' };
  }

  // 生成随机密码
  const initialPassword = generateRandomPassword(8);
  const hashedPassword = await hashPassword(initialPassword);

  const now = new Date().toISOString();
  const userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const user = {
    id: userId,
    username,
    password: hashedPassword,
    role,
    teacherId: role === 'teacher' ? teacherId : null,
    createdAt: now,
    updatedAt: now
  };

  userDb.create(user);

  const { password: _, ...userWithoutPassword } = user;
  return { 
    success: true, 
    user: userWithoutPassword,
    initialPassword // 返回初始密码，前端需要显示给管理员
  };
}

/**
 * 修改密码
 * @param {string} userId 用户ID
 * @param {string} oldPassword 旧密码
 * @param {string} newPassword 新密码
 * @returns {Promise<{success: boolean, message?: string}>}
 */
export async function changePassword(userId, oldPassword, newPassword) {
  const user = userDb.getByUsername(userDb.getById(userId)?.username);
  
  if (!user) {
    return { success: false, message: '用户不存在' };
  }

  // 验证旧密码
  const isValid = await verifyPassword(oldPassword, user.password);
  
  if (!isValid) {
    return { success: false, message: '旧密码错误' };
  }

  // 加密新密码
  const hashedNewPassword = await hashPassword(newPassword);
  userDb.updatePassword(userId, hashedNewPassword);

  return { success: true, message: '密码修改成功' };
}

/**
 * 更新用户信息
 * @param {string} userId 用户ID
 * @param {object} userData 用户数据
 * @returns {Promise<{success: boolean, message?: string}>}
 */
export async function updateUser(userId, userData) {
  const { username } = userData;

  // 检查用户名是否已被其他用户使用
  if (userDb.usernameExists(username, userId)) {
    return { success: false, message: '用户名已被使用' };
  }

  userDb.update(userId, userData);
  return { success: true, message: '用户信息更新成功' };
}

/**
 * 获取用户信息（不含密码）
 * @param {string} userId 用户ID
 * @returns {object|null}
 */
export function getUserById(userId) {
  return userDb.getById(userId);
}

/**
 * 获取所有用户（不含密码）
 * @returns {Array}
 */
export function getAllUsers() {
  return userDb.getAll();
}

/**
 * 删除用户
 * @param {string} userId 用户ID
 * @returns {object}
 */
export function deleteUser(userId) {
  userDb.delete(userId);
  return { success: true, message: '用户删除成功' };
}

/**
 * 管理员重置用户密码（无需旧密码）
 * @param {string} userId 用户ID
 * @returns {Promise<{success: boolean, newPassword?: string, message?: string}>}
 */
export async function adminResetPassword(userId) {
  const user = userDb.getById(userId);
  
  if (!user) {
    return { success: false, message: '用户不存在' };
  }

  // 生成新的随机密码
  const newPassword = generateRandomPassword(8);
  const hashedPassword = await hashPassword(newPassword);
  
  userDb.updatePassword(userId, hashedPassword);

  return { 
    success: true, 
    newPassword,
    message: '密码重置成功' 
  };
}
