# 自动部署配置说明文档

## 🎯 三种自动部署方案

### 方案一：Git 自动监听部署 (推荐用于生产环境)
**适用场景**: 当你推送代码到 Git 仓库后,服务器自动检测并部署

#### 1. 赋予执行权限
```bash
chmod +x auto-deploy.sh
```

#### 2. 启动自动部署监听
```bash
# 方式1: 直接运行(前台运行)
./auto-deploy.sh

# 方式2: 后台运行
nohup ./auto-deploy.sh > logs/auto-deploy.log 2>&1 &

# 方式3: 使用 PM2 管理(推荐)
pm2 start auto-deploy.sh --name auto-deploy --interpreter bash
pm2 save  # 保存配置
pm2 startup  # 设置开机自启
```

#### 3. 查看自动部署日志
```bash
pm2 logs auto-deploy
# 或
tail -f logs/auto-deploy.log
```

#### 4. 停止自动部署
```bash
pm2 stop auto-deploy
# 或查找进程并kill
ps aux | grep auto-deploy
```

---

### 方案二：文件监听自动部署 (推荐用于开发环境)
**适用场景**: 监听本地文件变化,自动重新构建和重启服务

#### 1. 安装依赖
```bash
# Ubuntu/Debian
sudo apt-get install inotify-tools

# CentOS/RHEL
sudo yum install inotify-tools
```

#### 2. 赋予执行权限并启动
```bash
chmod +x watch-and-deploy.sh
./watch-and-deploy.sh
```

#### 3. 在另一个终端修改代码
```bash
# 修改 src/ 或 server/ 目录下的文件
# 监听脚本会自动检测并重新部署
```

---

### 方案三：PM2 Watch 模式 (最简单)
**适用场景**: 仅需要后端代码自动重启

#### 启动开发模式 (自动监听 server/ 目录)
```bash
npm run pm2:dev
```

#### 查看状态
```bash
pm2 status
pm2 logs teaching-system-api
```

---

## 🔧 systemd 服务配置 (可选)

让自动部署服务随系统启动:

#### 1. 复制服务文件
```bash
sudo cp teaching-system-auto-deploy.service /etc/systemd/system/
```

#### 2. 启动并启用服务
```bash
sudo systemctl daemon-reload
sudo systemctl start teaching-system-auto-deploy
sudo systemctl enable teaching-system-auto-deploy
```

#### 3. 查看服务状态
```bash
sudo systemctl status teaching-system-auto-deploy
```

#### 4. 查看日志
```bash
journalctl -u teaching-system-auto-deploy -f
```

---

## 📋 常用命令汇总

### PM2 相关
```bash
npm run pm2:dev          # 启动开发模式(自动监听)
npm run pm2:prod         # 启动生产模式
npm run pm2:reload       # 平滑重启
npm run pm2:stop         # 停止服务
npm run pm2:logs         # 查看日志
pm2 list                 # 查看所有进程
pm2 monit                # 实时监控
```

### 部署相关
```bash
npm run deploy           # 手动部署
npm run auto-deploy      # 启动自动部署监听
npm run watch-deploy     # 启动文件监听部署
./deploy.sh production   # 直接执行部署脚本
```

### Git 相关
```bash
git add .
git commit -m "更新代码"
git push origin main     # 推送后会自动触发部署(如果启用了自动部署)
```

---

## 🎨 推荐工作流

### 开发环境
```bash
# 终端1: 启动前端开发服务器
npm run dev

# 终端2: 启动后端(PM2 watch 模式)
npm run pm2:dev

# 或使用文件监听模式
./watch-and-deploy.sh
```

### 生产环境
```bash
# 1. 首次部署
./deploy.sh production

# 2. 启动自动部署监听
pm2 start auto-deploy.sh --name auto-deploy --interpreter bash
pm2 save

# 3. 以后只需推送代码即可
git push origin main  # 自动部署会在30秒内触发
```

---

## ⚠️ 注意事项

1. **确保 Git 仓库已配置**: 自动部署依赖 Git,确保项目已初始化 Git 仓库
2. **SSH 密钥配置**: 如果使用远程仓库,确保已配置 SSH 密钥,避免需要输入密码
3. **文件权限**: 确保所有 .sh 脚本都有执行权限 (`chmod +x *.sh`)
4. **日志管理**: 定期清理日志文件,避免占用过多磁盘空间
5. **端口冲突**: 确保 3002 端口未被占用

---

## 🐛 故障排查

### 问题1: 自动部署没有触发
```bash
# 检查脚本是否在运行
ps aux | grep auto-deploy
pm2 list

# 检查 Git 远程连接
git fetch origin main

# 手动测试部署脚本
./deploy.sh production
```

### 问题2: PM2 服务无法启动
```bash
# 查看详细日志
pm2 logs teaching-system-api --lines 100

# 删除旧进程重新启动
pm2 delete teaching-system-api
pm2 start ecosystem.config.cjs
```

### 问题3: 文件监听不生效
```bash
# 检查 inotify-tools 是否安装
which inotifywait

# 安装
sudo apt-get install inotify-tools
```

---

## 📚 相关资源

- [PM2 官方文档](https://pm2.keymetrics.io/)
- [Git Hooks 文档](https://git-scm.com/book/zh/v2/自定义-Git-Git-钩子)
- [systemd 服务管理](https://www.freedesktop.org/software/systemd/man/systemd.service.html)
