import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, 'data', 'teaching.db');

// 初始化数据库
const db = new Database(DB_PATH);

// 启用外键约束
db.pragma('foreign_keys = ON');

// 创建表结构
function initDatabase() {
  // 教师表
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

  // 学生表
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

  // 课程安排表
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

  // 系统配置表
  db.exec(`
    CREATE TABLE IF NOT EXISTS system_config (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    )
  `);

  // 插入版本信息
  const stmt = db.prepare(`
    INSERT OR IGNORE INTO system_config (key, value, updatedAt) 
    VALUES (?, ?, ?)
  `);
  stmt.run('version', '2.0.0', new Date().toISOString());

  console.log('✅ 数据库初始化完成');
}

// 教师操作
export const teacherDb = {
  // 获取所有教师
  getAll() {
    const teachers = db.prepare('SELECT * FROM teachers ORDER BY createdAt DESC').all();
    // 解析 subjects JSON 字符串
    return teachers.map(teacher => ({
      ...teacher,
      subjects: typeof teacher.subjects === 'string' ? JSON.parse(teacher.subjects) : teacher.subjects
    }));
  },

  // 根据ID获取教师
  getById(id) {
    const teacher = db.prepare('SELECT * FROM teachers WHERE id = ?').get(id);
    if (teacher && typeof teacher.subjects === 'string') {
      teacher.subjects = JSON.parse(teacher.subjects);
    }
    return teacher;
  },

  // 创建教师
  create(teacher) {
    const stmt = db.prepare(`
      INSERT INTO teachers (id, name, subjects, phone, email, notes, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const subjects = Array.isArray(teacher.subjects) ? JSON.stringify(teacher.subjects) : teacher.subjects;
    return stmt.run(
      teacher.id,
      teacher.name,
      subjects,
      teacher.phone || null,
      teacher.email || null,
      teacher.notes || null,
      teacher.createdAt,
      teacher.updatedAt
    );
  },

  // 更新教师
  update(id, teacher) {
    const stmt = db.prepare(`
      UPDATE teachers 
      SET name = ?, subjects = ?, phone = ?, email = ?, notes = ?, updatedAt = ?
      WHERE id = ?
    `);
    const subjects = Array.isArray(teacher.subjects) ? JSON.stringify(teacher.subjects) : teacher.subjects;
    return stmt.run(
      teacher.name,
      subjects,
      teacher.phone || null,
      teacher.email || null,
      teacher.notes || null,
      new Date().toISOString(),
      id
    );
  },

  // 删除教师
  delete(id) {
    return db.prepare('DELETE FROM teachers WHERE id = ?').run(id);
  }
};

// 学生操作
export const studentDb = {
  getAll() {
    return db.prepare('SELECT * FROM students ORDER BY createdAt DESC').all();
  },

  getById(id) {
    return db.prepare('SELECT * FROM students WHERE id = ?').get(id);
  },

  create(student) {
    const stmt = db.prepare(`
      INSERT INTO students (id, name, grade, phone, parentContact, ratePerClass, currency, teacherId, address, notes, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    return stmt.run(
      student.id,
      student.name,
      student.grade,
      student.phone || null,
      student.parentContact || null,
      student.ratePerClass || null,
      student.currency || 'CNY',
      student.teacherId || null,
      student.address || null,
      student.notes || null,
      student.createdAt,
      student.updatedAt
    );
  },

  update(id, student) {
    const stmt = db.prepare(`
      UPDATE students 
      SET name = ?, grade = ?, phone = ?, parentContact = ?, ratePerClass = ?, currency = ?, teacherId = ?, address = ?, notes = ?, updatedAt = ?
      WHERE id = ?
    `);
    return stmt.run(
      student.name,
      student.grade,
      student.phone || null,
      student.parentContact || null,
      student.ratePerClass || null,
      student.currency || 'CNY',
      student.teacherId || null,
      student.address || null,
      student.notes || null,
      new Date().toISOString(),
      id
    );
  },

  delete(id) {
    return db.prepare('DELETE FROM students WHERE id = ?').run(id);
  }
};

// 课程安排操作
export const scheduleDb = {
  getAll() {
    const schedules = db.prepare(`
      SELECT 
        s.*,
        t.name as teacherName
      FROM schedules s
      LEFT JOIN teachers t ON s.teacherId = t.id
      ORDER BY s.startTime DESC
    `).all();
    // 解析 studentIds JSON 字符串
    return schedules.map(schedule => ({
      ...schedule,
      studentIds: typeof schedule.studentIds === 'string' ? JSON.parse(schedule.studentIds) : schedule.studentIds
    }));
  },

  getById(id) {
    const schedule = db.prepare(`
      SELECT 
        s.*,
        t.name as teacherName
      FROM schedules s
      LEFT JOIN teachers t ON s.teacherId = t.id
      WHERE s.id = ?
    `).get(id);
    if (schedule && typeof schedule.studentIds === 'string') {
      schedule.studentIds = JSON.parse(schedule.studentIds);
    }
    return schedule;
  },

  getByDateRange(startDate, endDate) {
    const schedules = db.prepare(`
      SELECT 
        s.*,
        t.name as teacherName
      FROM schedules s
      LEFT JOIN teachers t ON s.teacherId = t.id
      WHERE s.startTime >= ? AND s.startTime <= ?
      ORDER BY s.startTime ASC
    `).all(startDate, endDate);
    // 解析 studentIds JSON 字符串
    return schedules.map(schedule => ({
      ...schedule,
      studentIds: typeof schedule.studentIds === 'string' ? JSON.parse(schedule.studentIds) : schedule.studentIds
    }));
  },

  create(schedule) {
    const stmt = db.prepare(`
      INSERT INTO schedules (id, teacherId, studentIds, subject, type, startTime, endTime, status, notes, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const studentIds = Array.isArray(schedule.studentIds) ? JSON.stringify(schedule.studentIds) : schedule.studentIds;
    return stmt.run(
      schedule.id,
      schedule.teacherId,
      studentIds,
      schedule.subject,
      schedule.type,
      schedule.startTime,
      schedule.endTime,
      schedule.status,
      schedule.notes || null,
      schedule.createdAt,
      schedule.updatedAt
    );
  },

  update(id, schedule) {
    const stmt = db.prepare(`
      UPDATE schedules 
      SET teacherId = ?, studentIds = ?, subject = ?, type = ?, startTime = ?, endTime = ?, 
          status = ?, notes = ?, updatedAt = ?
      WHERE id = ?
    `);
    const studentIds = Array.isArray(schedule.studentIds) ? JSON.stringify(schedule.studentIds) : schedule.studentIds;
    return stmt.run(
      schedule.teacherId,
      studentIds,
      schedule.subject,
      schedule.type,
      schedule.startTime,
      schedule.endTime,
      schedule.status,
      schedule.notes || null,
      new Date().toISOString(),
      id
    );
  },

  delete(id) {
    return db.prepare('DELETE FROM schedules WHERE id = ?').run(id);
  }
};

// 用户操作
export const userDb = {
  // 获取所有用户
  getAll() {
    return db.prepare('SELECT id, username, role, teacherId, createdAt, updatedAt FROM users ORDER BY createdAt DESC').all();
  },

  // 根据ID获取用户（不含密码）
  getById(id) {
    return db.prepare('SELECT id, username, role, teacherId, createdAt, updatedAt FROM users WHERE id = ?').get(id);
  },

  // 根据用户名获取用户（含密码，用于登录验证）
  getByUsername(username) {
    return db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  },

  // 创建用户
  create(user) {
    const stmt = db.prepare(`
      INSERT INTO users (id, username, password, role, teacherId, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    return stmt.run(
      user.id,
      user.username,
      user.password,
      user.role,
      user.teacherId || null,
      user.createdAt,
      user.updatedAt
    );
  },

  // 更新用户密码
  updatePassword(id, hashedPassword) {
    const stmt = db.prepare(`
      UPDATE users 
      SET password = ?, updatedAt = ?
      WHERE id = ?
    `);
    return stmt.run(hashedPassword, new Date().toISOString(), id);
  },

  // 更新用户信息（不包括密码）
  update(id, user) {
    const stmt = db.prepare(`
      UPDATE users 
      SET username = ?, teacherId = ?, updatedAt = ?
      WHERE id = ?
    `);
    return stmt.run(
      user.username,
      user.teacherId || null,
      new Date().toISOString(),
      id
    );
  },

  // 删除用户
  delete(id) {
    return db.prepare('DELETE FROM users WHERE id = ?').run(id);
  },

  // 检查用户名是否已存在
  usernameExists(username, excludeId = null) {
    if (excludeId) {
      const result = db.prepare('SELECT COUNT(*) as count FROM users WHERE username = ? AND id != ?').get(username, excludeId);
      return result.count > 0;
    } else {
      const result = db.prepare('SELECT COUNT(*) as count FROM users WHERE username = ?').get(username);
      return result.count > 0;
    }
  }
};

// 系统操作
export const systemDb = {
  getVersion() {
    const row = db.prepare('SELECT value FROM system_config WHERE key = ?').get('version');
    return row ? row.value : '1.0.0';
  },

  // 导出所有数据
  exportAll() {
    return {
      teachers: teacherDb.getAll(),
      students: studentDb.getAll(),
      schedules: scheduleDb.getAll(),
      version: this.getVersion()
    };
  },

  // 导入数据（从 JSON）
  importFromJson(data) {
    // 临时禁用外键约束以避免删除顺序问题
    // 注意：必须使用 exec() 而不是 pragma() 来在事务中生效
    db.exec('PRAGMA foreign_keys = OFF');

    const transaction = db.transaction(() => {
      // 清空现有数据（先删除有外键依赖的表）
      db.prepare('DELETE FROM schedules').run();
      db.prepare('DELETE FROM students').run();
      db.prepare('DELETE FROM teachers').run();

      // 导入教师
      if (data.teachers && Array.isArray(data.teachers)) {
        data.teachers.forEach(teacher => {
          teacherDb.create(teacher);
        });
      }

      // 导入学生
      if (data.students && Array.isArray(data.students)) {
        data.students.forEach(student => {
          studentDb.create(student);
        });
      }

      // 导入课程安排（验证外键）
      if (data.schedules && Array.isArray(data.schedules)) {
        const teacherIds = new Set(data.teachers?.map(t => t.id) || []);
        const studentIds = new Set(data.students?.map(s => s.id) || []);

        data.schedules.forEach(schedule => {
          // 验证教师ID存在
          if (!teacherIds.has(schedule.teacherId)) {
            console.warn(`⚠️  课程 ${schedule.id} 引用了不存在的教师 ${schedule.teacherId}，已跳过`);
            return;
          }

          // 验证学生ID存在
          const scheduleStudentIds = JSON.parse(schedule.studentIds || '[]');
          const validStudentIds = scheduleStudentIds.filter(sid => studentIds.has(sid));
          
          if (validStudentIds.length !== scheduleStudentIds.length) {
            console.warn(`⚠️  课程 ${schedule.id} 部分学生ID无效，已过滤`);
          }

          if (validStudentIds.length === 0) {
            console.warn(`⚠️  课程 ${schedule.id} 没有有效的学生，已跳过`);
            return;
          }

          // 创建课程（使用过滤后的学生ID）
          scheduleDb.create({
            ...schedule,
            studentIds: JSON.stringify(validStudentIds)
          });
        });
      }
    });

    try {
      transaction();
      // 重新启用外键约束
      db.exec('PRAGMA foreign_keys = ON');
    } catch (error) {
      // 出错时也要恢复外键约束
      db.exec('PRAGMA foreign_keys = ON');
      throw error;
    }
  }
};

// 初始化数据库
initDatabase();

// 优雅关闭
process.on('exit', () => db.close());
process.on('SIGINT', () => {
  db.close();
  process.exit(0);
});

export default db;
