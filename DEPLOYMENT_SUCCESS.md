# 🎉 教学系统部署成功

**部署时间：** 2026-03-03  
**服务器 IP：** 172.17.31.85

---

## ✅ 部署状态

### 已安装组件
- ✅ **Node.js**: v18.20.8
- ✅ **npm**: 10.8.2
- ✅ **PM2**: 6.0.14
- ✅ **Nginx**: 1.20.1

### 服务状态
- ✅ **后端 API**: 运行中 (端口 3002)
- ✅ **Nginx**: 运行中 (端口 80)
- ✅ **PM2 自启动**: 已配置

---

## 🌐 访问地址

### 前端访问
```
http://172.17.31.85/
或
http://localhost/
```

### API 端点
```
# 获取数据
GET http://172.17.31.85/api/data

# 保存数据
POST http://172.17.31.85/api/data

# 导出数据
GET http://172.17.31.85/api/export

# 导入数据
POST http://172.17.31.85/api/import
```

---

## 📁 重要路径

### 项目文件
- **项目目录**: `/home/admin/server/sparklit-teaching-system`
- **前端构建**: `/home/admin/server/sparklit-teaching-system/dist`
- **后端代码**: `/home/admin/server/sparklit-teaching-system/server`
- **数据文件**: `/home/admin/server/sparklit-teaching-system/server/data/data.json`

### 配置文件
- **Nginx 配置**: `/etc/nginx/conf.d/teaching-system.conf`
- **PM2 配置**: `/home/admin/server/sparklit-teaching-system/ecosystem.config.cjs`

### 日志文件
- **后端日志**: `/home/admin/server/sparklit-teaching-system/logs/`
- **Nginx 访问日志**: `/var/log/nginx/teaching-system-access.log`
- **Nginx 错误日志**: `/var/log/nginx/teaching-system-error.log`

---

## 🔧 常用管理命令

### PM2 进程管理
```bash
# 查看所有进程状态
pm2 status

# 查看实时日志
pm2 logs teaching-system-api

# 查看最近 100 行日志
pm2 logs teaching-system-api --lines 100

# 重启服务
pm2 restart teaching-system-api

# 停止服务
pm2 stop teaching-system-api

# 删除进程
pm2 delete teaching-system-api

# 实时监控
pm2 monit

# 保存当前进程列表
pm2 save
```

### Nginx 管理
```bash
# 测试配置文件
nginx -t

# 重新加载配置（不中断服务）
systemctl reload nginx

# 重启 Nginx
systemctl restart nginx

# 查看状态
systemctl status nginx

# 查看访问日志
tail -f /var/log/nginx/teaching-system-access.log

# 查看错误日志
tail -f /var/log/nginx/teaching-system-error.log
```

### 系统服务
```bash
# 查看 PM2 开机自启状态
systemctl status pm2-root

# 禁用 PM2 自启动
pm2 unstartup systemd

# 重新启用 PM2 自启动
pm2 startup
```

---

## 🔄 更新部署流程

### 方式一：手动更新
```bash
cd /home/admin/server/sparklit-teaching-system

# 1. 拉取最新代码（如果使用 Git）
git pull origin main

# 2. 安装依赖
npm install

# 3. 构建前端
npm run build

# 4. 重启后端
pm2 restart teaching-system-api
```

### 方式二：使用部署脚本
```bash
cd /home/admin/server/sparklit-teaching-system
chmod +x deploy.sh
./deploy.sh production
```

**注意**: 部署脚本会执行 `git pull`，如果不使用 Git，请修改脚本。

---

## 📦 数据备份

### 手动备份
```bash
# 备份数据文件
cp /home/admin/server/sparklit-teaching-system/server/data/data.json \
   ~/backup/teaching-system-$(date +%Y%m%d_%H%M%S).json

# 导出数据（通过 API）
curl http://localhost/api/export > backup-$(date +%Y%m%d).json
```

### 定时自动备份
```bash
# 编辑 crontab
crontab -e

# 添加每天凌晨 2 点自动备份
0 2 * * * cp /home/admin/server/sparklit-teaching-system/server/data/data.json ~/backup/data-$(date +\%Y\%m\%d).json
```

---

## 🔐 安全建议

### 1. 配置防火墙
```bash
# 开放 80 端口（HTTP）
firewall-cmd --permanent --add-service=http
firewall-cmd --reload

# 或使用 iptables
iptables -A INPUT -p tcp --dport 80 -j ACCEPT
```

### 2. 配置 HTTPS（推荐）
```bash
# 安装 Certbot
dnf install certbot python3-certbot-nginx -y

# 申请免费 SSL 证书（需要域名）
certbot --nginx -d yourdomain.com

# 自动续期
certbot renew --dry-run
```

### 3. 限制 API 访问频率
在 Nginx 配置中添加：
```nginx
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

location /api/ {
    limit_req zone=api burst=20 nodelay;
    # ... 其他配置
}
```

---

## 🐛 故障排查

### 前端无法访问
```bash
# 1. 检查 Nginx 状态
systemctl status nginx

# 2. 检查文件权限
ls -la /home/admin/server/sparklit-teaching-system/dist/

# 3. 检查错误日志
tail -f /var/log/nginx/teaching-system-error.log
```

### API 无法访问
```bash
# 1. 检查后端进程
pm2 status

# 2. 测试后端直接访问
curl http://localhost:3002/api/data

# 3. 查看后端日志
pm2 logs teaching-system-api
```

### 服务器重启后无法访问
```bash
# 1. 检查 PM2 自启动
systemctl status pm2-root

# 2. 检查 Nginx 自启动
systemctl status nginx

# 3. 手动启动服务
systemctl start nginx
pm2 resurrect
```

---

## 📞 技术支持

如遇问题，请检查以下内容：
1. ✅ 服务器防火墙是否开放 80 端口
2. ✅ PM2 进程是否正常运行
3. ✅ Nginx 配置是否正确
4. ✅ 文件权限是否正确
5. ✅ 日志文件中的错误信息

---

## 🎯 下一步优化建议

1. **配置域名**: 绑定域名并配置 DNS
2. **启用 HTTPS**: 使用 Let's Encrypt 免费证书
3. **配置 CDN**: 加速静态资源访问
4. **监控告警**: 配置服务监控和告警
5. **性能优化**: 启用 Gzip、浏览器缓存等
6. **数据库迁移**: 考虑使用 MySQL/PostgreSQL 替代 JSON 文件

---

**部署成功！** 🚀
