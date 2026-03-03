#!/bin/bash

# 自动部署脚本 - 用于监听代码变化并自动部署
# 使用方法: ./auto-deploy.sh

set -e

PROJECT_DIR="/home/admin/server/sparklit-teaching-system"
BRANCH="main"
CHECK_INTERVAL=30  # 检查间隔(秒)

cd "$PROJECT_DIR"

echo "🤖 自动部署监控已启动"
echo "📂 项目目录: $PROJECT_DIR"
echo "🌿 监控分支: $BRANCH"
echo "⏱️  检查间隔: ${CHECK_INTERVAL}秒"
echo "----------------------------------------"

# 获取当前 commit hash
LAST_COMMIT=$(git rev-parse HEAD)

while true; do
    # 拉取最新的远程信息
    git fetch origin $BRANCH --quiet
    
    # 获取远程最新 commit hash
    REMOTE_COMMIT=$(git rev-parse origin/$BRANCH)
    
    # 比较本地和远程 commit
    if [ "$LAST_COMMIT" != "$REMOTE_COMMIT" ]; then
        echo ""
        echo "🔔 检测到代码更新！"
        echo "旧版本: $LAST_COMMIT"
        echo "新版本: $REMOTE_COMMIT"
        echo ""
        
        # 执行部署脚本
        if bash deploy.sh production; then
            echo "✅ 自动部署成功！"
            LAST_COMMIT=$REMOTE_COMMIT
        else
            echo "❌ 自动部署失败，请检查日志"
        fi
        
        echo "----------------------------------------"
    fi
    
    # 等待下一次检查
    sleep $CHECK_INTERVAL
done
