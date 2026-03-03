# 🚀 GitHub Actions 自动部署 - 快速开始

## ⚡ 一键配置 (推荐)

运行自动配置脚本:

```bash
cd /home/admin/server/sparklit-teaching-system
chmod +x setup-github-actions.sh
./setup-github-actions.sh
```

脚本会自动完成:
- ✅ 生成 SSH 密钥对
- ✅ 配置 SSH 免密登录
- ✅ 显示需要添加到 GitHub Secrets 的信息
- ✅ 测试 SSH 连接
- ✅ 检查服务器环境

---

## 📋 手动配置步骤

### 第一步: 生成 SSH 密钥 (5分钟)

在服务器上执行:

```bash
# 1. 生成密钥对
cd ~/.ssh
ssh-keygen -t rsa -b 4096 -C "github-actions" -f github_actions_key

# 2. 配置免密登录
cat github_actions_key.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh

# 3. 查看私钥 (稍后需要复制)
cat github_actions_key
```

### 第二步: 配置 GitHub Secrets (3分钟)

1. 打开你的 GitHub 仓库
2. 点击 `Settings` → `Secrets and variables` → `Actions`
3. 点击 `New repository secret` 添加以下 4 个密钥:

#### 密钥列表:

| Secret 名称 | 获取方式 | 示例 |
|------------|---------|------|
| `SERVER_HOST` | `curl -s ifconfig.me` (公网 IP) | `120.76.158.63` |
| `SERVER_USER` | `whoami` | `root` |
| `SERVER_PORT` | 默认 | `22` |
| `SERVER_SSH_KEY` | `cat ~/.ssh/github_actions_key` | 完整私钥内容 |

**重要**: `SERVER_SSH_KEY` 必须包含完整私钥，包括:
```
-----BEGIN RSA PRIVATE KEY-----
(所有内容)
-----END RSA PRIVATE KEY-----
```

### 第三步: 推送到 GitHub (1分钟)

```bash
cd /home/admin/server/sparklit-teaching-system

# 添加 workflow 文件 (如果还没有)
git add .github/workflows/

# 提交并推送
git commit -m "添加 GitHub Actions 自动部署"
git push origin main
```

### 第四步: 测试部署 (2分钟)

```bash
# 做一个小改动
echo "# Test Auto Deploy" >> README.md

# 推送代码
git add .
git commit -m "测试自动部署"
git push origin main
```

**查看部署状态**:
1. 访问 GitHub 仓库
2. 点击 `Actions` 标签
3. 看到工作流正在运行 ✨

---

## 🎯 选择部署方案

### 方案一: 基础部署 (默认启用)

**文件**: `.github/workflows/deploy.yml`

**适合**: 小型项目，快速上手

**特点**: 
- ✅ 配置简单
- ✅ 直接在服务器构建

### 方案二: 高级部署 (可选)

**文件**: `.github/workflows/deploy-advanced.yml`

**适合**: 生产环境，团队协作

**特点**:
- ✅ 包含代码检查
- ✅ 构建和部署分离
- ✅ 支持 PR 测试

**启用方式**:
```bash
# 禁用基础部署
mv .github/workflows/deploy.yml .github/workflows/deploy.yml.disabled

# 高级部署会自动使用
```

---

## 📊 使用流程

配置完成后，每次更新代码只需:

```bash
git add .
git commit -m "更新功能"
git push origin main  # 🎉 自动部署！
```

**30秒后**，代码会自动部署到服务器！

---

## ✅ 验证配置

### 1. 验证 SSH 连接

```bash
ssh -i ~/.ssh/github_actions_key admin@$(hostname -I | awk '{print $1}') "echo 'SSH 连接成功'"
```

### 2. 验证服务器环境

```bash
# 检查必要工具
which git node npm pm2

# 检查版本
git --version
node --version
npm --version
pm2 --version
```

### 3. 验证 GitHub Secrets

在 GitHub 仓库的 Settings → Secrets 中确认所有 4 个密钥都已添加。

---

## 🐛 常见问题

### 问题 1: SSH 连接失败

**错误**: `Permission denied (publickey)`

**解决**:
```bash
# 1. 检查私钥格式
cat ~/.ssh/github_actions_key

# 2. 确认公钥在 authorized_keys 中
cat ~/.ssh/authorized_keys | grep "github-actions"

# 3. 检查权限
ls -l ~/.ssh/github_actions_key
ls -l ~/.ssh/authorized_keys
```

### 问题 2: PM2 未找到

**错误**: `pm2: command not found`

**解决**:
```bash
# 安装 PM2
npm install -g pm2

# 验证安装
pm2 --version
```

### 问题 3: 构建失败

**错误**: `npm ERR! missing script: build`

**解决**:
```bash
# 检查 package.json 中是否有 build 脚本
cat package.json | grep build

# 本地测试构建
npm run build
```

### 问题 4: Git 拉取失败

**错误**: `fatal: not a git repository`

**解决**:
```bash
# 进入项目目录
cd /home/admin/server/sparklit-teaching-system

# 检查是否是 Git 仓库
git status

# 如果不是，初始化
git init
git remote add origin <你的仓库地址>
git pull origin main
```

---

## 🎨 高级功能

### 手动触发部署

1. 访问 GitHub 仓库
2. 点击 `Actions` 标签
3. 选择工作流
4. 点击 `Run workflow` 按钮

### 查看部署日志

**GitHub 端**:
- Actions 页面 → 点击运行记录 → 查看详细步骤

**服务器端**:
```bash
# PM2 日志
pm2 logs teaching-system-api

# 查看最近 100 行
pm2 logs --lines 100
```

### 添加部署通知

在 workflow 文件中可以添加钉钉/企业微信通知，参考 `GITHUB_ACTIONS_DEPLOY.md` 文档。

---

## 📚 相关文档

- 📖 `GITHUB_ACTIONS_DEPLOY.md` - 完整部署文档
- ✅ `GITHUB_ACTIONS_CHECKLIST.md` - 配置检查清单
- 🚀 `AUTO_DEPLOY_README.md` - 本地自动部署方案

---

## 💡 最佳实践

1. **保护主分支**: 在 GitHub 设置中启用分支保护
2. **使用 PR 流程**: 通过 Pull Request 合并代码
3. **定期备份**: 配置数据库和文件备份
4. **监控日志**: 定期查看部署和运行日志
5. **测试环境**: 建议配置独立的测试环境

---

## 🎉 配置完成！

现在你的项目已经配置好了自动部署，每次推送代码都会自动部署到服务器！

**下一步**: 做一个小改动，推送代码，看看自动部署的魔法吧！ ✨
