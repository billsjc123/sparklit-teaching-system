# 📜 脚本使用指南

本文档介绍项目中各种便捷脚本的使用方法。

## 🚀 快速重启服务

### 方式一：使用脚本
```bash
./restart.sh
# 或
npm run restart
```

**功能**：快速重启后端 API 服务

**使用场景**：
- 修改了后端代码
- 修改了环境变量
- 服务出现异常需要重启

---

## 🔄 完整部署流程

### 方式一：使用脚本
```bash
./deploy-full.sh
# 或
npm run deploy:full
```

**功能**：执行完整部署流程
1. 从 GitHub 拉取最新代码
2. 安装/更新依赖
3. 构建前端
4. 运行数据库迁移
5. 重启后端服务

**使用场景**：
- GitHub 仓库有新的更新
- 需要完整更新整个系统
- 首次部署或大版本更新

---

## 📋 查看日志

### 查看所有日志（实时）
```bash
./logs.sh
# 或
npm run logs
```

### 只查看错误日志
```bash
./logs.sh err
# 或
npm run logs:err
```

### 只查看输出日志
```bash
./logs.sh out
```

### 使用 PM2 命令
```bash
# 查看最近 100 行日志
pm2 logs teaching-system-api --lines 100

# 只看错误日志
pm2 logs teaching-system-api --err

# 只看输出日志
pm2 logs teaching-system-api --out

# 清空日志
pm2 flush teaching-system-api
```

---

## 🗄️ 数据库操作

### 运行迁移
```bash
npm run migrate:up
```

### 查看迁移状态
```bash
npm run migrate:status
```

### 回滚迁移
```bash
npm run migrate:down
```

### 备份数据库
```bash
npm run db:backup
```

---

## 👤 管理员账户管理

### 创建管理员账户
```bash
# 创建默认管理员（admin/admin123）
npm run admin:create

# 创建自定义管理员
node server/create-admin.js 用户名 密码
```

### 重置用户密码
```bash
npm run admin:reset 用户名 新密码
```

### 列出所有用户
```bash
node server/list-users.js
```

---

## 🔧 PM2 服务管理

### 启动服务
```bash
npm run pm2:prod              # 生产环境
npm run pm2:dev               # 开发环境
```

### 重启服务
```bash
npm run restart               # 使用脚本（推荐）
npm run pm2:reload            # 使用 PM2 reload
pm2 restart teaching-system-api --update-env  # 直接命令
```

### 停止服务
```bash
npm run pm2:stop
# 或
pm2 stop teaching-system-api
```

### 查看服务状态
```bash
pm2 status
pm2 status teaching-system-api
```

### 查看服务详情
```bash
pm2 describe teaching-system-api
```

### 监控服务
```bash
pm2 monit
```

---

## 🔍 故障排查

### 服务无法启动

1. **查看错误日志**
   ```bash
   npm run logs:err
   ```

2. **检查端口占用**
   ```bash
   netstat -tlnp | grep 3002
   # 或
   lsof -i :3002
   ```

3. **检查数据库文件**
   ```bash
   ls -la server/data/teaching.db
   ```

### 登录失败

1. **检查用户是否存在**
   ```bash
   node server/list-users.js
   ```

2. **重置密码**
   ```bash
   npm run admin:reset sparklit-admin 新密码
   ```

### 服务频繁重启

1. **查看 PM2 状态中的重启次数**
   ```bash
   pm2 status
   ```

2. **查看错误日志找原因**
   ```bash
   tail -100 logs/error.log
   ```

3. **常见原因**：
   - 内存不足（调整 `max_memory_restart`）
   - 依赖问题（重新 `npm install`）
   - 数据库文件权限问题

---

## 📦 构建相关

### 构建前端
```bash
npm run build
```

### 开发模式运行
```bash
# 只启动前端开发服务器
npm run dev

# 同时启动前后端
npm run dev:all
```

---

## 🌐 Nginx 相关

### 重新加载配置
```bash
sudo nginx -t                 # 测试配置
sudo nginx -s reload          # 重新加载
```

### 重启 Nginx
```bash
sudo systemctl restart nginx
```

### 查看 Nginx 日志
```bash
# 访问日志
tail -f /var/log/nginx/teaching-system-access.log

# 错误日志
tail -f /var/log/nginx/teaching-system-error.log
```

---

## 🔐 安全建议

1. **定期备份数据库**
   ```bash
   npm run db:backup
   ```

2. **使用强密码**
   - 管理员密码至少 12 位
   - 包含大小写字母、数字、特殊字符

3. **修改 Session Secret**
   ```bash
   # 生成随机密钥
   openssl rand -base64 32
   
   # 添加到 .env 文件
   echo "SESSION_SECRET=生成的密钥" >> .env
   ```

4. **定期更新依赖**
   ```bash
   npm audit                  # 检查漏洞
   npm audit fix              # 自动修复
   ```

---

## 📝 快捷命令总结

```bash
# 服务管理
npm run restart              # 重启服务
npm run pm2:stop            # 停止服务
npm run logs                # 查看日志
npm run logs:err            # 查看错误日志

# 部署
npm run deploy:full         # 完整部署（拉取代码+构建+重启）

# 数据库
npm run migrate:up          # 运行迁移
npm run migrate:status      # 迁移状态
npm run db:backup           # 备份数据库

# 用户管理
npm run admin:create        # 创建管理员
npm run admin:reset 用户名 密码  # 重置密码

# 开发
npm run dev                 # 前端开发服务器
npm run dev:all             # 前后端同时运行
npm run build               # 构建前端
```

---

## 💡 最佳实践

1. **修改代码后的流程**：
   ```bash
   # 在本地开发环境测试
   git add .
   git commit -m "your changes"
   git push origin main
   
   # 在服务器上部署
   cd /home/admin/server/sparklit-teaching-system
   ./deploy-full.sh
   ```

2. **定期维护**：
   ```bash
   # 每周备份数据库
   npm run db:backup
   
   # 查看服务运行状态
   pm2 status
   
   # 清理日志（如果太大）
   pm2 flush teaching-system-api
   ```

3. **监控服务**：
   ```bash
   # 实时监控
   pm2 monit
   
   # 定期查看日志
   npm run logs:err
   ```

---

**更新日期**: 2026-03-08
