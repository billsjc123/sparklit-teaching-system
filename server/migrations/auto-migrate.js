/**
 * 自动迁移工具
 * 在服务器启动时自动执行待执行的迁移
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

/**
 * 自动执行迁移
 * @returns {Promise<boolean>} 是否执行了迁移
 */
export async function autoMigrate() {
  let migrationsRun = false;
  let db;
  
  try {
    db = new Database(DB_PATH);
    db.pragma('foreign_keys = ON');
    
    // 创建迁移记录表
    db.exec(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        executed_at TEXT NOT NULL
      )
    `);
    
    // 获取已执行的迁移
    const executedMigrations = new Set(
      db.prepare('SELECT name FROM migrations ORDER BY name')
        .all()
        .map(row => row.name)
    );
    
    // 获取所有迁移文件
    const allMigrationFiles = fs.readdirSync(MIGRATIONS_DIR)
      .filter(file => file.match(/^\d{8}_\d{6}_.*\.js$/) && 
                     file !== 'migrate.js' && 
                     file !== 'auto-migrate.js')
      .sort();
    
    // 获取待执行的迁移
    const pendingMigrations = allMigrationFiles.filter(
      m => !executedMigrations.has(m)
    );
    
    if (pendingMigrations.length === 0) {
      console.log('✅ 数据库结构是最新的');
      return false;
    }
    
    console.log(`\n🔄 发现 ${pendingMigrations.length} 个待执行的迁移`);
    
    // 创建自动备份
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T').join('_').split('.')[0];
    const backupPath = DB_PATH.replace('.db', `.db.auto-backup-${timestamp}`);
    fs.copyFileSync(DB_PATH, backupPath);
    console.log(`📦 自动备份已创建: ${path.basename(backupPath)}`);
    
    // 执行迁移
    for (const migrationFile of pendingMigrations) {
      const filePath = path.join(MIGRATIONS_DIR, migrationFile);
      console.log(`⏳ 执行迁移: ${migrationFile}`);
      
      try {
        const migration = await import(`file://${filePath}`);
        
        if (!migration.up) {
          throw new Error(`迁移文件 ${migrationFile} 缺少 up 函数`);
        }
        
        // 在事务中执行迁移
        db.transaction(() => {
          migration.up(db);
          db.prepare('INSERT INTO migrations (name, executed_at) VALUES (?, ?)').run(
            migrationFile,
            new Date().toISOString()
          );
        })();
        
        console.log(`✅ 成功: ${migrationFile}`);
        migrationsRun = true;
      } catch (error) {
        console.error(`❌ 迁移失败: ${migrationFile}`);
        console.error(error);
        
        // 如果迁移失败，提示恢复备份
        console.error(`\n⚠️  迁移失败！建议从备份恢复:`);
        console.error(`   cp ${backupPath} ${DB_PATH}`);
        
        throw error;
      }
    }
    
    console.log(`\n🎉 所有迁移执行完成！\n`);
    
  } catch (error) {
    console.error('❌ 自动迁移过程出错:', error);
    throw error;
  } finally {
    if (db) {
      db.close();
    }
  }
  
  return migrationsRun;
}

/**
 * 检查迁移状态（不执行）
 * @returns {Promise<object>} 迁移状态信息
 */
export async function checkMigrationStatus() {
  let db;
  
  try {
    db = new Database(DB_PATH);
    
    // 检查迁移表是否存在
    const tableExists = db.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='migrations'"
    ).get();
    
    if (!tableExists) {
      return {
        initialized: false,
        total: 0,
        executed: 0,
        pending: 0
      };
    }
    
    const executedMigrations = new Set(
      db.prepare('SELECT name FROM migrations ORDER BY name')
        .all()
        .map(row => row.name)
    );
    
    const allMigrationFiles = fs.readdirSync(MIGRATIONS_DIR)
      .filter(file => file.match(/^\d{8}_\d{6}_.*\.js$/) && 
                     file !== 'migrate.js' && 
                     file !== 'auto-migrate.js')
      .sort();
    
    const pendingMigrations = allMigrationFiles.filter(
      m => !executedMigrations.has(m)
    );
    
    return {
      initialized: true,
      total: allMigrationFiles.length,
      executed: executedMigrations.size,
      pending: pendingMigrations.length,
      pendingList: pendingMigrations
    };
    
  } finally {
    if (db) {
      db.close();
    }
  }
}
