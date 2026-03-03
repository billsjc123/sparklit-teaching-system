# 💰 总费用按币种分别显示 - 更新说明

## 📝 更新内容

### 问题
之前在课程安排页面中，当一节课包含不同币种的学生时（例如：1 个人民币学生 + 1 个港币学生），总费用只显示一个数字（如 `¥250.00`），无法区分不同币种的金额。

### 解决方案
现在系统会**按币种分别显示**总费用，例如：
- 纯人民币学生：`¥200.00`
- 纯港币学生：`HK$200.00`
- 混合币种学生：`¥100.00 + HK$100.00`

---

## 🔧 技术实现

### 新增函数

#### 1. `getScheduleFeesByCurrency(schedule)`
```typescript
// 按币种分别计算费用
const getScheduleFeesByCurrency = (schedule: Schedule) => {
  const students = schedule.studentIds
    .map(id => state.students.find(s => s.id === id))
    .filter(s => s !== undefined);
  
  if (students.length === 0) return { CNY: 0, HKD: 0 };
  
  const fees = students.reduce((acc, student) => {
    const fee = student.ratePerClass / schedule.studentIds.length;
    if (student.currency === 'CNY') {
      acc.CNY += fee;
    } else {
      acc.HKD += fee;
    }
    return acc;
  }, { CNY: 0, HKD: 0 });
  
  return fees;
};
```

**功能**：计算一节课中人民币和港币的总费用

**返回值**：
```typescript
{
  CNY: 100.00,  // 人民币总额
  HKD: 100.00   // 港币总额
}
```

---

#### 2. `formatMixedCurrencyFee(schedule)`
```typescript
// 格式化混合币种的费用显示
const formatMixedCurrencyFee = (schedule: Schedule) => {
  const fees = getScheduleFeesByCurrency(schedule);
  const parts: string[] = [];
  
  if (fees.CNY > 0) {
    parts.push(`¥${fees.CNY.toFixed(2)}`);
  }
  if (fees.HKD > 0) {
    parts.push(`HK$${fees.HKD.toFixed(2)}`);
  }
  
  return parts.length > 0 ? parts.join(' + ') : '¥0.00';
};
```

**功能**：将币种金额格式化为易读的字符串

**示例输出**：
- `¥200.00`（纯人民币）
- `HK$200.00`（纯港币）
- `¥100.00 + HK$100.00`（混合币种）

---

## 📍 更新位置

### 文件：`src/pages/SchedulesPage.tsx`

#### 1. **列表视图 - 课程费用列**
```tsx
<TableCell className="text-green-600 font-medium">
  {formatMixedCurrencyFee(schedule)}
</TableCell>
```

**效果**：课程列表中的"课程费用"列现在分币种显示

---

#### 2. **课程详情对话框**
```tsx
<div>
  <Label className="text-gray-600">课程费用</Label>
  <p className="font-medium text-green-600 text-lg">
    {formatMixedCurrencyFee(selectedSchedule)}
  </p>
</div>
```

**效果**：点击课程查看详情时，费用按币种分别显示

---

#### 3. **切换状态确认对话框**
```tsx
<p>
  <span className="font-medium">费用：</span>
  {formatMixedCurrencyFee(scheduleToToggle)}
</p>
```

**效果**：标记课程为"已完成"或"待完成"时，确认对话框中显示分币种费用

---

#### 4. **删除课程确认对话框**
```tsx
<p>
  <span className="font-medium">费用：</span>
  {formatMixedCurrencyFee(scheduleToDelete)}
</p>
```

**效果**：删除课程时，确认对话框中显示分币种费用

---

## 📊 使用场景示例

### 场景 1：纯人民币课程
**学生**：
- 张三（人民币 ¥200/节）
- 李四（人民币 ¥200/节）

**显示**：`¥200.00`（每人 ¥100）

---

### 场景 2：纯港币课程
**学生**：
- John（港币 HK$200/节）
- Mary（港币 HK$200/节）

**显示**：`HK$200.00`（每人 HK$100）

---

### 场景 3：混合币种课程
**学生**：
- 张三（人民币 ¥200/节）
- John（港币 HK$200/节）

**显示**：`¥100.00 + HK$100.00`

---

## ✅ 测试建议

1. **创建纯人民币课程**
   - 添加 2 个人民币学生到同一节课
   - 验证显示：`¥XXX.00`

2. **创建纯港币课程**
   - 添加 2 个港币学生到同一节课
   - 验证显示：`HK$XXX.00`

3. **创建混合币种课程**
   - 添加 1 个人民币学生 + 1 个港币学生
   - 验证显示：`¥XXX.00 + HK$XXX.00`

4. **验证各个界面**
   - ✅ 列表视图的费用列
   - ✅ 课程详情对话框
   - ✅ 切换状态确认对话框
   - ✅ 删除课程确认对话框

---

## 🔗 相关文件

- **主文件**：`src/pages/SchedulesPage.tsx`
- **类型定义**：`src/types/student.ts`（Currency 类型）
- **其他相关**：
  - `src/pages/BillingPage.tsx`（账单页面已支持分币种统计）
  - `src/services/billingService.ts`（账单服务已支持分币种计算）

---

## 💡 备注

- 原有的 `getScheduleFee()` 函数**保留**，以防其他地方仍在使用
- 新增的函数只用于显示，不影响数据存储和计算逻辑
- 账单系统（BillingPage）已经支持分币种统计，无需修改

---

**更新时间**：2026-03-03  
**影响范围**：课程安排页面（SchedulesPage）
