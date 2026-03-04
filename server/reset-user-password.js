#!/usr/bin/env node
/**
 * 重置用户密码工具
 * 
 * 用法:
 *   node reset-user-password.js username newpassword
 * 
 * 示例:
 *   node reset-user-password.js admin newAdmin123
 */

import Database from 'better-sqlite3';
import bcrypt from 'bcrypt';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 数据库路径
const DB_PATH = path.join(__dirname, 'data', 'teaching.db');

// 从命令行参数获取用户名和新密码
const username = process.argv[2];
const newPassword = process.argv[3];

if (!username || !newPassword) {
  console.error('❌ 缺少参数！\n');
  console.log('用法:');
  console.log('  node reset-user-password.js username newpassword\n');
  console.log('示例:');
  console.log('  node reset-user-password.js admin newAdmin123');
  process.exit(1);
}

async function resetPassword() {
  let db;
  
  try {
    db = new Database(DB_PATH);
    
    // 检查用户是否存在
    const user = db.prepare(
      'SELECT id, username, role FROM users WHERE username = ?'
    ).get(username);
    
    if (!user) {
      console.error(`❌ 用户 "${username}" 不存在！`);
      console.log('\n查看所有用户:');
      console.log('  node list-users.js');
      process.exit(1);
    }
    
    console.log(`\n🔐 重置密码...\n`);
    console.log(`用户信息:`);
    console.log(`  用户名: ${user.username}`);
    console.log(`  角色:   ${user.role === 'admin' ? '管理员' : '教师'}`);
    console.log('');
    
    // 生成新密码哈希
    const passwordHash = bcrypt.hashSync(newPassword, 10);
    const now = new Date().toISOString();
    
    // 更新密码
    db.prepare(`
      UPDATE users 
      SET password = ?, updatedAt = ?
      WHERE id = ?
    `).run(passwordHash, now, user.id);
    
    console.log('✅ 密码重置成功！\n');
    console.log(`新密码: ${newPassword}`);
    console.log(`\n⚠️  请妥善保管新密码！\n`);
    
  } catch (error) {
    console.error('❌ 重置密码失败:', error.message);
    process.exit(1);
  } finally {
    if (db) {
      db.close();
    }
  }
}

resetPassword();
