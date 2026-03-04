# 服务器更新与数据库迁移指南

## 快速更新流程（推荐）

### 1. 拉取最新代码并自动迁移

```bash
# 进入项目目录
cd ~/teaching-system

# 拉取最新代码
git pull origin main

# 安装/更新依赖
npm install

# 重启服务（会自动执行数据库迁移）
pm2 restart teaching-system
```

**服务器会在启动时自动：**
- ✅ 检查待执行的迁移
- ✅ 创建自动备份（`teaching.db.auto-backup-TIMESTAMP`）
- ✅ 执行所有待执行的迁移
- ✅ 记录迁移历史

---

## 手动控制迁移（高级用户）

### 查看迁移状态

```bash
npm run migrate:status
```

输出示例：
```
📊 数据库迁移状态

数据库路径: /path/to/server/data/teaching.db

迁移列表:
  ✅ 已执行  20260304_120000_add_currency_and_teacher_to_students.js
  ✅ 已执行  20260304_130000_create_users_table.js
  ⏳ 待执行  20260305_140000_add_new_feature.js

总计: 3 个迁移
已执行: 2 个
待执行: 1 个
```

### 执行迁移

```bash
# 备份数据库（推荐）
npm run db:backup

# 执行所有待执行的迁移
npm run migrate:up
```

### 回滚迁移（谨慎使用）

```bash
# 回滚最后一次迁移
npm run migrate:down

# 回滚到指定版本
node server/migrations/migrate.js down --to 20260304_120000
```

⚠️ **警告**：回滚可能导致数据丢失，使用前务必备份！

---

## 数据库备份管理

### 手动备份

```bash
# 使用npm脚本备份
npm run db:backup

# 或直接复制
cp server/data/teaching.db server/data/teaching.db.backup-$(date +%Y%m%d-%H%M%S)
```

### 恢复备份

```bash
# 1. 停止服务
pm2 stop teaching-system

# 2. 恢复备份
cp server/data/teaching.db.backup-20260304-120000 server/data/teaching.db

# 3. 重启服务
pm2 start teaching-system
```

### 查看备份文件

```bash
ls -lh server/data/*.backup*
```

---

## 常见问题处理

### Q1: 迁移失败怎么办？

**症状**：服务器启动时报错，提示迁移失败

**解决步骤**：
```bash
# 1. 查看错误日志
pm2 logs teaching-system --lines 50

# 2. 停止服务
pm2 stop teaching-system

# 3. 找到最近的自动备份
ls -lt server/data/*.auto-backup* | head -1

# 4. 恢复备份
cp server/data/teaching.db.auto-backup-TIMESTAMP server/data/teaching.db

# 5. 联系技术支持或检查迁移脚本
```

### Q2: 如何验证数据完整性？

```bash
# 检查表结构
sqlite3 server/data/teaching.db ".schema"

# 统计数据量
sqlite3 server/data/teaching.db "SELECT 'teachers', COUNT(*) FROM teachers 
UNION ALL SELECT 'students', COUNT(*) FROM students 
UNION ALL SELECT 'schedules', COUNT(*) FROM schedules;"
```

### Q3: 迁移记录表在哪里？

迁移历史记录在数据库的 `migrations` 表中：

```bash
sqlite3 server/data/teaching.db "SELECT * FROM migrations ORDER BY executed_at DESC;"
```

### Q4: 数据库文件会被Git覆盖吗？

**不会！** `.db` 文件已在 `.gitignore` 中排除，Git操作不会影响数据库文件。

---

## 迁移文件说明

### 当前已有的迁移

| 文件名 | 说明 | 创建时间 |
|--------|------|----------|
| `20260304_120000_add_currency_and_teacher_to_students.js` | 为学生表添加currency和teacherId字段 | 2026-03-04 |
| `20260304_130000_create_users_table.js` | 创建用户认证表 | 2026-03-04 |

### 如何创建新迁移

如果你是开发者，需要修改数据库结构：

```bash
# 1. 复制模板
cp server/migrations/template.js server/migrations/YYYYMMDD_HHMMSS_description.js

# 2. 编辑迁移文件
# 3. 在本地测试
# 4. 提交到Git
# 5. 服务器更新时会自动执行
```

---

## 最佳实践

### ✅ 推荐做法

1. **定期备份**：每周至少备份一次数据库
2. **低峰更新**：在用户活动较少时更新系统
3. **测试优先**：有条件的话在测试环境先验证
4. **保留日志**：保存更新前后的日志用于问题排查
5. **自动迁移**：使用 `pm2 restart` 自动执行迁移

### ❌ 避免做法

1. ~~直接修改数据库文件~~
2. ~~跳过备份步骤~~
3. ~~在高峰期更新~~
4. ~~手动修改迁移记录表~~
5. ~~删除已执行的迁移文件~~

---

## 监控与日志

### 查看服务器日志

```bash
# 实时日志
pm2 logs teaching-system

# 最近50行
pm2 logs teaching-system --lines 50

# 只看错误
pm2 logs teaching-system --err
```

### 迁移日志

迁移日志会输出到控制台，通过 pm2 可以查看：

```bash
pm2 logs teaching-system | grep "迁移"
```

---

## 紧急联系

如果遇到无法解决的问题：

1. **不要慌张**，数据库有自动备份
2. **停止服务**，防止数据进一步损坏
3. **保留日志**，用于问题诊断
4. **联系技术支持**

---

## 版本说明

- **迁移系统版本**: 1.0.0
- **最后更新**: 2026-03-04
- **兼容数据库**: SQLite 3.x
