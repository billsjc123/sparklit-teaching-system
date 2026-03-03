import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { teacherDb, studentDb, scheduleDb, systemDb } from './database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3002;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// ==================== 兼容旧接口 ====================
// 读取所有数据（兼容前端原有接口）
app.get('/api/data', async (req, res) => {
  try {
    const data = systemDb.exportAll();
    res.json(data);
  } catch (error) {
    console.error('读取数据失败:', error);
    res.status(500).json({ error: '读取数据失败' });
  }
});

// 保存所有数据（兼容前端原有接口）
app.post('/api/data', async (req, res) => {
  try {
    const data = req.body;
    systemDb.importFromJson(data);
    res.json({ success: true, message: '数据保存成功' });
  } catch (error) {
    console.error('保存数据失败:', error);
    res.status(500).json({ error: '保存数据失败' });
  }
});

// 导出数据
app.get('/api/export', async (req, res) => {
  try {
    const data = systemDb.exportAll();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('.')[0];
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=teaching-system-backup-${timestamp}.json`);
    res.json(data);
  } catch (error) {
    console.error('导出数据失败:', error);
    res.status(500).json({ error: '导出数据失败' });
  }
});

// 导入数据
app.post('/api/import', async (req, res) => {
  try {
    const data = req.body;
    // 验证数据结构
    if (!data.teachers || !data.students || !data.schedules) {
      return res.status(400).json({ error: '数据格式不正确' });
    }
    systemDb.importFromJson(data);
    res.json({ success: true, message: '数据导入成功' });
  } catch (error) {
    console.error('导入数据失败:', error);
    res.status(500).json({ error: '导入数据失败' });
  }
});

// ==================== RESTful API（可选，未来优化用）====================
// 教师相关
app.get('/api/teachers', (req, res) => {
  try {
    const teachers = teacherDb.getAll();
    res.json(teachers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/teachers/:id', (req, res) => {
  try {
    const teacher = teacherDb.getById(req.params.id);
    if (!teacher) {
      return res.status(404).json({ error: '教师不存在' });
    }
    res.json(teacher);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/teachers', (req, res) => {
  try {
    teacherDb.create(req.body);
    res.json({ success: true, message: '教师创建成功' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/teachers/:id', (req, res) => {
  try {
    teacherDb.update(req.params.id, req.body);
    res.json({ success: true, message: '教师更新成功' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/teachers/:id', (req, res) => {
  try {
    teacherDb.delete(req.params.id);
    res.json({ success: true, message: '教师删除成功' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 学生相关
app.get('/api/students', (req, res) => {
  try {
    const students = studentDb.getAll();
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/students', (req, res) => {
  try {
    studentDb.create(req.body);
    res.json({ success: true, message: '学生创建成功' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 课程安排相关
app.get('/api/schedules', (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let schedules;
    if (startDate && endDate) {
      schedules = scheduleDb.getByDateRange(startDate, endDate);
    } else {
      schedules = scheduleDb.getAll();
    }
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/schedules', (req, res) => {
  try {
    scheduleDb.create(req.body);
    res.json({ success: true, message: '课程安排创建成功' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    version: systemDb.getVersion(),
    timestamp: new Date().toISOString() 
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`✅ 数据服务器运行在 http://localhost:${PORT}`);
  console.log(`📊 使用 SQLite 数据库`);
  console.log(`🗄️  数据库版本: ${systemDb.getVersion()}`);
});
