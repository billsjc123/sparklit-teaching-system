# 🔧 修复 SSH 密钥问题

## ❌ 问题原因

之前提供的 SSH 密钥**不完整**，导致 GitHub Actions 部署失败：
```
ssh: no key found
ssh: unable to authenticate
```

## ✅ 解决方案

需要在 GitHub Secrets 中更新 `SERVER_SSH_KEY` 为**完整的密钥**。

---

## 📝 立即更新 GitHub Secret

### 1. 访问 Secrets 配置页面

**https://github.com/billsjc123/sparklit-teaching-system/settings/secrets/actions**

### 2. 更新 SERVER_SSH_KEY

1. 找到 `SERVER_SSH_KEY` 
2. 点击右侧的 **"Update"** 按钮
3. 删除旧的内容
4. 复制下面的**完整私钥**（包括 BEGIN 和 END 行，共 49 行）

---

### ⚠️ 完整的 SSH 私钥（必须完整复制）

```
-----BEGIN OPENSSH PRIVATE KEY-----
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
-----END OPENSSH PRIVATE KEY-----
```

**⚠️ 重要提示：**
- 必须完整复制所有 49 行
- 包括 `-----BEGIN OPENSSH PRIVATE KEY-----` 和 `-----END OPENSSH PRIVATE KEY-----`
- 不要添加任何额外的空格或换行

---

### 3. 保存更新

点击 **"Update secret"** 按钮保存。

---

## 🧪 更新后测试部署

### 方法 1：手动触发 Workflow

1. 访问：**https://github.com/billsjc123/sparklit-teaching-system/actions**
2. 选择 **"自动部署到服务器"** workflow
3. 点击 **"Run workflow"** → 选择 `main` 分支 → 点击 **"Run workflow"**

### 方法 2：推送代码触发

```bash
cd /home/admin/server/sparklit-teaching-system
git pull origin main
# 推送这个修复文档来触发部署
git add SSH_KEY_FIX.md
git commit -m "fix: 更新完整的 SSH 密钥文档"
git push origin main
```

---

## ✅ 预期结果

更新密钥后，GitHub Actions 应该能够：
1. ✅ 成功解析 SSH 密钥
2. ✅ 成功连接到服务器
3. ✅ 成功部署代码

---

## 📊 其他 Secrets 确认

确保以下 3 个 Secrets 也已正确配置：

| Secret Name | 正确值 | 状态 |
|------------|--------|------|
| `SERVER_HOST` | 你的服务器 IP | ❓ 需确认 |
| `SERVER_USER` | `admin` | ✅ 应该正确 |
| `SERVER_PORT` | `22` | ✅ 应该正确 |

---

更新完成后，让我知道测试结果！🚀
