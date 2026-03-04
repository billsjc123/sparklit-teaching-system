# 数据库迁移指南

## 概述

本目录包含数据库结构变更的迁移脚本。迁移脚本用于在不丢失数据的情况下更新数据库结构。

## 迁移文件命名规则

格式：`YYYYMMDD_HHMMSS_description.js`

例如：
- `20260304_120000_add_currency_to_students.js`
- `20260304_130000_add_auth_tables.js`

## 如何创建新迁移

1. 复制 `template.js` 作为起点
2. 重命名为符合规则的文件名
3. 编写 `up()` 函数（执行变更）
4. 编写 `down()` 函数（回滚变更）

## 在服务器上执行迁移

### 方式一：自动迁移（推荐）

服务器启动时会自动检查并执行未运行的迁移：

```bash
# 拉取最新代码
git pull origin main

# 安装依赖
npm install

# 重启服务（会自动运行迁移）
pm2 restart teaching-system
```

### 方式二：手动迁移

如果需要手动控制迁移过程：

```bash
# 查看待执行的迁移
node server/migrations/migrate.js status

# 执行所有待执行的迁移
node server/migrations/migrate.js up

# 回滚最后一次迁移
node server/migrations/migrate.js down

# 回滚到指定版本
node server/migrations/migrate.js down --to 20260304_120000
```

## 迁移前的重要步骤

### 1. 备份数据库（必须！）

```bash
# 进入服务器目录
cd /path/to/teaching-system

# 备份当前数据库
cp server/data/teaching.db server/data/teaching.db.backup-$(date +%Y%m%d-%H%M%S)

# 或使用备份脚本
npm run db:backup
```

### 2. 测试迁移（推荐）

在测试环境先执行一次：

```bash
# 复制生产数据库到测试环境
scp server/data/teaching.db server/data/teaching.db.test

# 在测试数据库上运行迁移
DATABASE_PATH=server/data/teaching.db.test node server/migrations/migrate.js up

# 验证数据完整性
node server/migrations/verify.js
```

## 迁移记录

系统会在数据库中创建 `migrations` 表记录已执行的迁移：

```sql
CREATE TABLE migrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  executed_at TEXT NOT NULL
);
```

## 注意事项

⚠️ **重要提醒**：

1. **务必先备份**：执行任何迁移前必须备份数据库
2. **测试优先**：在测试环境验证后再在生产环境执行
3. **不可修改已执行的迁移**：已执行的迁移文件不应再修改
4. **谨慎回滚**：回滚可能导致数据丢失，需要谨慎操作
5. **避免高峰期**：在用户活动较少的时间段执行迁移
6. **监控日志**：迁移执行后检查日志确认无误

## 常见场景

### 添加新字段

```javascript
export const up = (db) => {
  db.exec(`
    ALTER TABLE students 
    ADD COLUMN currency TEXT DEFAULT 'CNY'
  `);
};

export const down = (db) => {
  // SQLite 不支持 DROP COLUMN，需要重建表
  db.exec(`
    CREATE TABLE students_backup AS SELECT 
      id, name, grade, phone, parentContact, 
      ratePerClass, address, notes, 
      createdAt, updatedAt, teacherId 
    FROM students;
    
    DROP TABLE students;
    
    ALTER TABLE students_backup RENAME TO students;
  `);
};
```

### 创建新表

```javascript
export const up = (db) => {
  db.exec(`
    CREATE TABLE users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL,
      teacherId TEXT,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (teacherId) REFERENCES teachers(id)
    )
  `);
};

export const down = (db) => {
  db.exec('DROP TABLE IF EXISTS users');
};
```

### 数据迁移

```javascript
export const up = (db) => {
  // 1. 添加新字段
  db.exec(`ALTER TABLE students ADD COLUMN status TEXT DEFAULT 'active'`);
  
  // 2. 迁移数据
  db.exec(`UPDATE students SET status = 'active' WHERE status IS NULL`);
  
  // 3. 添加约束（如需要）
  // SQLite 需要重建表来添加约束
};
```

## 紧急回滚流程

如果迁移导致问题：

```bash
# 1. 立即停止服务
pm2 stop teaching-system

# 2. 恢复备份
cp server/data/teaching.db.backup-YYYYMMDD-HHMMSS server/data/teaching.db

# 3. 回退代码到上一个版本
git reset --hard HEAD^

# 4. 重启服务
pm2 start teaching-system

# 5. 分析问题，修复迁移脚本
```

## 联系支持

遇到问题请查看：
- 迁移日志：`logs/migration.log`
- 服务器日志：`pm2 logs teaching-system`
