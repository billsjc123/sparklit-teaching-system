/**
 * 添加货币字段和教师ID字段到学生表
 * 创建时间: 2026-03-04 12:00:00
 */

export function up(db) {
  console.log('  添加 currency 字段到 students 表...');
  
  // 检查字段是否已存在
  const tableInfo = db.prepare("PRAGMA table_info(students)").all();
  const hasCurrency = tableInfo.some(col => col.name === 'currency');
  const hasTeacherId = tableInfo.some(col => col.name === 'teacherId');
  
  if (!hasCurrency) {
    db.exec(`
      ALTER TABLE students 
      ADD COLUMN currency TEXT DEFAULT 'CNY'
    `);
    console.log('  ✓ currency 字段已添加');
  } else {
    console.log('  ⚠ currency 字段已存在，跳过');
  }
  
  if (!hasTeacherId) {
    db.exec(`
      ALTER TABLE students 
      ADD COLUMN teacherId TEXT
    `);
    console.log('  ✓ teacherId 字段已添加');
  } else {
    console.log('  ⚠ teacherId 字段已存在，跳过');
  }
}

export function down(db) {
  console.log('  从 students 表移除 currency 和 teacherId 字段...');
  
  // SQLite 不支持 DROP COLUMN，需要重建表
  db.exec(`
    -- 1. 创建备份表（不包含 currency 和 teacherId）
    CREATE TABLE students_backup AS 
    SELECT id, name, grade, phone, parentContact, ratePerClass, 
           address, notes, createdAt, updatedAt
    FROM students;
    
    -- 2. 删除原表
    DROP TABLE students;
    
    -- 3. 重命名备份表
    ALTER TABLE students_backup RENAME TO students;
  `);
  
  console.log('  ✓ currency 和 teacherId 字段已移除');
}
