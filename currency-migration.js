/**
 * 币种字段数据迁移脚本
 * 为所有现有学生添加默认币种字段（人民币）
 */

const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'server', 'data', 'data.json');

function migrateData() {
  console.log('🔄 开始数据迁移...\n');

  // 读取现有数据
  if (!fs.existsSync(DATA_FILE)) {
    console.log('❌ 数据文件不存在:', DATA_FILE);
    return;
  }

  const rawData = fs.readFileSync(DATA_FILE, 'utf8');
  const data = JSON.parse(rawData);

  console.log(`📊 当前学生数量: ${data.students?.length || 0}`);

  // 检查是否需要迁移
  let needsMigration = false;
  if (data.students && data.students.length > 0) {
    const studentsWithoutCurrency = data.students.filter(s => !s.currency);
    needsMigration = studentsWithoutCurrency.length > 0;
    console.log(`⚠️  需要迁移的学生数量: ${studentsWithoutCurrency.length}\n`);
  }

  if (!needsMigration) {
    console.log('✅ 所有学生已有币种字段，无需迁移');
    return;
  }

  // 备份原始数据
  const backupFile = DATA_FILE.replace('.json', `.backup-${Date.now()}.json`);
  fs.writeFileSync(backupFile, rawData, 'utf8');
  console.log(`💾 原始数据已备份到: ${backupFile}\n`);

  // 为没有 currency 字段的学生添加默认值
  let migratedCount = 0;
  data.students = data.students.map(student => {
    if (!student.currency) {
      migratedCount++;
      console.log(`  ✓ ${student.name} - 添加币种: 人民币 (CNY)`);
      return {
        ...student,
        currency: 'CNY' // 默认为人民币
      };
    }
    return student;
  });

  // 保存更新后的数据
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
  
  console.log(`\n✅ 数据迁移完成！`);
  console.log(`   - 迁移学生数: ${migratedCount}`);
  console.log(`   - 总学生数: ${data.students.length}`);
  console.log(`   - 数据文件: ${DATA_FILE}`);
  console.log(`   - 备份文件: ${backupFile}\n`);
}

// 执行迁移
try {
  migrateData();
} catch (error) {
  console.error('❌ 迁移失败:', error.message);
  process.exit(1);
}
