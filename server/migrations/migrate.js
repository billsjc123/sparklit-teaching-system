/**
 * 数据库迁移工具
 * 
 * 用法：
 *   node migrate.js status      # 查看迁移状态
 *   node migrate.js up          # 执行所有待执行的迁移
 *   node migrate.js down        # 回滚最后一次迁移
 *   node migrate.js down --to 20260304_120000  # 回滚到指定版本
 */

import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 数据库路径
const DB_PATH = process.env.DATABASE_PATH || path.join(__dirname, '../data/teaching.db');
const MIGRATIONS_DIR = __dirname;

// 初始化数据库连接
const db = new Database(DB_PATH);
db.pragma('foreign_keys = ON');

// 创建迁移记录表
function initMigrationsTable() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      executed_at TEXT NOT NULL
    )
  `);
}

// 获取已执行的迁移
function getExecutedMigrations() {
  const rows = db.prepare('SELECT name FROM migrations ORDER BY name').all();
  return new Set(rows.map(row => row.name));
}

// 获取所有迁移文件
function getAllMigrationFiles() {
  const files = fs.readdirSync(MIGRATIONS_DIR)
    .filter(file => file.match(/^\d{8}_\d{6}_.*\.js$/) && file !== 'migrate.js')
    .sort();
  return files;
}

// 获取待执行的迁移
function getPendingMigrations() {
  const allMigrations = getAllMigrationFiles();
  const executedMigrations = getExecutedMigrations();
  return allMigrations.filter(m => !executedMigrations.has(m));
}

// 记录迁移
function recordMigration(name) {
  db.prepare('INSERT INTO migrations (name, executed_at) VALUES (?, ?)').run(
    name,
    new Date().toISOString()
  );
}

// 删除迁移记录
function removeMigrationRecord(name) {
  db.prepare('DELETE FROM migrations WHERE name = ?').run(name);
}

// 执行迁移
async function runMigration(filename, direction = 'up') {
  const filePath = path.join(MIGRATIONS_DIR, filename);
  console.log(`${direction === 'up' ? '执行' : '回滚'}迁移: ${filename}`);
  
  try {
    const migration = await import(`file://${filePath}`);
    
    if (direction === 'up') {
      if (!migration.up) {
        throw new Error(`迁移文件 ${filename} 缺少 up 函数`);
      }
      
      // 在事务中执行迁移
      db.transaction(() => {
        migration.up(db);
        recordMigration(filename);
      })();
      
      console.log(`✅ 成功执行: ${filename}`);
    } else {
      if (!migration.down) {
        throw new Error(`迁移文件 ${filename} 缺少 down 函数`);
      }
      
      // 在事务中回滚迁移
      db.transaction(() => {
        migration.down(db);
        removeMigrationRecord(filename);
      })();
      
      console.log(`✅ 成功回滚: ${filename}`);
    }
  } catch (error) {
    console.error(`❌ 失败: ${filename}`);
    console.error(error);
    throw error;
  }
}

// 显示迁移状态
function showStatus() {
  console.log('\n📊 数据库迁移状态\n');
  console.log(`数据库路径: ${DB_PATH}\n`);
  
  const allMigrations = getAllMigrationFiles();
  const executedMigrations = getExecutedMigrations();
  
  if (allMigrations.length === 0) {
    console.log('📭 没有找到迁移文件');
    return;
  }
  
  console.log('迁移列表:');
  allMigrations.forEach(migration => {
    const isExecuted = executedMigrations.has(migration);
    const status = isExecuted ? '✅ 已执行' : '⏳ 待执行';
    console.log(`  ${status}  ${migration}`);
  });
  
  const pending = allMigrations.length - executedMigrations.size;
  console.log(`\n总计: ${allMigrations.length} 个迁移`);
  console.log(`已执行: ${executedMigrations.size} 个`);
  console.log(`待执行: ${pending} 个`);
}

// 执行所有待执行的迁移
async function migrateUp() {
  const pending = getPendingMigrations();
  
  if (pending.length === 0) {
    console.log('\n✅ 所有迁移都已执行，数据库是最新的');
    return;
  }
  
  console.log(`\n🚀 开始执行 ${pending.length} 个待执行的迁移...\n`);
  
  for (const migration of pending) {
    await runMigration(migration, 'up');
  }
  
  console.log('\n🎉 所有迁移执行完成！');
}

// 回滚迁移
async function migrateDown(targetMigration = null) {
  const allMigrations = getAllMigrationFiles();
  const executedMigrations = getExecutedMigrations();
  const executed = allMigrations.filter(m => executedMigrations.has(m));
  
  if (executed.length === 0) {
    console.log('\n⚠️  没有可回滚的迁移');
    return;
  }
  
  let migrationsToRollback;
  
  if (targetMigration) {
    // 回滚到指定版本
    const targetIndex = executed.indexOf(targetMigration);
    if (targetIndex === -1) {
      console.error(`❌ 未找到迁移: ${targetMigration}`);
      return;
    }
    migrationsToRollback = executed.slice(targetIndex).reverse();
    console.log(`\n⚠️  将回滚到版本: ${targetMigration}`);
  } else {
    // 只回滚最后一个
    migrationsToRollback = [executed[executed.length - 1]];
    console.log(`\n⚠️  将回滚最后一个迁移`);
  }
  
  console.log(`即将回滚 ${migrationsToRollback.length} 个迁移:\n`);
  migrationsToRollback.forEach(m => console.log(`  - ${m}`));
  console.log('');
  
  for (const migration of migrationsToRollback) {
    await runMigration(migration, 'down');
  }
  
  console.log('\n✅ 回滚完成');
}

// 创建备份
function createBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T').join('_').split('.')[0];
  const backupPath = DB_PATH.replace('.db', `.db.backup-${timestamp}`);
  fs.copyFileSync(DB_PATH, backupPath);
  console.log(`✅ 数据库已备份到: ${backupPath}`);
  return backupPath;
}

// 主函数
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'status';
  
  initMigrationsTable();
  
  try {
    switch (command) {
      case 'status':
        showStatus();
        break;
        
      case 'up':
        console.log('⚠️  执行迁移前，强烈建议先备份数据库！');
        console.log('提示: 运行 "node migrate.js backup" 创建备份\n');
        await migrateUp();
        break;
        
      case 'down':
        const targetMigration = args.includes('--to') 
          ? args[args.indexOf('--to') + 1] 
          : null;
        console.log('⚠️  回滚迁移可能导致数据丢失！');
        console.log('请确保已经备份数据库。\n');
        await migrateDown(targetMigration);
        break;
        
      case 'backup':
        createBackup();
        break;
        
      default:
        console.log(`
数据库迁移工具

用法:
  node migrate.js status              查看迁移状态
  node migrate.js up                  执行所有待执行的迁移
  node migrate.js down                回滚最后一次迁移
  node migrate.js down --to <name>    回滚到指定版本
  node migrate.js backup              创建数据库备份

环境变量:
  DATABASE_PATH                       自定义数据库路径
        `);
    }
  } catch (error) {
    console.error('\n❌ 迁移过程中发生错误:');
    console.error(error);
    process.exit(1);
  } finally {
    db.close();
  }
}

main();
