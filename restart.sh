#!/bin/bash
# 教学系统快速重启脚本

set -e

echo "🔄 正在重启教学系统服务..."
echo ""

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# 重启后端服务
echo "📦 重启后端 API 服务..."
pm2 restart teaching-system-api --update-env

# 等待服务启动
sleep 2

# 检查服务状态
echo ""
echo "📊 服务状态："
pm2 status teaching-system-api

echo ""
echo "✅ 重启完成！"
echo ""
echo "💡 提示："
echo "  - 查看日志: pm2 logs teaching-system-api"
echo "  - 查看状态: pm2 status"
echo "  - 停止服务: pm2 stop teaching-system-api"
echo ""
