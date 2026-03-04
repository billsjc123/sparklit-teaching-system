# 🚀 服务器更新快速参考

## 首次部署（全新服务器）

```bash
cd ~/teaching-system
git pull origin main
npm install
pm2 restart teaching-system

# 等待服务器启动（会自动执行迁移）
sleep 5

# 创建管理员账号
npm run admin:create
# 或使用自定义用户名密码：
# node server/create-admin.js myusername mypassword
```

✅ **默认管理员账号**：
- 用户名：`admin`
- 密码：`admin123`
- ⚠️ **首次登录后请立即修改密码！**

---

## 日常更新（已有数据）

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

### 用户管理
```bash
npm run admin:create                    # 创建管理员（默认 admin/admin123）
node server/create-admin.js user pass   # 创建自定义管理员
npm run admin:reset user newpass        # 重置用户密码
node server/list-users.js               # 查看所有用户
```

### 数据库管理
```bash
npm run migrate:status    # 查看迁移状态
npm run db:backup         # 备份数据库
```

### 服务管理
```bash
pm2 status                # 查看服务状态
pm2 logs teaching-system  # 查看日志
pm2 restart teaching-system  # 重启服务
```

### 备份恢复
```bash
npm run db:backup
# 恢复：
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
- 首次部署后必须创建管理员账号才能登录
- 默认密码 `admin123` 请立即修改
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

### 如果忘记管理员密码：

```bash
# 重置密码
npm run admin:reset admin newPassword123

# 或创建新管理员
node server/create-admin.js newadmin newpass123
```

---

## 📖 详细文档

完整说明请查看：`SERVER_UPDATE_GUIDE.md`
