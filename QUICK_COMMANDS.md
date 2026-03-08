# ⚡ 快速命令参考卡

## 🚀 最常用命令

```bash
# 快速重启服务
npm run restart

# 查看日志
npm run logs

# 查看错误日志
npm run logs:err

# 完整部署（拉取代码+构建+重启）
npm run deploy:full
```

---

## 📦 服务管理

| 命令 | 说明 |
|------|------|
| `npm run restart` | 重启后端服务 |
| `pm2 status` | 查看服务状态 |
| `pm2 logs teaching-system-api` | 实时查看日志 |
| `npm run pm2:stop` | 停止服务 |

---

## 🗄️ 数据库

| 命令 | 说明 |
|------|------|
| `npm run migrate:up` | 运行数据库迁移 |
| `npm run db:backup` | 备份数据库 |

---

## 👤 用户管理

| 命令 | 说明 |
|------|------|
| `node server/list-users.js` | 列出所有用户 |
| `npm run admin:reset 用户名 密码` | 重置用户密码 |

---

## 📖 详细文档

- 完整脚本使用说明：[SCRIPTS_USAGE.md](./SCRIPTS_USAGE.md)
- 项目 README：[README.md](./README.md)

---

## 🆘 常见问题

**Q: 登录失败怎么办？**
```bash
# 1. 列出所有用户
node server/list-users.js

# 2. 重置密码
npm run admin:reset sparklit-admin 新密码
```

**Q: 服务无法访问？**
```bash
# 1. 检查服务状态
pm2 status

# 2. 查看错误日志
npm run logs:err

# 3. 重启服务
npm run restart
```

**Q: 如何更新代码？**
```bash
npm run deploy:full
```
