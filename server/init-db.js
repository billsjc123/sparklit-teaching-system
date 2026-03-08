#!/usr/bin/env node
/**
 * 初始化数据库脚本
 */

import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, 'data', 'teaching.db');

console.log('🔧 初始化数据库...\n');

// 确保 data 目录存在
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  console.log('✅ 创建 data 目录');
}

// 初始化数据库
const db = new Database(DB_PATH);

// 启用外键约束
db.pragma('foreign_keys = ON');

// 创建教师表
db.exec(`
  CREATE TABLE IF NOT EXISTS teachers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    subjects TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    notes TEXT,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL
  )
`);
console.log('✅ 创建 teachers 表');

// 创建学生表
db.exec(`
  CREATE TABLE IF NOT EXISTS students (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    grade TEXT NOT NULL,
    phone TEXT,
    parentContact TEXT,
    ratePerClass REAL,
    address TEXT,
    notes TEXT,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL
  )
`);
console.log('✅ 创建 students 表');

// 创建课程安排表
db.exec(`
  CREATE TABLE IF NOT EXISTS schedules (
    id TEXT PRIMARY KEY,
    teacherId TEXT NOT NULL,
    studentIds TEXT NOT NULL,
    subject TEXT NOT NULL,
    type TEXT NOT NULL,
    startTime TEXT NOT NULL,
    endTime TEXT NOT NULL,
    status TEXT NOT NULL,
    notes TEXT,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL,
    FOREIGN KEY (teacherId) REFERENCES teachers(id) ON DELETE CASCADE
  )
`);
console.log('✅ 创建 schedules 表');

// 创建系统配置表
db.exec(`
  CREATE TABLE IF NOT EXISTS system_config (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updatedAt TEXT NOT NULL
  )
`);
console.log('✅ 创建 system_config 表');

// 插入版本信息
const stmt = db.prepare(`
  INSERT OR IGNORE INTO system_config (key, value, updatedAt) 
  VALUES (?, ?, ?)
`);
stmt.run('version', '2.0.0', new Date().toISOString());

db.close();

console.log('\n✅ 数据库初始化完成！');
console.log(`📁 数据库文件: ${DB_PATH}\n`);
console.log('下一步：运行数据库迁移');
console.log('  npm run migrate:up\n');
