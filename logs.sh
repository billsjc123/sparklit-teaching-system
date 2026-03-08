#!/bin/bash
# 快速查看日志脚本

# 如果提供参数 err，只看错误日志
if [ "$1" == "err" ] || [ "$1" == "error" ]; then
    echo "📋 查看错误日志..."
    pm2 logs teaching-system-api --err --lines 50
elif [ "$1" == "out" ] || [ "$1" == "output" ]; then
    echo "📋 查看输出日志..."
    pm2 logs teaching-system-api --out --lines 50
else
    echo "📋 查看所有日志 (实时)..."
    echo "💡 提示: Ctrl+C 退出"
    echo ""
    pm2 logs teaching-system-api
fi
