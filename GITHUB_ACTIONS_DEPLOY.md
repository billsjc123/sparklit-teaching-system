# GitHub Actions 自动部署配置指南

## 🎯 概述

使用 GitHub Actions 实现代码推送后自动部署到服务器，无需手动操作。

---

## 📋 前置准备

### 1. 在服务器生成 SSH 密钥对

```bash
# 在服务器上执行
cd ~/.ssh
ssh-keygen -t rsa -b 4096 -C "github-actions" -f github_actions_key

# 会生成两个文件:
# - github_actions_key (私钥)
# - github_actions_key.pub (公钥)
```

### 2. 配置 SSH 免密登录

```bash
# 将公钥添加到服务器授权列表
cat github_actions_key.pub >> ~/.ssh/authorized_keys

# 设置权限
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh
```

### 3. 获取私钥内容

```bash
# 显示私钥内容(需要完整复制)
cat ~/.ssh/github_actions_key
```

---

## 🔐 配置 GitHub Secrets

在 GitHub 仓库中配置敏感信息:

### 步骤:

1. 打开 GitHub 仓库
2. 点击 `Settings` (设置)
3. 左侧菜单选择 `Secrets and variables` → `Actions`
4. 点击 `New repository secret` 添加以下密钥:

### 必需的 Secrets:

| Secret 名称 | 说明 | 示例值 |
|------------|------|--------|
| `SERVER_HOST` | 服务器 IP 地址或域名 | `123.45.67.89` 或 `example.com` |
| `SERVER_USER` | SSH 登录用户名 | `admin` 或 `root` |
| `SERVER_SSH_KEY` | SSH 私钥内容 | 完整的私钥文件内容 |
| `SERVER_PORT` | SSH 端口 (可选) | `22` (默认) |

### 配置截图示例:

```
Name: SERVER_HOST
Secret: 123.45.67.89

Name: SERVER_USER  
Secret: admin

Name: SERVER_SSH_KEY
Secret: -----BEGIN RSA PRIVATE KEY-----
        MIIEpAIBAAKCAQEA...
        (完整的私钥内容)
        -----END RSA PRIVATE KEY-----

Name: SERVER_PORT
Secret: 22
```

---

## 🚀 三种部署方案

### 方案一：基础部署 (推荐入门)

**文件**: `.github/workflows/deploy.yml`

**特点**:
- ✅ 简单直接
- ✅ 直接在服务器上拉取代码并构建
- ✅ 适合小型项目

**使用方式**:
```bash
git add .
git commit -m "更新代码"
git push origin main  # 自动触发部署
```

---

### 方案二：高级部署 (推荐生产环境)

**文件**: `.github/workflows/deploy-advanced.yml`

**特点**:
- ✅ 包含代码检查和测试
- ✅ 构建产物上传到服务器
- ✅ 分离测试和部署任务
- ✅ 支持 Pull Request 测试

**工作流程**:
1. 代码检查 (Lint)
2. 构建测试
3. 仅在主分支推送时部署
4. 上传构建产物到服务器
5. 重启服务

---

### 方案三：Docker 容器部署

**文件**: `.github/workflows/deploy-docker.yml`

**特点**:
- ✅ 使用 Docker 容器化部署
- ✅ 环境一致性更好
- ✅ 易于回滚和扩展

**前置要求**:
服务器需要安装 Docker:
```bash
# 安装 Docker
curl -fsSL https://get.docker.com | bash
sudo systemctl start docker
sudo systemctl enable docker
```

---

## 📝 选择部署方案

### 启用方案一 (基础部署)
```bash
# 默认已启用，确保文件存在
ls .github/workflows/deploy.yml
```

### 禁用其他方案 (可选)
```bash
# 重命名文件，添加 .disabled 后缀即可禁用
mv .github/workflows/deploy-advanced.yml .github/workflows/deploy-advanced.yml.disabled
mv .github/workflows/deploy-docker.yml .github/workflows/deploy-docker.yml.disabled
```

---

## 🎬 快速开始

### 1. 配置 GitHub Secrets (上面的步骤)

### 2. 推送工作流文件到仓库

```bash
cd /home/admin/server/sparklit-teaching-system

# 添加工作流文件
git add .github/workflows/

git commit -m "添加 GitHub Actions 自动部署"

git push origin main
```

### 3. 查看部署状态

