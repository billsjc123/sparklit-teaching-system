# 🚀 服务器更新快速参考

## 最简单的更新方式（推荐）

```bash
cd ~/teaching-system
git pull origin main
npm install
pm2 restart teaching-system
```

✅ **自动完成**：
- 检查待执行的数据库迁移
- 创建自动备份
- 执行所有迁移
- 重启服务

---

## 常用命令

### 查看状态
```bash
npm run migrate:status    # 查看迁移状态
pm2 status                # 查看服务状态
pm2 logs teaching-system  # 查看日志
```

### 备份数据库
```bash
npm run db:backup
```

### 恢复备份
```bash
pm2 stop teaching-system
cp server/data/teaching.db.backup-TIMESTAMP server/data/teaching.db
pm2 start teaching-system
```

---

## 📌 重要提示

### ✅ 数据库安全
- **不会被覆盖**：`.db` 文件已在 `.gitignore` 中
- **自动备份**：每次迁移前自动创建备份
- **用户数据安全**：git pull 不影响数据库

### ⚠️ 注意事项
- 更新前看一下是否有用户在线
- 保留最近几次的备份文件
- 遇到问题查看日志 `pm2 logs`

---

## 🆘 紧急情况

### 如果更新后出现问题：

```bash
# 1. 停止服务
pm2 stop teaching-system

# 2. 恢复最近的备份
ls -lt server/data/*.auto-backup* | head -1
cp server/data/teaching.db.auto-backup-TIMESTAMP server/data/teaching.db

# 3. 回退代码
git reset --hard HEAD^

# 4. 重启
pm2 start teaching-system
```

---

## 📖 详细文档

完整说明请查看：`SERVER_UPDATE_GUIDE.md`
