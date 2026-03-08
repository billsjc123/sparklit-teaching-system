# 数据库备份指南

## ✅ 自动备份已启用

### 📅 备份计划

- **每天凌晨 2:00** - 自动执行数据库备份
- **保留时间** - 保留最近 30 天的备份
- **备份位置** - `/home/admin/backups/teaching-system/`

### 📁 备份文件说明

```bash
/home/admin/backups/teaching-system/
├── teaching-system-backup-20260308_180548.tar.gz  # 备份文件（含日期时间戳）
└── teaching-system-backup-20260309_020000.tar.gz
```

每个备份文件包含：
- `teaching.db` - 主数据库（教师、学生、课程）
- `sessions.db` - 会话数据

---

## 🛠️ 手动操作命令

### 1. 立即执行备份
```bash
bash /home/admin/server/sparklit-teaching-system/backup-database.sh
```

### 2. 查看备份日志
```bash
tail -20 /home/admin/server/sparklit-teaching-system/backup.log
```

### 3. 查看所有备份文件
```bash
ls -lh /home/admin/backups/teaching-system/
```

### 4. 查看定时任务
```bash
sudo crontab -l
```

### 5. 修改定时任务
```bash
sudo crontab -e
```

---

## 🔄 恢复数据

### 如果需要恢复数据：

#### 方法 1：从备份恢复

```bash
# 1. 停止服务
pm2 stop teaching-system-api

# 2. 解压备份文件
cd /home/admin/backups/teaching-system/
tar -xzf teaching-system-backup-YYYYMMDD_HHMMSS.tar.gz

# 3. 恢复数据库
cp teaching.db.YYYYMMDD_HHMMSS /home/admin/server/sparklit-teaching-system/server/data/teaching.db

# 4. 重启服务
pm2 restart teaching-system-api
```

#### 方法 2：从系统导出文件恢复

1. 登录系统
2. 点击 "导入数据" 按钮
3. 选择之前导出的 ZIP 文件
4. 确认导入

---

## 📊 备份状态监控

### 查看最新备份
```bash
ls -lt /home/admin/backups/teaching-system/ | head -5
```

### 查看备份统计
```bash
# 备份文件数量
find /home/admin/backups/teaching-system/ -name "*.tar.gz" | wc -l

# 总占用空间
du -sh /home/admin/backups/teaching-system/
```

---

## ⚠️ 重要提醒

1. **定期检查备份日志**，确保备份正常执行
2. **建议每月下载一次备份**到本地电脑，作为额外保障
3. **重要操作前**（如大量删除、批量修改）先手动备份一次
4. **备份文件会自动保留 30 天**，超过 30 天的会被自动删除

---

## 💡 其他建议

### 下载备份到本地

使用 SCP 命令下载最新备份：
```bash
# 从本地电脑执行：
scp admin@120.76.158.63:/home/admin/backups/teaching-system/teaching-system-backup-*.tar.gz ./
```

或使用 FTP/SFTP 客户端（如 FileZilla）直接下载。

### 测试恢复流程

建议定期（如每季度）测试一次恢复流程，确保备份文件可用。

---

## 📞 故障排查

### 如果备份失败

1. 检查磁盘空间：`df -h`
2. 检查日志文件：`cat /home/admin/server/sparklit-teaching-system/backup.log`
3. 手动执行脚本查看错误：`bash /home/admin/server/sparklit-teaching-system/backup-database.sh`

### 如果找不到备份文件

检查 crontab 是否正常：
```bash
sudo crontab -l
sudo systemctl status crond
```

---

## ✅ 当前状态

- ✅ 自动备份脚本：已创建并测试通过
- ✅ 定时任务：已设置（每天凌晨 2:00）
- ✅ 备份目录：已创建
- ✅ 首次备份：已完成

**您的数据现在已经有双重保护：**
1. SQLite 持久化存储（主数据库）
2. 每日自动备份（备份文件）
