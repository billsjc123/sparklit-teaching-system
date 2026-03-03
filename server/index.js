import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3002;
const DATA_FILE = path.join(__dirname, 'data', 'data.json');

app.use(cors());
app.use(express.json());

// 确保数据文件存在
async function ensureDataFile() {
  try {
    await fs.access(DATA_FILE);
  } catch {
    const defaultData = {
      teachers: [],
      students: [],
      schedules: [],
      version: '1.0.0'
    };
    await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify(defaultData, null, 2));
  }
}

// 读取数据
app.get('/api/data', async (req, res) => {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    res.json(JSON.parse(data));
  } catch (error) {
    console.error('读取数据失败:', error);
    res.status(500).json({ error: '读取数据失败' });
  }
});

// 保存数据
app.post('/api/data', async (req, res) => {
  try {
    const data = req.body;
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
    res.json({ success: true, message: '数据保存成功' });
  } catch (error) {
    console.error('保存数据失败:', error);
    res.status(500).json({ error: '保存数据失败' });
  }
});

// 导出数据
app.get('/api/export', async (req, res) => {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('.')[0];
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=teaching-system-backup-${timestamp}.json`);
    res.send(data);
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
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
    res.json({ success: true, message: '数据导入成功' });
  } catch (error) {
    console.error('导入数据失败:', error);
    res.status(500).json({ error: '导入数据失败' });
  }
});

// 启动服务器
async function start() {
  await ensureDataFile();
  app.listen(PORT, () => {
    console.log(`✅ 数据服务器运行在 http://localhost:${PORT}`);
    console.log(`📁 数据文件位置: ${DATA_FILE}`);
  });
}

start();
