#!/bin/bash

# GitHub Actions 一键配置脚本
# 使用方法: ./setup-github-actions.sh

set -e

echo "🚀 GitHub Actions 自动部署配置向导"
echo "========================================"
echo ""

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 检查是否在正确的目录
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ 错误: 请在项目根目录运行此脚本${NC}"
    exit 1
fi

echo -e "${BLUE}📋 第一步: 生成 SSH 密钥对${NC}"
echo "----------------------------------------"

SSH_KEY_PATH="$HOME/.ssh/github_actions_key"

if [ -f "$SSH_KEY_PATH" ]; then
    echo -e "${YELLOW}⚠️  检测到已存在的密钥: $SSH_KEY_PATH${NC}"
    read -p "是否要使用现有密钥? (y/n): " use_existing
    
    if [ "$use_existing" != "y" ]; then
        read -p "是否要覆盖生成新密钥? (y/n): " overwrite
        if [ "$overwrite" == "y" ]; then
            rm -f "$SSH_KEY_PATH" "$SSH_KEY_PATH.pub"
            ssh-keygen -t rsa -b 4096 -C "github-actions" -f "$SSH_KEY_PATH" -N ""
            echo -e "${GREEN}✅ 已生成新的 SSH 密钥对${NC}"
        fi
    fi
else
    echo "正在生成 SSH 密钥对..."
    ssh-keygen -t rsa -b 4096 -C "github-actions" -f "$SSH_KEY_PATH" -N ""
    echo -e "${GREEN}✅ SSH 密钥对生成成功${NC}"
fi

echo ""
echo -e "${BLUE}📋 第二步: 配置 SSH 免密登录${NC}"
echo "----------------------------------------"

# 添加公钥到 authorized_keys
if [ -f "$SSH_KEY_PATH.pub" ]; then
    mkdir -p "$HOME/.ssh"
    chmod 700 "$HOME/.ssh"
    
    # 检查公钥是否已存在
    if grep -q "$(cat $SSH_KEY_PATH.pub)" "$HOME/.ssh/authorized_keys" 2>/dev/null; then
        echo -e "${YELLOW}⚠️  公钥已存在于 authorized_keys 中${NC}"
    else
        cat "$SSH_KEY_PATH.pub" >> "$HOME/.ssh/authorized_keys"
        chmod 600 "$HOME/.ssh/authorized_keys"
        echo -e "${GREEN}✅ 已添加公钥到 authorized_keys${NC}"
    fi
else
    echo -e "${RED}❌ 错误: 找不到公钥文件${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}📋 第三步: 获取配置信息${NC}"
echo "----------------------------------------"

# 获取服务器信息
SERVER_HOST=$(hostname -I | awk '{print $1}')
SERVER_USER=$(whoami)
SERVER_PORT="22"

echo ""
echo -e "${GREEN}请复制以下信息到 GitHub Secrets:${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${YELLOW}Secret Name:${NC} SERVER_HOST"
echo -e "${YELLOW}Secret Value:${NC} $SERVER_HOST"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${YELLOW}Secret Name:${NC} SERVER_USER"
echo -e "${YELLOW}Secret Value:${NC} $SERVER_USER"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${YELLOW}Secret Name:${NC} SERVER_PORT"
echo -e "${YELLOW}Secret Value:${NC} $SERVER_PORT"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${YELLOW}Secret Name:${NC} SERVER_SSH_KEY"
echo -e "${YELLOW}Secret Value:${NC} (见下方完整内容)"
echo ""
echo "--- 开始复制 SSH 私钥 (包括这一行) ---"
cat "$SSH_KEY_PATH"
echo "--- 结束复制 SSH 私钥 (包括这一行) ---"
echo ""

# 生成配置文件供参考
CONFIG_FILE=".github-secrets.txt"
cat > "$CONFIG_FILE" << EOF
# GitHub Secrets 配置信息
# 请将以下信息添加到 GitHub 仓库的 Secrets 中
# 路径: Settings -> Secrets and variables -> Actions -> New repository secret

SERVER_HOST=$SERVER_HOST
SERVER_USER=$SERVER_USER
SERVER_PORT=$SERVER_PORT

SERVER_SSH_KEY (完整私钥内容如下):
$(cat "$SSH_KEY_PATH")
EOF

echo -e "${GREEN}✅ 配置信息已保存到: $CONFIG_FILE${NC}"
echo ""

echo -e "${BLUE}📋 第四步: 配置 GitHub Secrets${NC}"
echo "----------------------------------------"
echo ""
echo "1. 打开你的 GitHub 仓库"
echo "2. 点击 Settings (设置)"
echo "3. 左侧菜单选择 'Secrets and variables' -> 'Actions'"
echo "4. 点击 'New repository secret' 按钮"
echo "5. 依次添加上面显示的 4 个 Secrets"
echo ""
echo -e "${YELLOW}注意:${NC}"
echo "  - SECRET_SSH_KEY 需要复制完整的私钥内容"
echo "  - 包括 '-----BEGIN' 和 '-----END' 行"
echo "  - 不要添加额外的空格或换行"
echo ""

