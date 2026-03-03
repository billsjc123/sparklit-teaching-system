# ⚠️ 重要：公网 IP vs 内网 IP

## 🌐 配置 GitHub Actions 必须使用公网 IP

### 为什么需要公网 IP？

GitHub Actions 运行在 GitHub 的云服务器上，需要通过**公网**访问你的服务器。
内网 IP 只能在局域网内访问，GitHub 无法连接。

---

## 📋 IP 地址对比

| 类型 | 示例 | 适用场景 |
|------|------|---------|
| **公网 IP** | `120.76.158.63` | GitHub Actions、外部访问 ✅ |
| **内网 IP** | `172.17.31.85` | 本地开发、内网部署 ❌ |

---

## 🔍 获取公网 IP 的方法

### 方法一：运行脚本（推荐）

```bash
./get-public-ip.sh
```

### 方法二：使用命令

```bash
# 方法1
curl ifconfig.me

# 方法2
curl ip.sb

# 方法3
curl icanhazip.com
```

### 方法三：控制台查看

登录你的云服务器提供商控制台：
- 阿里云：云服务器 ECS → 实例列表 → 公网 IP
- 腾讯云：云服务器 → 实例列表 → 公网 IP
- AWS：EC2 → Instances → Public IPv4 address
- 其他平台：查看实例详情页面

---

## ⚙️ 正确的配置

### GitHub Secrets 配置

```
SECRET NAME: SERVER_HOST
SECRET VALUE: 120.76.158.63  ✅ 使用公网 IP
```

**错误示例** ❌：
```
SECRET VALUE: 172.17.31.85  ❌ 这是内网 IP，GitHub 无法访问
SECRET VALUE: localhost      ❌ 本地地址
SECRET VALUE: 192.168.x.x    ❌ 局域网地址
```

---

## 🔐 安全注意事项

### 1. 确保 SSH 端口开放

公网 IP 访问需要防火墙允许 SSH 端口（默认 22）：

```bash
# 检查防火墙状态
sudo ufw status

# 如果使用 ufw，允许 SSH
sudo ufw allow 22/tcp

# 如果使用 firewalld
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --reload
```

### 2. 云服务器安全组配置

在云服务器控制台配置安全组规则：
- 协议：TCP
- 端口：22
- 来源：`0.0.0.0/0`（允许所有 IP，因为 GitHub Actions IP 是动态的）
- 说明：GitHub Actions SSH

### 3. 使用密钥认证（已配置）✅

- ✅ 我们已配置 SSH 密钥认证
- ✅ 私钥只存储在 GitHub Secrets 中
- ✅ 不使用密码登录，更安全

---

## 🧪 测试连接

### 从本地测试公网 IP 连接

```bash
# 测试 SSH 连接
ssh -i ~/.ssh/github_actions_key root@120.76.158.63

# 如果成功连接，说明公网 IP 配置正确
```

### 从其他服务器测试

如果你有其他服务器，可以从那里测试：

```bash
telnet 120.76.158.63 22
# 或
nc -zv 120.76.158.63 22
```

如果能连接，说明公网 IP 和端口都正常。

---

## 🐛 常见问题

### 问题1：GitHub Actions 连接超时

**错误信息**: `Connection timed out`

**可能原因**:
1. ❌ 使用了内网 IP
2. ❌ 防火墙未开放 22 端口
3. ❌ 云服务器安全组未配置

**解决方法**:
```bash
# 1. 确认使用公网 IP
./get-public-ip.sh

# 2. 检查防火墙
sudo ufw status
sudo ufw allow 22/tcp

# 3. 检查云服务器安全组（在控制台）
```

---

### 问题2：Permission denied

**错误信息**: `Permission denied (publickey)`

**可能原因**:
1. ❌ SSH 私钥配置错误
2. ❌ authorized_keys 权限不正确

**解决方法**:
```bash
# 检查 authorized_keys
cat ~/.ssh/authorized_keys | grep "github-actions"

# 修复权限
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh
```

---

### 问题3：无法获取公网 IP

**可能原因**:
1. 服务器无法访问外网
2. curl 命令未安装

**解决方法**:
```bash
# 安装 curl
sudo apt-get install curl  # Ubuntu/Debian
sudo yum install curl      # CentOS/RHEL

# 或在云服务器控制台查看公网 IP
```

---

## ✅ 快速检查清单

在配置 GitHub Actions 前，确认：

- [ ] ✅ 获取了服务器的**公网 IP**（不是内网 IP）
- [ ] ✅ 防火墙允许 SSH 端口 22
- [ ] ✅ 云服务器安全组允许 SSH 访问
- [ ] ✅ SSH 密钥配置正确
- [ ] ✅ 能从外部网络 SSH 连接到服务器

---

## 📚 相关命令

```bash
# 查看公网 IP
./get-public-ip.sh

# 查看配置信息
./show-secrets.sh

# 测试 SSH 连接
ssh -i ~/.ssh/github_actions_key root@公网IP

# 检查防火墙
sudo ufw status
```

---

**记住：GitHub Actions 需要公网 IP！** 🌐
