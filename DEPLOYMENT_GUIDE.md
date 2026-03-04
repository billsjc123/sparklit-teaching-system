# 🚀 首次部署指南

本指南适用于**全新服务器**或**没有现有数据**的情况。

---

## 📋 部署步骤

### 1️⃣ 克隆代码

```bash
# 克隆仓库
git clone https://github.com/billsjc123/sparklit-teaching-system.git
cd sparklit-teaching-system

# 或者如果已经克隆，拉取最新代码
git pull origin main
```

### 2️⃣ 安装依赖

```bash
npm install
```

### 3️⃣ 启动服务

```bash
# 使用 PM2 启动（推荐）
pm2 start ecosystem.config.cjs --env production

# 或直接启动（开发环境）
npm run dev:all
```

**服务器会自动：**
- ✅ 创建数据库文件
- ✅ 执行所有迁移（创建表结构）
- ✅ 启动服务

### 4️⃣ 创建管理员账号

等待服务器启动完成后（约5秒），创建管理员账号：

```bash
# 创建默认管理员（用户名: admin, 密码: admin123）
npm run admin:create

# 或创建自定义管理员
node server/create-admin.js myusername mypassword
```

**输出示例：**
```
🔐 创建管理员账号...

✅ 管理员账号创建成功！

账号信息:
  用户名: admin
  密码:   admin123
  角色:   管理员 (admin)

⚠️  重要提醒: 请在首次登录后立即修改密码！
```

### 5️⃣ 访问系统

在浏览器中打开：
- **开发环境**: http://localhost:5173
- **生产环境**: http://your-server-ip:5173 或配置的域名

使用创建的管理员账号登录。

### 6️⃣ 修改密码（重要！）

首次登录后，**立即修改密码**：
1. 点击右上角头像
2. 选择"修改密码"
3. 输入新密码并保存

---

## 🔧 配置说明

### 数据库位置

SQLite 数据库文件位于：
```
server/data/teaching.db
```

### 端口配置

- **前端**: 5173（Vite 开发服务器）
- **后端**: 3002（Express API 服务器）

如需修改端口，编辑：
- 前端：`vite.config.ts`
- 后端：`server/index.js`

### 环境变量

可选的环境变量（创建 `.env` 文件）：
```bash
NODE_ENV=production
PORT=3002
SESSION_SECRET=your-secret-key-here
```

---

## 🌐 生产环境部署

### 使用 Nginx 反向代理

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 前端静态文件
    location / {
        root /path/to/sparklit-teaching-system/dist;
        try_files $uri $uri/ /index.html;
    }

    # API 代理
    location /api {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 构建生产版本

```bash
# 构建前端
npm run build

# 启动后端
pm2 start ecosystem.config.cjs --env production
pm2 save
```

### 配置开机自启

```bash
# 设置 PM2 开机自启
pm2 startup
pm2 save
```

---

## 📊 验证部署

### 检查服务状态

```bash
pm2 status
```

应该看到：
```
┌─────┬───────────────────────┬─────────┬─────────┐
│ id  │ name                  │ status  │ restart │
├─────┼───────────────────────┼─────────┼─────────┤
│ 0   │ teaching-system       │ online  │ 0       │
└─────┴───────────────────────┴─────────┴─────────┘
```

### 检查日志

```bash
pm2 logs teaching-system
```

应该看到：
```
✅ 数据库初始化完成
🔍 检查数据库迁移...
🎉 所有迁移执行完成！
✅ 数据服务器运行在 http://localhost:3002
```

### 检查数据库

```bash
# 查看迁移状态
npm run migrate:status

# 应该显示所有迁移都已执行
```

### 测试登录

```bash
# 测试登录 API
curl -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

---

## ⚠️ 注意事项

### 安全建议

1. ✅ **立即修改默认密码** `admin123`
2. ✅ 使用强密码（至少8位，包含大小写字母、数字）
3. ✅ 定期备份数据库
4. ✅ 使用 HTTPS（生产环境）
5. ✅ 配置防火墙规则

### 备份策略

```bash
# 创建备份
npm run db:backup

# 或手动备份
cp server/data/teaching.db server/data/teaching.db.backup-$(date +%Y%m%d)
```

建议：
- 每天自动备份
- 保留最近7天的备份
- 重要操作前手动备份

### 自动备份脚本

创建 `backup.sh`：
```bash
#!/bin/bash
cd /path/to/sparklit-teaching-system
npm run db:backup

# 清理7天前的备份
find server/data -name "*.backup-*" -mtime +7 -delete
```

添加到 crontab：
```bash
# 每天凌晨2点备份
0 2 * * * /path/to/backup.sh
```

---

## 🆘 常见问题

### Q: 迁移执行失败怎么办？

```bash
# 查看错误日志
pm2 logs teaching-system --lines 50

# 手动执行迁移
npm run migrate:up

# 查看迁移状态
npm run migrate:status
```

### Q: 忘记管理员密码？

```bash
# 重置密码
npm run admin:reset admin newPassword123

# 或创建新管理员
node server/create-admin.js newadmin newpass456
```

### Q: 数据库文件丢失？

如果是首次部署，服务器会自动创建。如果是数据丢失：
```bash
# 1. 停止服务
pm2 stop teaching-system

# 2. 恢复备份
cp server/data/teaching.db.backup-YYYYMMDD server/data/teaching.db

# 3. 重启服务
pm2 start teaching-system
```

### Q: 端口被占用？

```bash
# 查找占用进程
lsof -ti:3002

# 结束进程
kill -9 $(lsof -ti:3002)

# 重启服务
pm2 restart teaching-system
```

---

## 📚 下一步

部署完成后，建议阅读：

- 📖 [服务器更新指南](SERVER_UPDATE_GUIDE.md) - 了解如何更新系统
- 📖 [快速更新参考](QUICK_UPDATE.md) - 日常维护命令速查
- 📖 [迁移系统说明](server/migrations/README.md) - 数据库迁移详解

---

## 💬 获取帮助

遇到问题？
1. 查看日志：`pm2 logs teaching-system`
2. 查看迁移状态：`npm run migrate:status`
3. 查看文档：`SERVER_UPDATE_GUIDE.md`
4. 提交 Issue 到 GitHub

---

## ✅ 部署检查清单

部署完成后，确认以下项目：

- [ ] 服务器正常运行（`pm2 status` 显示 online）
- [ ] 数据库迁移全部执行（`npm run migrate:status` 全部 ✅）
- [ ] 管理员账号创建成功（能够登录）
- [ ] 已修改默认密码
- [ ] 可以正常访问前端页面
- [ ] API 接口响应正常
- [ ] 配置了自动备份
- [ ] 设置了 PM2 开机自启

全部完成后，你的教学系统就可以正常使用了！🎉
