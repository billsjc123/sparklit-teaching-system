#!/bin/bash
# 完整部署脚本（拉取代码、构建、重启）

set -e

echo "🚀 开始完整部署流程..."
echo ""

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# 1. 拉取最新代码
echo "📥 [1/5] 拉取最新代码..."
git pull origin main

# 2. 安装依赖
echo ""
echo "📦 [2/5] 检查并安装依赖..."
npm install --production

# 3. 构建前端
echo ""
echo "🏗️  [3/5] 构建前端..."
npm run build

# 4. 运行数据库迁移（如果有）
echo ""
echo "🗄️  [4/5] 运行数据库迁移..."
npm run migrate:up || echo "⚠️  数据库迁移跳过或已是最新"

# 5. 重启服务
echo ""
echo "🔄 [5/5] 重启服务..."
pm2 restart teaching-system-api --update-env

# 等待服务启动
sleep 3

# 检查服务状态
echo ""
echo "📊 服务状态："
pm2 status teaching-system-api

# 检查服务是否正常运行
if pm2 list | grep -q "teaching-system-api.*online"; then
    echo ""
    echo "✅ 部署成功！"
    echo ""
    echo "🌐 访问地址:"
    echo "  - http://120.76.158.63"
    echo ""
    echo "💡 提示："
    echo "  - 查看日志: pm2 logs teaching-system-api"
    echo "  - 查看错误: pm2 logs teaching-system-api --err"
else
    echo ""
    echo "❌ 部署可能出现问题，请检查日志："
    echo "   pm2 logs teaching-system-api --err"
    exit 1
fi
