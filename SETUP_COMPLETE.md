# ✅ GitHub Actions 自动部署 - 配置已完成

## 🎉 恭喜！服务器端配置已就绪

所有必要的配置都已完成：
- ✅ SSH 密钥已生成
- ✅ SSH 免密登录已配置
- ✅ 服务器环境检查通过
- ✅ GitHub Actions 工作流文件已就绪

---

## 📋 下一步：配置 GitHub Secrets

### 方式一：查看配置信息（推荐）

运行以下命令查看需要配置的信息：

```bash
cd /home/admin/server/sparklit-teaching-system
./show-secrets.sh
```

### 方式二：手动配置

访问你的 GitHub 仓库，按以下步骤操作：

1. 打开 GitHub 仓库页面
2. 点击 **Settings** (设置)
3. 左侧菜单选择 **Secrets and variables** → **Actions**
4. 点击 **New repository secret** 按钮
5. 依次添加以下 4 个 Secrets：

#### 需要添加的 Secrets：

| Secret 名称 | 值 |
|------------|---|
| `SERVER_HOST` | `120.76.158.63` (公网 IP) |
| `SERVER_USER` | `root` |
| `SERVER_PORT` | `22` |
| `SERVER_SSH_KEY` | 运行 `./show-secrets.sh` 查看完整私钥 |

**重要提示**：
- `SERVER_SSH_KEY` 必须包含完整的私钥内容
- 包括 `-----BEGIN` 和 `-----END` 行
- 不要添加额外的空格或引号

---

## 🚀 测试自动部署

### 第一步：确认 GitHub Secrets 已配置

在 GitHub 仓库的 Settings → Secrets 页面确认所有 4 个密钥都已添加。

### 第二步：推送代码触发部署

```bash
cd /home/admin/server/sparklit-teaching-system

# 确保工作流文件已提交
git add .github/workflows/
git commit -m "配置 GitHub Actions 自动部署"
git push origin main
```

### 第三步：查看部署状态

1. 访问 GitHub 仓库
2. 点击 **Actions** 标签
3. 看到工作流正在运行 ✨
4. 点击运行记录查看详细日志

---

## 📊 后续使用

配置完成后，每次更新代码只需：

```bash
git add .
git commit -m "你的提交信息"
git push origin main
```

**30秒后**，代码会自动部署到服务器！🎉

---

## 🛠️ 常用命令

### 查看部署配置信息
```bash
./show-secrets.sh
```

### 查看 PM2 服务状态
```bash
pm2 status
pm2 logs teaching-system-api
```

### 手动部署
```bash
./deploy.sh production
```

### 查看 GitHub Actions 工作流
```bash
cat .github/workflows/deploy.yml
```

---

## 🔧 工作流说明

当前启用的是 **基础部署方案**：

**文件**: `.github/workflows/deploy.yml`

**工作流程**:
1. 推送代码到 `main` 分支
2. GitHub Actions 触发
3. 在云端检出代码并构建
4. SSH 连接到服务器
5. 拉取最新代码
6. 安装依赖并构建
7. 重启 PM2 服务
8. 部署完成 ✅

**其他可用方案**:
- `.github/workflows/deploy-advanced.yml` - 高级部署（包含测试）
- `.github/workflows/deploy-docker.yml` - Docker 容器部署

---

## 📚 相关文档

- 📖 **QUICK_START.md** - 快速开始指南
- 📖 **GITHUB_ACTIONS_DEPLOY.md** - 完整部署文档
- ✅ **GITHUB_ACTIONS_CHECKLIST.md** - 配置检查清单
- 🚀 **AUTO_DEPLOY_README.md** - 本地自动部署方案

---

## 🐛 遇到问题？

### 1. SSH 连接失败
```bash
# 测试 SSH 连接
ssh -i ~/.ssh/github_actions_key root@172.17.31.85 "echo 'SSH 连接测试成功'"
```

### 2. 查看详细日志
- GitHub Actions 页面 → 点击失败的运行 → 查看步骤日志
- 服务器端: `pm2 logs teaching-system-api`

### 3. 重新生成密钥
```bash
cd ~/.ssh
rm github_actions_key github_actions_key.pub
./setup-github-actions.sh
```

---

## 💡 提示

1. **保护私钥**: 不要将私钥文件提交到 Git 仓库
2. **定期备份**: 建议备份 SSH 密钥和项目数据
3. **监控日志**: 定期查看部署和运行日志
4. **分支保护**: 在 GitHub 设置中启用 main 分支保护
5. **测试环境**: 建议配置独立的开发/测试环境

---

## 🎯 下一步建议

1. ✅ 完成 GitHub Secrets 配置
2. ✅ 推送代码测试自动部署
3. ✅ 配置 Nginx 反向代理（如需要）
4. ✅ 设置域名和 SSL 证书（如需要）
5. ✅ 配置数据库备份策略

---

**🎉 现在就去配置 GitHub Secrets 并推送代码吧！**

有任何问题，随时查看相关文档或运行 `./show-secrets.sh` 查看配置信息。