1. 打开 GitHub 仓库
2. 点击 `Actions` 标签
3. 查看工作流运行状态

### 4. 以后每次更新代码

```bash
git add .
git commit -m "更新功能"
git push origin main  # 🎉 自动触发部署！
```

---

## 🎛️ 手动触发部署

所有工作流都支持手动触发:

1. 打开 GitHub 仓库
2. 点击 `Actions` 标签
3. 选择要运行的工作流
4. 点击 `Run workflow` 按钮
5. 选择分支并点击绿色按钮

---

## 📊 工作流状态徽章

在 `README.md` 中添加状态徽章:

```markdown
![Deploy Status](https://github.com/你的用户名/你的仓库名/actions/workflows/deploy.yml/badge.svg)
```

---

## 🐛 故障排查

### 问题1: SSH 连接失败

**检查项**:
```bash
# 1. 确认服务器 SSH 可访问
ssh -p 22 admin@你的服务器IP

# 2. 检查私钥格式是否正确
cat ~/.ssh/github_actions_key

# 3. 确认 authorized_keys 中有公钥
cat ~/.ssh/authorized_keys | grep github-actions
```

**解决方案**:
- 确保 `SERVER_SSH_KEY` 包含完整的私钥(包括 BEGIN 和 END 行)
- 确保私钥格式正确，没有多余空格
- 确认服务器防火墙允许 SSH 端口

---

### 问题2: 部署脚本执行失败

**查看详细日志**:
1. GitHub Actions 页面查看失败步骤
2. 点击失败的步骤查看详细输出

**常见原因**:
- 项目路径不存在
- PM2 未安装
- Node.js 版本不匹配
- 权限不足

**解决方案**:
```bash
# 在服务器上检查
cd /home/admin/server/sparklit-teaching-system
pm2 --version
node --version
npm --version

# 确保 PM2 已安装
npm install -g pm2
```

---

### 问题3: 构建失败

**检查**:
- `package.json` 中的脚本是否正确
- 依赖是否都已安装
- Node.js 版本是否匹配

**本地测试**:
```bash
# 模拟 CI 环境测试
npm ci  # 清洁安装
npm run lint
npm run build
```

---

## 🔧 高级配置

### 1. 添加部署通知 (钉钉/企业微信)

在 `.github/workflows/deploy.yml` 中添加:

```yaml
- name: 📧 发送钉钉通知
  if: always()
  run: |
    curl 'https://oapi.dingtalk.com/robot/send?access_token=YOUR_TOKEN' \
      -H 'Content-Type: application/json' \
      -d '{
        "msgtype": "text",
        "text": {
          "content": "部署状态: ${{ job.status }}\n仓库: ${{ github.repository }}\n分支: ${{ github.ref }}"
        }
      }'
```

### 2. 多环境部署

创建不同分支对应不同环境:

```yaml
on:
  push:
    branches:
      - main       # 生产环境
      - develop    # 开发环境
      - staging    # 预发布环境
```

### 3. 定时部署

添加定时触发:

```yaml
on:
  schedule:
    - cron: '0 2 * * *'  # 每天凌晨 2 点
```

---

## 📚 参考资源

- [GitHub Actions 官方文档](https://docs.github.com/cn/actions)
- [SSH Action 文档](https://github.com/appleboy/ssh-action)
- [SCP Action 文档](https://github.com/appleboy/scp-action)

---

## ✅ 对比传统方案

| 特性 | 手动部署 | 本地脚本 | GitHub Actions |
|------|---------|----------|----------------|
| 自动化程度 | ❌ 低 | ✅ 中 | ✅✅ 高 |
| 是否需要服务器常驻进程 | ❌ 否 | ✅ 是 | ❌ 否 |
| 构建环境 | 服务器 | 服务器 | GitHub 云端 |
| 可视化界面 | ❌ 无 | ❌ 无 | ✅ 有 |
| 部署历史 | ❌ 无 | ⚠️ 有限 | ✅ 完整 |
| 多人协作 | ❌ 差 | ⚠️ 一般 | ✅ 好 |
| 服务器资源占用 | ⚠️ 构建时高 | ⚠️ 构建时高 | ✅ 低 |
| 成本 | 免费 | 免费 | ✅ 免费(公开仓库) |

**推荐**: 对于团队协作和生产环境，强烈推荐使用 GitHub Actions！
