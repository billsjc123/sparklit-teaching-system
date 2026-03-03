# 🎓 Sparklit 教学系统

一个基于 React + TypeScript + Vite 的现代化教学管理系统。

## 🚀 快速开始

### 开发环境

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

### 生产环境（PM2）

```bash
# 启动服务
pm2 start ecosystem.config.cjs --env production

# 查看状态
pm2 status

# 查看日志
pm2 logs sparklit-teaching-system
```

## 🔧 GitHub Actions 自动部署

### 前提条件

需要在 GitHub Secrets 中配置以下 4 个密钥：

| Secret 名称 | 说明 | 示例值 |
|------------|------|--------|
| `SERVER_SSH_KEY` | SSH 私钥（完整 49 行） | 见 `SSH_KEY_FIX.md` |
| `SERVER_HOST` | 服务器 IP 地址 | `123.45.67.89` |
| `SERVER_USER` | SSH 登录用户 | `admin` |
| `SERVER_PORT` | SSH 端口 | `22` |

### ⚠️ 重要说明

**如果遇到部署错误：**
```
ssh: no key found
ssh: unable to authenticate
```

**解决方案：**
1. 查看 `SSH_KEY_FIX.md` 文件
2. 使用**完整的 49 行 SSH 私钥**更新 GitHub Secret `SERVER_SSH_KEY`
3. 重新触发部署

### 配置步骤

详细配置说明请参考：
- `SSH_KEY_FIX.md` - SSH 密钥问题修复指南
- `SECRETS_SETUP.md` - GitHub Secrets 完整配置指南

### 触发部署

1. **自动触发**：推送代码到 `main` 分支
2. **手动触发**：访问 [GitHub Actions](https://github.com/billsjc123/sparklit-teaching-system/actions) 页面手动运行

## 📦 技术栈

- **前端框架**: React 18 + TypeScript
- **构建工具**: Vite
- **UI 组件**: shadcn/ui + Tailwind CSS
- **后端**: Express + Node.js
- **数据存储**: 后端 API + JSON 文件存储
- **部署**: PM2 + Nginx + GitHub Actions

## 📁 项目结构

```
sparklit-teaching-system/
├── src/              # 前端源代码
├── server/           # 后端服务
├── dist/             # 构建输出
├── .github/
│   └── workflows/    # GitHub Actions 配置
├── ecosystem.config.cjs  # PM2 配置
└── vite.config.ts    # Vite 配置
```

## 🔗 相关链接

- [GitHub 仓库](https://github.com/billsjc123/sparklit-teaching-system)
- [GitHub Actions](https://github.com/billsjc123/sparklit-teaching-system/actions)

---

**版本**: 1.0.0  
**最后更新**: 2026-03-03
