# 🌐 外网访问指南

## 📍 访问地址

### 当前服务器信息
- **公网 IP**：`120.76.158.63`
- **HTTP 端口**：`80`（已配置 Nginx）
- **后端 API 端口**：`3002`（内部，通过 Nginx 代理）

---

## 🚀 访问方式

### 方式 1：直接通过 IP 访问（推荐）

在任何电脑的浏览器中输入：

```
http://120.76.158.63
```

✅ **优点**：简单直接，无需额外配置

---

### 方式 2：配置域名访问（可选）

如果你有域名（如 `teaching.example.com`），可以：

1. **添加 DNS 解析**
   ```
   A 记录：teaching.example.com → 120.76.158.63
   ```

2. **更新 Nginx 配置**
   ```bash
   # 编辑配置文件
   sudo nano /etc/nginx/conf.d/teaching-system.conf
   
   # 修改 server_name 行
   server_name teaching.example.com;  # 替换 _ 为你的域名
   
   # 重新加载 Nginx
   sudo nginx -t && sudo nginx -s reload
   ```

3. **访问地址**
   ```
   http://teaching.example.com
   ```

---

## 🔧 当前系统架构

```
外网请求
    ↓
http://120.76.158.63:80
    ↓
Nginx (反向代理)
    ↓
├─ / → 前端静态文件 (dist/)
└─ /api → 后端服务 (localhost:3002)
```

### 路径说明
- **前端页面**：`/` → `/home/admin/server/sparklit-teaching-system/dist`
- **API 接口**：`/api/*` → `http://localhost:3002`

---

## ✅ 访问测试

### 1. 测试前端页面
```bash
curl -I http://120.76.158.63
```
**预期响应**：`200 OK`

### 2. 测试 API 接口
```bash
curl http://120.76.158.63/api/health
```
**预期响应**：后端健康检查信息

---

## 🔒 安全建议

### 当前状态
- ✅ Nginx 已启用 Gzip 压缩
- ✅ 后端服务只监听 localhost（不对外暴露）
- ✅ 日志已配置记录访问信息

### 推荐优化

#### 1. 启用 HTTPS（推荐）
```bash
# 安装 Certbot（Let's Encrypt）
sudo yum install certbot python3-certbot-nginx -y

# 获取免费 SSL 证书（需要域名）
sudo certbot --nginx -d your-domain.com
```

#### 2. 配置防火墙
```bash
# 只开放必要端口
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

#### 3. 添加访问限制（可选）
在 Nginx 配置中添加：
```nginx
# 限制 IP 访问
allow 192.168.1.0/24;  # 允许的 IP 段
deny all;              # 拒绝其他所有 IP
```

---

## 📱 移动设备访问

### 手机/平板访问
1. 确保设备与服务器网络互通
2. 在浏览器中输入：`http://120.76.158.63`
3. 系统已适配移动端，可正常使用

---

## 🐛 常见问题

### Q1: 无法访问怎么办？

**检查步骤**：

1. **检查服务器状态**
```bash
pm2 status
sudo systemctl status nginx
```

2. **检查端口监听**
```bash
netstat -tlnp | grep -E "80|3002"
```

3. **检查防火墙**
```bash
sudo firewall-cmd --list-all
# 或
sudo iptables -L -n
```

4. **查看 Nginx 日志**
```bash
sudo tail -f /var/log/nginx/teaching-system-error.log
```

---

### Q2: 页面加载慢？

**优化方案**：
1. 检查网络带宽
2. 确认 Gzip 压缩已启用
3. 考虑使用 CDN 加速

---

### Q3: API 请求失败？

**检查项**：
1. 后端服务是否运行：`pm2 list`
2. 查看后端日志：`pm2 logs teaching-system-api`
3. 检查 Nginx 代理配置

---

## 📊 监控和维护

### 查看访问日志
```bash
# 实时查看访问日志
sudo tail -f /var/log/nginx/teaching-system-access.log

# 统计访问量
sudo cat /var/log/nginx/teaching-system-access.log | wc -l
```

### 查看系统状态
```bash
# PM2 进程状态
pm2 status

# 查看资源占用
pm2 monit

# Nginx 状态
sudo systemctl status nginx
```

---

## 🎯 快速访问卡片

复制以下信息分享给其他用户：

```
📚 Sparklit 教学系统

🌐 访问地址：http://120.76.158.63
📱 支持设备：电脑、手机、平板
⏰ 服务时间：24/7 全天候

💡 使用说明：
- 直接在浏览器中输入上述地址
- 无需安装任何软件
- 建议使用 Chrome 或 Safari 浏览器
```

---

**服务器 IP**：`120.76.158.63`  
**最后更新**：2026-03-03  
**配置文件**：`/etc/nginx/conf.d/teaching-system.conf`
