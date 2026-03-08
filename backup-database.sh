#!/bin/bash
# SQLite 数据库自动备份脚本
# 作者: Auto-generated
# 用途: 定期备份教学管理系统数据库

# 配置
DATE=$(date +%Y%m%d_%H%M%S)
DB_DIR="/home/admin/server/sparklit-teaching-system/server/data"
BACKUP_DIR="/home/admin/backups/teaching-system"
LOG_FILE="/home/admin/server/sparklit-teaching-system/backup.log"

# 创建备份目录
mkdir -p "$BACKUP_DIR"

# 记录开始时间
echo "[$(date '+%Y-%m-%d %H:%M:%S')] 开始备份..." >> "$LOG_FILE"

# 检查数据库文件是否存在
if [ ! -f "$DB_DIR/teaching.db" ]; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ❌ 错误: 数据库文件不存在" >> "$LOG_FILE"
    exit 1
fi

# 备份数据库文件
cp "$DB_DIR/teaching.db" "$BACKUP_DIR/teaching.db.$DATE"
cp "$DB_DIR/sessions.db" "$BACKUP_DIR/sessions.db.$DATE" 2>/dev/null || true

# 压缩备份
cd "$BACKUP_DIR"
tar -czf "teaching-system-backup-$DATE.tar.gz" "teaching.db.$DATE" "sessions.db.$DATE" 2>/dev/null
rm "teaching.db.$DATE" "sessions.db.$DATE" 2>/dev/null

# 检查备份是否成功
if [ -f "teaching-system-backup-$DATE.tar.gz" ]; then
    BACKUP_SIZE=$(du -h "teaching-system-backup-$DATE.tar.gz" | cut -f1)
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✅ 备份成功: teaching-system-backup-$DATE.tar.gz ($BACKUP_SIZE)" >> "$LOG_FILE"
else
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ❌ 备份失败" >> "$LOG_FILE"
    exit 1
fi

# 清理旧备份（保留最近30天）
DELETED=$(find "$BACKUP_DIR" -name "*.tar.gz" -mtime +30 -delete -print | wc -l)
if [ "$DELETED" -gt 0 ]; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] 🗑️  清理了 $DELETED 个旧备份文件" >> "$LOG_FILE"
fi

# 显示当前备份列表
BACKUP_COUNT=$(find "$BACKUP_DIR" -name "*.tar.gz" | wc -l)
echo "[$(date '+%Y-%m-%d %H:%M:%S')] 📊 当前共有 $BACKUP_COUNT 个备份文件" >> "$LOG_FILE"

exit 0
