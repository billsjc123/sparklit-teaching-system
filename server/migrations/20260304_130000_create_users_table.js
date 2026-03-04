/**
 * 创建用户认证相关表
 * 创建时间: 2026-03-04 13:00:00
 */

export function up(db) {
  console.log('  创建 users 表...');
  
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin', 'teacher')),
      teacherId TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (teacherId) REFERENCES teachers(id)
    )
  `);
  
  console.log('  ✓ users 表已创建');
  
  // 创建索引以提高查询性能
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
    CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
    CREATE INDEX IF NOT EXISTS idx_users_teacherId ON users(teacherId);
  `);
  
  console.log('  ✓ 索引已创建');
}

export function down(db) {
  console.log('  删除 users 表...');
  
  db.exec(`
    DROP INDEX IF EXISTS idx_users_username;
    DROP INDEX IF EXISTS idx_users_role;
    DROP INDEX IF EXISTS idx_users_teacherId;
    DROP TABLE IF EXISTS users;
  `);
  
  console.log('  ✓ users 表已删除');
}
