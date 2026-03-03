#!/bin/bash

# 获取服务器公网 IP 地址
# 使用方法: ./get-public-ip.sh

echo "🌐 正在获取服务器公网 IP..."
echo ""

# 方法1: ifconfig.me
PUBLIC_IP1=$(curl -s --connect-timeout 5 ifconfig.me 2>/dev/null)

# 方法2: ip.sb
PUBLIC_IP2=$(curl -s --connect-timeout 5 ip.sb 2>/dev/null)

# 方法3: icanhazip.com
PUBLIC_IP3=$(curl -s --connect-timeout 5 icanhazip.com 2>/dev/null)

echo "检测结果:"
echo "----------------------------------------"

if [ -n "$PUBLIC_IP1" ]; then
    echo "✅ ifconfig.me: $PUBLIC_IP1"
    RESULT_IP="$PUBLIC_IP1"
elif [ -n "$PUBLIC_IP2" ]; then
    echo "✅ ip.sb: $PUBLIC_IP2"
    RESULT_IP="$PUBLIC_IP2"
elif [ -n "$PUBLIC_IP3" ]; then
    echo "✅ icanhazip.com: $PUBLIC_IP3"
    RESULT_IP="$PUBLIC_IP3"
else
    echo "❌ 无法自动获取公网 IP"
    echo ""
    echo "请通过以下方式手动查询:"
    echo "1. 登录服务器提供商控制台查看"
    echo "2. 使用在线工具: https://www.ip.cn/"
    echo "3. 联系服务器提供商客服"
    exit 1
fi

echo ""
echo "🎯 你的服务器公网 IP:"
echo "----------------------------------------"
echo "$RESULT_IP"
echo "----------------------------------------"
echo ""
echo "请将此 IP 配置为 GitHub Secret: SERVER_HOST"
echo ""

# 显示内网 IP 作为对比
PRIVATE_IP=$(hostname -I | awk '{print $1}')
echo "📝 对比信息:"
echo "  公网 IP (外部访问): $RESULT_IP"
echo "  内网 IP (仅内部): $PRIVATE_IP"
echo ""
echo "⚠️  重要: GitHub Actions 需要使用公网 IP 才能连接到服务器！"
echo ""
