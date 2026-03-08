import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { teacherDb, studentDb, scheduleDb, systemDb } from './database.js';
import { createSessionMiddleware } from './utils/session.js';
import { requireAuth } from './middlewares/auth.middleware.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import statsRoutes from './routes/stats.routes.js';
import { autoMigrate } from './migrations/auto-migrate.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3002;

// CORS 配置 - 允许携带凭证
const allowedOrigins = [
  'http://localhost:5173',  // 本地开发
  'http://120.76.158.63',   // 生产环境
  'http://localhost:3002'   // 本地API测试
];

app.use(cors({
  origin: function (origin, callback) {
    // 允许没有 origin 的请求（比如移动应用、Postman等）
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(null, true); // 生产环境暂时允许所有来源，后续可以改为严格模式
    }
  },
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());
app.use(createSessionMiddleware());

// 认证路由
app.use('/api/auth', authRoutes);

// 用户管理路由
app.use('/api/users', userRoutes);

// 统计路由
app.use('/api/stats', statsRoutes);

// ==================== 兼容旧接口 ====================
// 读取所有数据（兼容前端原有接口）
app.get('/api/data', requireAuth, async (req, res) => {
  try {
    const data = systemDb.exportAll();
    
    // 根据用户角色过滤数据
    if (req.session && req.session.role === 'teacher' && req.session.teacherId) {
      // 教师只能看到自己的课程
      data.schedules = data.schedules.filter(s => s.teacherId === req.session.teacherId);
      
      // 教师只能看到自己教的学生（从课程中提取学生ID）
      const studentIds = new Set();
      data.schedules.forEach(schedule => {
        schedule.studentIds.forEach(id => studentIds.add(id));
      });
      data.students = data.students.filter(s => studentIds.has(s.id));
      
      // 教师只能看到自己的信息
      data.teachers = data.teachers.filter(t => t.id === req.session.teacherId);
    }
    
    res.json(data);
  } catch (error) {
    console.error('读取数据失败:', error);
    res.status(500).json({ error: '读取数据失败' });
  }
});

// 保存所有数据（兼容前端原有接口）
app.post('/api/data', requireAuth, async (req, res) => {
  try {
    const data = req.body;
    
    // 教师角色只能保存自己的课程数据
    if (req.session.role === 'teacher' && req.session.teacherId) {
      // 验证所有课程都是该教师的
      const invalidSchedules = data.schedules.filter(s => s.teacherId !== req.session.teacherId);
      if (invalidSchedules.length > 0) {
        return res.status(403).json({ 
          error: '无权限修改其他教师的课程' 
        });
      }
      
      // 只保存该教师的课程，其他数据从数据库读取
      const currentData = systemDb.exportAll();
      
      // 更新该教师的课程
      const otherSchedules = currentData.schedules.filter(s => s.teacherId !== req.session.teacherId);
      const teacherSchedules = data.schedules.filter(s => s.teacherId === req.session.teacherId);
      
      systemDb.importFromJson({
        teachers: currentData.teachers,
        students: currentData.students,
        schedules: [...otherSchedules, ...teacherSchedules],
        version: data.version
      });
    } else {
      // Admin 可以保存所有数据
      systemDb.importFromJson(data);
    }
    
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
    
    // 根据角色过滤课程
    if (req.session && req.session.role === 'teacher' && req.session.teacherId) {
      // 教师只能看到自己的课程
      if (startDate && endDate) {
        schedules = scheduleDb.getByDateRange(startDate, endDate)
          .filter(s => s.teacherId === req.session.teacherId);
      } else {
        schedules = scheduleDb.getAll()
          .filter(s => s.teacherId === req.session.teacherId);
      }
    } else if (req.session && req.session.role === 'admin') {
      // Admin 可以看到所有课程
      if (startDate && endDate) {
        schedules = scheduleDb.getByDateRange(startDate, endDate);
      } else {
        schedules = scheduleDb.getAll();
      }
    } else {
      // 未登录，返回空数组（或者返回401错误）
      schedules = [];
    }
    
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/schedules', (req, res) => {
  try {
    // 教师只能创建自己的课程
    if (req.session && req.session.role === 'teacher') {
      if (req.body.teacherId !== req.session.teacherId) {
        return res.status(403).json({ error: '无权限为其他教师创建课程' });
      }
    }
    
    scheduleDb.create(req.body);
    res.json({ success: true, message: '课程安排创建成功' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/schedules/:id', (req, res) => {
  try {
    const schedule = scheduleDb.getById(req.params.id);
    
    if (!schedule) {
      return res.status(404).json({ error: '课程不存在' });
    }
    
    // 教师只能编辑自己的课程
    if (req.session && req.session.role === 'teacher') {
      if (schedule.teacherId !== req.session.teacherId) {
        return res.status(403).json({ error: '无权限编辑其他教师的课程' });
      }
    }
    
    scheduleDb.update(req.params.id, req.body);
    res.json({ success: true, message: '课程安排更新成功' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/schedules/:id', (req, res) => {
  try {
    const schedule = scheduleDb.getById(req.params.id);
    
    if (!schedule) {
      return res.status(404).json({ error: '课程不存在' });
    }
    
    // 教师不能删除课程，只能由 admin 删除
    if (req.session && req.session.role === 'teacher') {
      return res.status(403).json({ error: '教师无权限删除课程' });
    }
    
    scheduleDb.delete(req.params.id);
    res.json({ success: true, message: '课程安排删除成功' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 设置课程状态为完成
app.put('/api/schedules/:id/status', (req, res) => {
  try {
    const schedule = scheduleDb.getById(req.params.id);
    
    if (!schedule) {
      return res.status(404).json({ error: '课程不存在' });
    }
    
    // 教师只能修改自己的课程状态
    if (req.session && req.session.role === 'teacher') {
      if (schedule.teacherId !== req.session.teacherId) {
        return res.status(403).json({ error: '无权限修改其他教师的课程状态' });
      }
    }
    
    const { status } = req.body;
    scheduleDb.update(req.params.id, { ...schedule, status });
    res.json({ success: true, message: '课程状态更新成功' });
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

// 启动服务器（带自动迁移）
async function startServer() {
  try {
    console.log('🔍 检查数据库迁移...');
    
    // 执行自动迁移
    await autoMigrate();
    
    // 启动服务器
    app.listen(PORT, () => {
      console.log(`✅ 数据服务器运行在 http://localhost:${PORT}`);
      console.log(`📊 使用 SQLite 数据库`);
      console.log(`🗄️  数据库版本: ${systemDb.getVersion()}`);
    });
  } catch (error) {
    console.error('❌ 服务器启动失败:', error);
    process.exit(1);
  }
}

startServer();
