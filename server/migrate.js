#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { systemDb } from './database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JSON_FILE = path.join(__dirname, 'data', 'data.json');

async function migrate() {
  try {
    console.log('🔄 开始从 JSON 迁移到 SQLite...');

    // 检查 JSON 文件是否存在
    try {
      await fs.access(JSON_FILE);
    } catch {
      console.log('⚠️  未找到 data.json 文件，跳过迁移');
      console.log('✅ 将使用空数据库');
      process.exit(0);
    }

    // 读取 JSON 数据
    const jsonData = await fs.readFile(JSON_FILE, 'utf-8');
    const data = JSON.parse(jsonData);

    console.log(`📊 发现数据:`);
    console.log(`   - 教师: ${data.teachers?.length || 0} 条`);
    console.log(`   - 学生: ${data.students?.length || 0} 条`);
    console.log(`   - 课程: ${data.schedules?.length || 0} 条`);

    // 导入到 SQLite
    systemDb.importFromJson(data);

    console.log('✅ 数据迁移成功！');
    
    // 备份原 JSON 文件
    const backupFile = JSON_FILE.replace('.json', `.backup.${Date.now()}.json`);
    await fs.copyFile(JSON_FILE, backupFile);
    console.log(`📦 原数据已备份到: ${backupFile}`);

    // 验证迁移结果
    const migratedData = systemDb.exportAll();
    console.log(`\n✅ 验证迁移结果:`);
    console.log(`   - 教师: ${migratedData.teachers.length} 条`);
    console.log(`   - 学生: ${migratedData.students.length} 条`);
    console.log(`   - 课程: ${migratedData.schedules.length} 条`);

    console.log('\n🎉 迁移完成！现在可以重启服务器使用 SQLite 了');
    console.log('💡 运行: npm run server');

    process.exit(0);
  } catch (error) {
    console.error('❌ 迁移失败:', error);
    process.exit(1);
  }
}

migrate();
