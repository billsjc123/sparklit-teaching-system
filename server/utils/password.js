import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

/**
 * 生成随机密码
 * @param {number} length 密码长度，默认8位
 * @returns {string} 随机密码
 */
export function generateRandomPassword(length = 8) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

/**
 * 加密密码
 * @param {string} plainPassword 明文密码
 * @returns {Promise<string>} 加密后的密码
 */
export async function hashPassword(plainPassword) {
  return await bcrypt.hash(plainPassword, SALT_ROUNDS);
}

/**
 * 验证密码
 * @param {string} plainPassword 明文密码
 * @param {string} hashedPassword 加密后的密码
 * @returns {Promise<boolean>} 是否匹配
 */
export async function verifyPassword(plainPassword, hashedPassword) {
  return await bcrypt.compare(plainPassword, hashedPassword);
}