read -p "完成 GitHub Secrets 配置后，按回车继续..."

echo ""
echo -e "${BLUE}📋 第五步: 测试 SSH 连接${NC}"
echo "----------------------------------------"

echo "测试 SSH 连接..."
if ssh -i "$SSH_KEY_PATH" -o StrictHostKeyChecking=no -p "$SERVER_PORT" "$SERVER_USER@$SERVER_HOST" "echo 'SSH 连接测试成功'" 2>/dev/null; then
    echo -e "${GREEN}✅ SSH 连接测试成功！${NC}"
else
    echo -e "${RED}❌ SSH 连接测试失败${NC}"
    echo "请检查:"
    echo "  1. 服务器 SSH 服务是否运行"
    echo "  2. 防火墙是否允许 SSH 端口"
    echo "  3. authorized_keys 文件权限是否正确"
fi

echo ""
echo -e "${BLUE}📋 第六步: 检查服务器环境${NC}"
echo "----------------------------------------"

echo "检查必要的工具..."
MISSING_TOOLS=()

if ! command -v git &> /dev/null; then
    MISSING_TOOLS+=("git")
fi

if ! command -v node &> /dev/null; then
    MISSING_TOOLS+=("node")
fi

if ! command -v npm &> /dev/null; then
    MISSING_TOOLS+=("npm")
fi

if ! command -v pm2 &> /dev/null; then
    MISSING_TOOLS+=("pm2")
fi

if [ ${#MISSING_TOOLS[@]} -eq 0 ]; then
    echo -e "${GREEN}✅ 所有必要工具都已安装${NC}"
    echo "  - Git: $(git --version)"
    echo "  - Node.js: $(node --version)"
    echo "  - npm: $(npm --version)"
    echo "  - PM2: $(pm2 --version)"
else
    echo -e "${RED}❌ 缺少以下工具: ${MISSING_TOOLS[*]}${NC}"
    echo "请安装缺少的工具后再继续"
fi

echo ""
echo -e "${BLUE}📋 第七步: 推送到 GitHub${NC}"
echo "----------------------------------------"

if [ -d ".git" ]; then
    echo "检测到 Git 仓库"
    
    # 检查是否有远程仓库
    if git remote get-url origin &> /dev/null; then
        REMOTE_URL=$(git remote get-url origin)
        echo "远程仓库: $REMOTE_URL"
        echo ""
        
        read -p "是否要提交并推送 workflow 文件? (y/n): " push_changes
        
        if [ "$push_changes" == "y" ]; then
            # 添加 workflow 文件
            git add .github/workflows/
            
            # 检查是否有更改
            if git diff --cached --quiet; then
                echo -e "${YELLOW}⚠️  没有检测到新的更改${NC}"
            else
                git commit -m "添加 GitHub Actions 自动部署配置"
                echo "推送到远程仓库..."
                
                # 获取当前分支
                CURRENT_BRANCH=$(git branch --show-current)
                git push origin "$CURRENT_BRANCH"
                
                echo -e "${GREEN}✅ 已推送到 GitHub${NC}"
            fi
        fi
    else
        echo -e "${YELLOW}⚠️  未配置远程仓库${NC}"
        echo "请先添加 GitHub 远程仓库:"
        echo "  git remote add origin https://github.com/用户名/仓库名.git"
        echo "  git push -u origin main"
    fi
else
    echo -e "${RED}❌ 当前目录不是 Git 仓库${NC}"
    echo "请先初始化 Git 仓库:"
    echo "  git init"
    echo "  git add ."
    echo "  git commit -m 'Initial commit'"
    echo "  git remote add origin https://github.com/用户名/仓库名.git"
    echo "  git push -u origin main"
fi

echo ""
echo "========================================"
echo -e "${GREEN}🎉 配置完成！${NC}"
echo "========================================"
echo ""
echo -e "${BLUE}📝 接下来:${NC}"
echo "1. 确认 GitHub Secrets 已正确配置"
echo "2. 访问仓库的 Actions 页面查看工作流"
echo "3. 做一个小改动测试自动部署:"
echo "   git add ."
echo "   git commit -m '测试自动部署'"
echo "   git push origin main"
echo ""
echo -e "${BLUE}📚 相关文档:${NC}"
echo "  - GITHUB_ACTIONS_DEPLOY.md - 详细部署文档"
echo "  - GITHUB_ACTIONS_CHECKLIST.md - 配置检查清单"
echo ""
echo -e "${YELLOW}⚠️  安全提示:${NC}"
echo "  - 请妥善保管 $CONFIG_FILE 文件"
echo "  - 不要将私钥提交到 Git 仓库"
echo "  - 建议在配置完成后删除: rm $CONFIG_FILE"
echo ""
