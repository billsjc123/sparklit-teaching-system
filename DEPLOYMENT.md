# 教学系统部署文档

## 📦 Git 仓库管理方案

### 一、本地初始化 Git

```bash
cd /Users/bill/fit/project/awesomeProject/教学系统/teaching-system

# 初始化 Git 仓库
git init

# 添加所有文件
git add .

# 首次提交
git commit -m "feat: 初始化教学系统项目"
```

### 二、关联远程仓库

#### 方案 A: GitHub（推荐）

```bash
# 在 GitHub 创建新仓库后
git remote add origin https://github.com/yourusername/teaching-system.git
git branch -M main
git push -u origin main
```

#### 方案 B: GitLab

```bash
git remote add origin https://gitlab.com/yourusername/teaching-system.git
git branch -M main
git push -u origin main
```

#### 方案 C: 自建 Git 服务器

```bash
# 服务器端初始化裸仓库
ssh user@your-server
mkdir -p /var/git/teaching-system.git
cd /var/git/teaching-system.git
git init --bare

# 本地关联
git remote add origin user@your-server:/var/git/teaching-system.git
git push -u origin main
```

---

## 🚀 服务器部署流程

### 方式一：自动化 CI/CD 部署（推荐）

#### 1. 配置 GitHub Secrets
在 GitHub 仓库设置中添加以下 Secrets：
- `SERVER_HOST`: 服务器 IP 地址
- `SERVER_USERNAME`: SSH 用户名
- `SERVER_SSH_KEY`: SSH 私钥内容
- `SERVER_PORT`: SSH 端口（默认 22）

#### 2. 服务器初始化
```bash
# 连接服务器
ssh user@your-server

# 创建项目目录
sudo mkdir -p /var/www/teaching-system
sudo chown $USER:$USER /var/www/teaching-system

# 克隆仓库
cd /var/www
git clone https://github.com/yourusername/teaching-system.git

# 安装依赖
cd teaching-system
npm install

# 初始构建
npm run build

# 启动服务
npm install -g pm2
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup

# 配置 Nginx（参考主文档）
```

#### 3. 之后每次更新
只需在本地推送代码：
```bash
git add .
git commit -m "feat: 添加新功能"
git push origin main
```

GitHub Actions 会自动部署到服务器！

---

### 方式二：手动 Git 部署

#### 服务器端设置
```bash
# 1. 克隆仓库
cd /var/www
git clone https://github.com/yourusername/teaching-system.git
cd teaching-system

# 2. 安装依赖
npm install

# 3. 构建前端
npm run build

# 4. 启动服务
pm2 start ecosystem.config.cjs
pm2 save
```

#### 更新流程
```bash
# 本地推送
git push origin main

# 服务器更新
ssh user@your-server
cd /var/www/teaching-system
bash deploy.sh production
```

---

## 🌿 Git 分支管理策略

### 推荐分支模型：

```
main (生产环境)
  ↑
develop (开发环境)
  ↑
feature/* (功能分支)
```

### 工作流程：

```bash
# 1. 创建功能分支
git checkout -b feature/add-student-management

# 2. 开发并提交
git add .
git commit -m "feat: 添加学生管理功能"

# 3. 推送到远程
git push origin feature/add-student-management

# 4. 创建 Pull Request 合并到 develop

# 5. 测试通过后合并到 main，自动部署
```

---

## 📝 提交规范（Conventional Commits）

```bash
# 功能
git commit -m "feat: 添加课程安排导出功能"

# 修复
git commit -m "fix: 修复日历显示错误"

# 文档
git commit -m "docs: 更新部署文档"

# 样式
git commit -m "style: 优化按钮样式"

# 重构
git commit -m "refactor: 重构数据存储逻辑"

# 性能
git commit -m "perf: 优化列表渲染性能"

# 测试
git commit -m "test: 添加单元测试"

# 构建
git commit -m "chore: 更新依赖版本"
```

---

## 🔐 安全最佳实践

### 1. 保护敏感信息
```bash
# 永远不要提交以下文件：
# - .env（环境变量）
# - server/data/data.json（用户数据）
# - SSH 密钥
# - 数据库密码
```

### 2. 使用 SSH 密钥认证
```bash
# 生成 SSH 密钥
ssh-keygen -t ed25519 -C "your_email@example.com"

# 添加到 GitHub
cat ~/.ssh/id_ed25519.pub
# 复制内容到 GitHub Settings -> SSH Keys

# 添加到服务器
ssh-copy-id user@your-server
```

### 3. 服务器 Git 配置
```bash
# 服务器上配置 Git
git config --global user.name "Server Deploy"
git config --global user.email "deploy@yourdomain.com"

# 使用 deploy key 而非个人账号
```

---

## 🔄 数据备份策略

### 自动备份脚本
```bash
# 服务器上创建备份脚本
sudo nano /usr/local/bin/backup-teaching-system.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/backup/teaching-system"
DATA_FILE="/var/www/teaching-system/server/data/data.json"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR
cp $DATA_FILE $BACKUP_DIR/data_$DATE.json

# 只保留最近 30 天的备份
find $BACKUP_DIR -name "data_*.json" -mtime +30 -delete

echo "Backup completed: data_$DATE.json"
```

```bash
# 添加执行权限
sudo chmod +x /usr/local/bin/backup-teaching-system.sh

# 设置定时任务（每天凌晨 2 点）
crontab -e
# 添加: 0 2 * * * /usr/local/bin/backup-teaching-system.sh
```

---

## 🔧 故障恢复

### 回滚到上一个版本
```bash
# 服务器上
cd /var/www/teaching-system
git log --oneline -5  # 查看最近 5 次提交
git checkout <commit-hash>  # 回滚到指定版本
bash deploy.sh production
```

### 恢复数据
```bash
# 从备份恢复
cp /backup/teaching-system/data_20260303_020000.json \
   /var/www/teaching-system/server/data/data.json

# 重启服务
pm2 restart teaching-system-api
```

---

## 📊 监控和日志

```bash
# 查看部署日志
pm2 logs teaching-system-api

# 查看最近 100 行日志
pm2 logs teaching-system-api --lines 100

# 实时监控
pm2 monit

# 查看 Git 操作记录
cd /var/www/teaching-system
git reflog
```

---

## 🚨 常见问题

### Q: push 时提示权限错误？
```bash
# 检查 SSH 密钥
ssh -T git@github.com

# 或使用 HTTPS + token
git remote set-url origin https://<token>@github.com/username/repo.git
```

### Q: 服务器 git pull 冲突？
```bash
# 方法1: 重置本地修改（慎用）
git reset --hard origin/main

# 方法2: 保存修改后拉取
git stash
git pull
git stash pop
```

### Q: 自动部署失败？
```bash
# 检查 GitHub Actions 日志
# 查看服务器 deploy.sh 脚本执行权限
chmod +x /var/www/teaching-system/deploy.sh
```

---

## 📚 进阶配置

### 多环境部署
```yaml
# .github/workflows/deploy-staging.yml
on:
  push:
    branches:
      - develop

jobs:
  deploy-staging:
    # 部署到测试环境
    script: bash deploy.sh staging
```

### Webhook 触发部署（无需 GitHub Actions）
```bash
# 服务器上安装 webhook 监听器
npm install -g webhook
webhook -hooks hooks.json -verbose
```

---

需要我帮你完成以下任何步骤吗？

1. ✅ 初始化本地 Git 仓库
2. 📤 推送到 GitHub/GitLab
3. ⚙️ 配置 GitHub Actions 自动部署
4. 🔧 生成 SSH 密钥和服务器配置
5. 📋 创建详细的部署 SOP 文档
