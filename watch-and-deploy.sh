#!/bin/bash

# 监听本地文件变化并自动部署 (适合开发环境)
# 需要安装 inotify-tools: sudo apt-get install inotify-tools
# 使用方法: ./watch-and-deploy.sh

PROJECT_DIR="/home/admin/server/sparklit-teaching-system"
WATCH_DIRS="src server"  # 监听的目录

cd "$PROJECT_DIR"

echo "👀 文件监听模式已启动"
echo "📂 监听目录: $WATCH_DIRS"
echo "🔄 文件变化时将自动重新构建和重启服务"
echo "按 Ctrl+C 停止监听"
echo "----------------------------------------"

# 检查 inotify-tools 是否安装
if ! command -v inotifywait &> /dev/null; then
    echo "❌ 错误: 未安装 inotify-tools"
    echo "请运行: sudo apt-get install inotify-tools"
    exit 1
fi

# 防抖动 - 避免频繁触发
LAST_RUN=0
DEBOUNCE=3  # 3秒内的变化只触发一次

while inotifywait -r -e modify,create,delete $WATCH_DIRS; do
    CURRENT_TIME=$(date +%s)
    TIME_DIFF=$((CURRENT_TIME - LAST_RUN))
    
    if [ $TIME_DIFF -gt $DEBOUNCE ]; then
        echo ""
        echo "🔔 检测到文件变化，开始重新部署..."
        
        # 构建前端
        echo "🔨 构建前端..."
        npm run build
        
        # 重启后端
        echo "🔄 重启后端服务..."
        pm2 reload ecosystem.config.cjs
        
        echo "✅ 重新部署完成！"
        echo "----------------------------------------"
        
        LAST_RUN=$CURRENT_TIME
    fi
done
