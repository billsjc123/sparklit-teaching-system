# 币种功能更新说明

## 📋 功能概述

为学生费率系统添加了**币种字段**，支持**人民币 (CNY)** 和**港币 (HKD)** 两种币种。

## ✨ 新增功能

### 1. 学生管理
- ✅ 添加/编辑学生时可选择币种（人民币或港币）
- ✅ 学生列表显示币种标识（蓝色标签=人民币，紫色标签=港币）
- ✅ 费率显示对应的币种符号（¥ 或 HK$）

### 2. 费用统计
- ✅ **分币种统计**：人民币和港币分别统计，不聚合
- ✅ 显示三个收入指标：
  - 总收入（合并显示）
  - 人民币收入（¥）
  - 港币收入（HK$）
- ✅ 学生费用明细按币种分组展示
- ✅ 详细课程明细中显示币种标识

### 3. 课程安排
- ✅ 学生选择时显示对应币种符号
- ✅ 已选学生列表显示币种

## 🔄 数据迁移

### 自动迁移
运行以下命令为现有学生添加默认币种（人民币）：

```bash
cd /home/admin/server/sparklit-teaching-system
node currency-migration.js
```

### 迁移说明
- 所有现有学生默认设置为**人民币 (CNY)**
- 原始数据会自动备份（文件名包含时间戳）
- 迁移过程安全，可随时恢复

### 手动修改
如果某些学生需要改为港币：
1. 进入 **学生管理** 页面
2. 点击对应学生的 **编辑** 按钮
3. 在币种下拉框中选择 **港币 (HK$)**
4. 保存更新

## 📊 费用管理页面更新

### 统计卡片
```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│   总收入     │  人民币收入  │   港币收入   │  完成课程数  │
│  (合并显示)  │   ¥XXXX.XX   │  HK$XXXX.XX  │    XX 节     │
│              │   X 位学生   │   X 位学生   │              │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

### 学生费用明细
分两个部分展示：
1. **人民币学生** - 蓝色标签，¥ 符号
2. **港币学生** - 紫色标签，HK$ 符号

每个部分独立显示总计和学生列表。

## 🎨 UI 设计

### 币种标识颜色
- **人民币 (CNY)**: 🔵 蓝色 (`bg-blue-100 text-blue-800`)
- **港币 (HKD)**: 🟣 紫色 (`bg-purple-100 text-purple-800`)

### 币种符号
- **人民币**: `¥`
- **港币**: `HK$`

## 📝 类型定义

### Student 接口
```typescript
export type Currency = 'CNY' | 'HKD';

export interface Student {
  id: string;
  name: string;
  grade: string;
  parentContact: string;
  ratePerClass: number;
  currency: Currency; // 新增字段
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
```

### BillingReport 接口
```typescript
export interface BillingReport {
  month: string;
  totalRevenue: number;          // 总收入（合并）
  totalRevenueCNY: number;       // 人民币总收入
  totalRevenueHKD: number;       // 港币总收入
  studentBillings: MonthlyBilling[];
  studentBillingsCNY: MonthlyBilling[]; // 人民币学生账单
  studentBillingsHKD: MonthlyBilling[]; // 港币学生账单
  teacherStats: TeacherStat[];
}
```

## 🔧 修改的文件

### 类型定义
- `src/types/student.ts` - 添加 Currency 类型和 currency 字段
- `src/types/billing.ts` - 更新 BillingReport 接口

### 业务逻辑
- `src/services/billingService.ts` - 添加分币种统计逻辑

### 页面组件
- `src/pages/StudentsPage.tsx` - 添加币种选择器和显示
- `src/pages/BillingPage.tsx` - 分币种展示统计数据
- `src/pages/SchedulesPage.tsx` - 显示币种符号

### 迁移工具
- `currency-migration.js` - 数据迁移脚本

## ✅ 测试清单

- [ ] 添加人民币学生，验证显示正确
- [ ] 添加港币学生，验证显示正确
- [ ] 编辑学生修改币种，验证更新成功
- [ ] 费用管理页面查看人民币统计
- [ ] 费用管理页面查看港币统计
- [ ] 验证两种币种不聚合，分开展示
- [ ] 课程安排页面验证币种显示
- [ ] 运行数据迁移脚本，验证现有数据迁移成功

## 🚀 部署建议

1. **备份数据**
   ```bash
   cp server/data/data.json server/data/data.backup.json
   ```

2. **运行迁移**
   ```bash
   node currency-migration.js
   ```

3. **启动应用**
   ```bash
   npm run build
   pm2 reload ecosystem.config.cjs --env production
   ```

4. **验证功能**
   - 检查现有学生是否都显示人民币标签
   - 添加测试学生验证币种选择
   - 查看费用管理页面验证分币种统计

## 💡 使用建议

### 何时使用港币
- 学生来自香港地区
- 学费以港币结算
- 需要单独统计港币收入

### 何时使用人民币
- 学生来自大陆地区
- 学费以人民币结算
- 默认选项

### 注意事项
- 同一个学生只能使用一种币种
- 修改币种会影响历史统计数据的显示
- 两种币种**不会自动汇率转换**，仅分开展示

---

**更新日期**: 2026-03-03  
**版本**: v1.1.0
