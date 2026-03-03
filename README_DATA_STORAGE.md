# 数据存储说明

## ✅ 已完成改造

系统现在使用**本地JSON文件**持久化存储数据，不再依赖浏览器localStorage。

## 📁 数据存储位置

```
teaching-system/server/data/data.json
```

所有教师、学生、课程数据都保存在这个文件中。

## 🚀 启动方式

### 方式1：同时启动前端和后端（推荐）
```bash
npm run dev:all
```

### 方式2：分别启动
```bash
# 终端1：启动数据服务器
npm run server

# 终端2：启动前端
npm run dev
```

## ✨ 优势

1. **数据持久化**：数据保存在文件中，不会因为清除浏览器缓存而丢失
2. **跨浏览器**：任何浏览器访问都能看到相同的数据
3. **易于备份**：直接复制`server/data/data.json`文件即可备份
4. **易于迁移**：将整个项目文件夹拷贝到其他电脑即可使用
5. **双重保障**：数据同时保存到服务器文件和localStorage，确保不丢失

## 🔧 技术架构

- **前端**: React + Vite (端口5173)
- **后端**: Express + Node.js (端口3001)
- **数据**: JSON文件存储

## 📝 数据格式

```json
{
  "teachers": [...],
  "students": [...],
  "schedules": [...],
  "version": "1.0.0"
}
```

## ⚠️ 注意事项

1. 使用`npm run dev:all`启动时会同时运行前端和后端
2. 数据文件位于`server/data/data.json`
3. 如果服务器未启动，系统会降级使用localStorage
4. 建议定期备份`data.json`文件

## 🔄 数据迁移

如果之前有localStorage中的数据，系统会自动作为备份保留。您可以：
1. 手动将数据导出为JSON
2. 复制到`server/data/data.json`
3. 重启服务器即可
