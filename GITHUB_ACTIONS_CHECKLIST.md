# GitHub Actions 快速配置检查清单

## ✅ 配置步骤检查清单

### 第一步: 生成 SSH 密钥
```bash
cd ~/.ssh
ssh-keygen -t rsa -b 4096 -C "github-actions" -f github_actions_key
cat github_actions_key.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

- [ ] 已生成 SSH 密钥对
- [ ] 已添加公钥到 authorized_keys
- [ ] 已设置正确的文件权限

### 第二步: 配置 GitHub Secrets

访问: `https://github.com/你的用户名/你的仓库名/settings/secrets/actions`

需要添加的 Secrets:
- [ ] `SERVER_HOST` - 服务器 IP 或域名
- [ ] `SERVER_USER` - SSH 用户名 (通常是 admin 或 root)
- [ ] `SERVER_SSH_KEY` - 完整的私钥内容 (cat ~/.ssh/github_actions_key)
- [ ] `SERVER_PORT` - SSH 端口 (默认 22，可选)

### 第三步: 推送工作流文件

```bash
cd /home/admin/server/sparklit-teaching-system
git add .github/workflows/
git commit -m "添加 GitHub Actions 自动部署"
git push origin main
```

- [ ] 已推送 workflow 文件到仓库
- [ ] 在 GitHub Actions 页面看到工作流

### 第四步: 测试部署

```bash
# 做一个小改动测试
echo "# Test" >> README.md
git add README.md
git commit -m "测试自动部署"
git push origin main
```

- [ ] 推送代码后自动触发部署
- [ ] 在 GitHub Actions 页面看到运行记录
- [ ] 部署成功，服务正常运行

---

## 🔍 验证命令

### 验证 SSH 配置
```bash
# 测试 SSH 连接
ssh -i ~/.ssh/github_actions_key -p 22 admin@你的服务器IP "echo 'SSH 连接成功'"
```

### 验证服务器环境
```bash
# 检查必要的工具
which git node npm pm2

# 检查项目目录
ls -la /home/admin/server/sparklit-teaching-system
```

### 验证 GitHub Secrets
```bash
# 在 workflow 中添加调试步骤 (不要提交到生产)
- name: Debug
  run: |
    echo "Host: ${{ secrets.SERVER_HOST }}"
    echo "User: ${{ secrets.SERVER_USER }}"
    echo "Port: ${{ secrets.SERVER_PORT }}"
    # 不要打印 SSH_KEY！
```

---

## 📋 常见错误代码

| 错误信息 | 原因 | 解决方法 |
|---------|------|---------|
| `Permission denied (publickey)` | SSH 密钥配置错误 | 检查私钥格式和 authorized_keys |
| `Could not resolve hostname` | 服务器地址错误 | 检查 SERVER_HOST 是否正确 |
| `pm2: command not found` | 服务器未安装 PM2 | `npm install -g pm2` |
| `fatal: not a git repository` | 项目不是 Git 仓库 | 在项目目录执行 `git init` |
| `npm ERR! missing script: build` | package.json 缺少脚本 | 检查 build 脚本是否存在 |

---

## 🎯 推荐工作流

**选择方案一 (基础部署)** - 最简单，适合入门

```bash
# 1. 配置 GitHub Secrets (一次性)
# 2. 以后每次更新代码:
git add .
git commit -m "更新功能"
git push origin main  # 自动部署！
```

---

## 📞 获取帮助

如果遇到问题:
1. 查看 GitHub Actions 运行日志
2. 查看服务器上的 PM2 日志: `pm2 logs`
3. 检查本文档的"故障排查"部分
4. 参考 `GITHUB_ACTIONS_DEPLOY.md` 详细文档
