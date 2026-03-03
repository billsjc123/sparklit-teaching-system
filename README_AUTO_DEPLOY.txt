╔═══════════════════════════════════════════════════════════════╗
║          🚀 GitHub Actions 自动部署 - 快速参考               ║
╚═══════════════════════════════════════════════════════════════╝

📋 当前状态：服务器端配置完成 ✅

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔑 下一步：配置 GitHub Secrets

1. 运行命令查看配置信息：
   ./show-secrets.sh

2. 在 GitHub 仓库配置 4 个 Secrets：
   Settings → Secrets and variables → Actions → New repository secret
   
   需要配置：
   - SERVER_HOST
   - SERVER_USER
   - SERVER_PORT
   - SERVER_SSH_KEY

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 测试部署：

git add .
git commit -m "测试自动部署"
git push origin main

30秒后在 GitHub Actions 页面查看部署状态！

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📚 相关文档：

- SETUP_COMPLETE.md    - 完整配置说明
- QUICK_START.md       - 快速开始指南
- GITHUB_ACTIONS_DEPLOY.md - 详细部署文档

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 常用命令：

查看配置：     ./show-secrets.sh
查看服务：     pm2 status
查看日志：     pm2 logs teaching-system-api
手动部署：     ./deploy.sh production

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
