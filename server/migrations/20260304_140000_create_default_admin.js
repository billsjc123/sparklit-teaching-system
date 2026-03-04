/**
 * 创建默认管理员账号
 * 创建时间: 2026-03-04 14:00:00
 * 
 * 默认账号：
 * - 用户名: admin
 * - 密码: admin123
 * 
 * ⚠️ 首次登录后请立即修改密码！
 */

import bcrypt from 'bcrypt';

export function up(db) {
  console.log('  检查是否存在管理员账号...');
  
  // 检查是否已有管理员
  const existingAdmin = db.prepare(
    "SELECT id FROM users WHERE role = 'admin' LIMIT 1"
  ).get();
  
  if (existingAdmin) {
    console.log('  ⚠ 已存在管理员账号，跳过创建');
    return;
  }
  
  console.log('  创建默认管理员账号...');
  
  // 生成密码哈希
  const passwordHash = bcrypt.hashSync('admin123', 10);
  const now = new Date().toISOString();
  const adminId = `admin-${Date.now()}`;
  
  // 插入管理员账号
  db.prepare(`
    INSERT INTO users (id, username, password, role, teacherId, createdAt, updatedAt)
    VALUES (?, ?, ?, 'admin', NULL, ?, ?)
  `).run(adminId, 'admin', passwordHash, now, now);
  
  console.log('  ✓ 默认管理员账号已创建');
  console.log('  📝 用户名: admin');
  console.log('  📝 密码: admin123');
  console.log('  ⚠️  请在首次登录后立即修改密码！');
}

export function down(db) {
  console.log('  删除默认管理员账号...');
  
  db.prepare(`
    DELETE FROM users 
    WHERE username = 'admin' 
    AND role = 'admin'
  `).run();
  
  console.log('  ✓ 默认管理员账号已删除');
}
