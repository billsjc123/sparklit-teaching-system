#!/usr/bin/env node
/**
 * 创建管理员账号工具
 * 
 * 用法:
 *   node create-admin.js                        # 创建默认管理员 (admin/admin123)
 *   node create-admin.js myusername mypassword  # 创建自定义管理员
 */

import Database from 'better-sqlite3';
import bcrypt from 'bcrypt';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 数据库路径
const DB_PATH = path.join(__dirname, 'data', 'teaching.db');

// 从命令行参数获取用户名和密码，或使用默认值
const username = process.argv[2] || 'admin';
const password = process.argv[3] || 'admin123';

async function createAdmin() {
  let db;
  
  try {
    db = new Database(DB_PATH);
    
    // 检查 users 表是否存在
    const tableExists = db.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='users'"
    ).get();
    
    if (!tableExists) {
      console.error('❌ users 表不存在！请先运行数据库迁移：');
      console.error('   npm run migrate:up');
      process.exit(1);
    }
    
    // 检查用户名是否已存在
    const existingUser = db.prepare(
      'SELECT id FROM users WHERE username = ?'
    ).get(username);
    
    if (existingUser) {
      console.error(`❌ 用户名 "${username}" 已存在！`);
      console.log('\n如需重置密码，请使用以下命令：');
      console.log(`   node reset-user-password.js ${username} newpassword`);
      process.exit(1);
    }
    
    console.log(`\n🔐 创建管理员账号...\n`);
    
    // 生成密码哈希
    const passwordHash = bcrypt.hashSync(password, 10);
    const now = new Date().toISOString();
    const adminId = `admin-${Date.now()}`;
    
    // 插入管理员账号
    db.prepare(`
      INSERT INTO users (id, username, password, role, teacherId, createdAt, updatedAt)
      VALUES (?, ?, ?, 'admin', NULL, ?, ?)
    `).run(adminId, username, passwordHash, now, now);
    
    console.log('✅ 管理员账号创建成功！\n');
    console.log('账号信息:');
    console.log(`  用户名: ${username}`);
    console.log(`  密码:   ${password}`);
    console.log(`  角色:   管理员 (admin)`);
    console.log(`\n⚠️  重要提醒: 请在首次登录后立即修改密码！\n`);
    
  } catch (error) {
    console.error('❌ 创建管理员账号失败:', error.message);
    process.exit(1);
  } finally {
    if (db) {
      db.close();
    }
  }
}

createAdmin();
