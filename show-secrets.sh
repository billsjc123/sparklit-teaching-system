#!/bin/bash

# 显示 GitHub Secrets 配置信息
# 使用方法: ./show-secrets.sh

echo "========================================"
echo "  GitHub Secrets 配置信息"
echo "========================================"
echo ""
echo "请在 GitHub 仓库中配置以下 Secrets:"
echo "路径: Settings → Secrets and variables → Actions → New repository secret"
echo ""
echo "----------------------------------------"
echo "1️⃣  SERVER_HOST"
echo "----------------------------------------"
echo "⚠️  请使用服务器的公网 IP 地址"
echo ""
echo "当前内网 IP: $(hostname -I | awk '{print $1}')"
echo ""
echo "获取公网 IP 的方法:"
echo "方法1: curl -s ifconfig.me"
echo "方法2: curl -s ip.sb"
echo "方法3: 在服务器提供商控制台查看"
echo ""
PUBLIC_IP=$(curl -s --connect-timeout 3 ifconfig.me 2>/dev/null || curl -s --connect-timeout 3 ip.sb 2>/dev/null || echo "无法自动获取")
if [ "$PUBLIC_IP" != "无法自动获取" ] && [ -n "$PUBLIC_IP" ]; then
    echo "🌐 检测到的公网 IP: $PUBLIC_IP"
else
    echo "❌ 无法自动获取公网 IP，请手动查询"
fi
echo ""

echo "----------------------------------------"
echo "2️⃣  SERVER_USER"
echo "----------------------------------------"
whoami
echo ""

echo "----------------------------------------"
echo "3️⃣  SERVER_PORT"
echo "----------------------------------------"
echo "22"
echo ""

echo "----------------------------------------"
echo "4️⃣  SERVER_SSH_KEY (完整私钥内容)"
echo "----------------------------------------"
echo "请复制下面的完整内容 (包括 BEGIN 和 END 行):"
echo ""
cat ~/.ssh/github_actions_key
echo ""

echo "========================================"
echo "📋 配置步骤:"
echo "========================================"
echo "1. 打开 GitHub 仓库页面"
echo "2. 点击 Settings"
echo "3. 左侧菜单: Secrets and variables → Actions"
echo "4. 点击 New repository secret"
echo "5. 依次添加上面的 4 个 Secrets"
echo ""
echo "完成后运行: git push origin main"
echo "即可触发自动部署！ 🚀"
echo ""
