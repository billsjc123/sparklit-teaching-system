#!/bin/bash

# 教学系统部署脚本
# 使用方法: ./deploy.sh [环境]
# 示例: ./deploy.sh production

set -e  # 遇到错误立即退出

ENVIRONMENT=${1:-production}
PROJECT_NAME="teaching-system"

echo "🚀 开始部署 ${PROJECT_NAME} 到 ${ENVIRONMENT} 环境..."

# 1. 拉取最新代码
echo "📥 拉取最新代码..."
git pull origin main

# 2. 安装依赖
echo "📦 安装依赖..."
npm install --production=false

# 3. 构建前端
echo "🔨 构建前端..."
npm run build

# 4. 重启后端服务
echo "🔄 重启后端服务..."
pm2 reload ecosystem.config.cjs --env ${ENVIRONMENT}

# 5. 检查服务状态
echo "✅ 检查服务状态..."
pm2 status

echo "🎉 部署完成！"
echo "📊 查看日志: pm2 logs ${PROJECT_NAME}-api"
