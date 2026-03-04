/**
 * 迁移模板
 * 
 * 复制此文件并重命名为: YYYYMMDD_HHMMSS_description.js
 * 例如: 20260304_120000_add_currency_field.js
 */

/**
 * 执行迁移（升级数据库结构）
 * @param {import('better-sqlite3').Database} db - 数据库实例
 */
export function up(db) {
  // 在这里编写升级逻辑
  // 示例：添加新字段
  db.exec(`
    ALTER TABLE students 
    ADD COLUMN newField TEXT DEFAULT 'default_value'
  `);
  
  // 示例：创建新表
  db.exec(`
    CREATE TABLE IF NOT EXISTS new_table (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      createdAt TEXT NOT NULL
    )
  `);
  
  // 示例：数据迁移
  db.exec(`
    UPDATE students 
    SET newField = 'migrated_value' 
    WHERE newField IS NULL
  `);
}

/**
 * 回滚迁移（降级数据库结构）
 * @param {import('better-sqlite3').Database} db - 数据库实例
 */
export function down(db) {
  // 在这里编写回滚逻辑
  // 注意：SQLite 不支持 DROP COLUMN，需要重建表
  
  // 示例：删除表
  db.exec(`
    DROP TABLE IF EXISTS new_table
  `);
  
  // 示例：删除字段（需要重建表）
  db.exec(`
    -- 1. 创建备份表（不包含要删除的字段）
    CREATE TABLE students_backup AS 
    SELECT id, name, grade, phone, parentContact, ratePerClass, 
           address, notes, createdAt, updatedAt, teacherId, currency
    FROM students;
    
    -- 2. 删除原表
    DROP TABLE students;
    
    -- 3. 重命名备份表
    ALTER TABLE students_backup RENAME TO students;
  `);
}
