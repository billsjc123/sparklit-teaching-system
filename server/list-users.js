#!/usr/bin/env node
/**
 * 查看所有用户
 */

import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, 'data', 'teaching.db');

const db = new Database(DB_PATH);

console.log('\n👥 系统用户列表:\n');

const users = db.prepare('SELECT id, username, role, teacherId, createdAt FROM users').all();

if (users.length === 0) {
  console.log('暂无用户');
} else {
  users.forEach((user, index) => {
    console.log(`${index + 1}. ${user.username}`);
    console.log(`   角色: ${user.role === 'admin' ? '管理员' : '教师'}`);
    console.log(`   ID: ${user.id}`);
    if (user.teacherId) {
      console.log(`   关联教师ID: ${user.teacherId}`);
    }
    console.log(`   创建时间: ${user.createdAt}`);
    console.log('');
  });
}

console.log(`总计: ${users.length} 个用户\n`);

db.close();
