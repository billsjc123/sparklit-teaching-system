import express from 'express';
import { requireAuth, requireSelfTeacher } from '../middlewares/auth.middleware.js';
import { scheduleDb, studentDb } from '../database.js';

const router = express.Router();

/**
 * 获取教师费用统计
 * GET /api/stats/teacher/:teacherId
 */
router.get('/teacher/:teacherId', requireAuth, requireSelfTeacher, (req, res) => {
  try {
    const { teacherId } = req.params;
    const { startDate, endDate } = req.query;

    // 获取教师的所有课程
    let schedules = scheduleDb.getAll().filter(s => s.teacherId === teacherId);

    // 如果提供了日期范围，进行过滤
    if (startDate && endDate) {
      schedules = schedules.filter(s => {
        return s.startTime >= startDate && s.startTime <= endDate;
      });
    }

    // 计算费用统计
    let totalIncome = 0;
    let completedIncome = 0;
    let pendingIncome = 0;
    let completedCount = 0;
    let pendingCount = 0;

    const detailedSchedules = schedules.map(schedule => {
      // 解析学生IDs
      const studentIds = typeof schedule.studentIds === 'string' 
        ? JSON.parse(schedule.studentIds) 
        : schedule.studentIds;

      // 计算课程费用
      let scheduleFee = 0;
      const students = studentIds.map(studentId => {
        const student = studentDb.getById(studentId);
        if (student && student.ratePerClass) {
          scheduleFee += student.ratePerClass;
        }
        return student;
      });

      // 统计费用
      totalIncome += scheduleFee;
      if (schedule.status === 'completed') {
        completedIncome += scheduleFee;
        completedCount++;
      } else {
        pendingIncome += scheduleFee;
        pendingCount++;
      }

      return {
        ...schedule,
        students,
        fee: scheduleFee
      };
    });

    res.json({
      success: true,
      stats: {
        totalIncome,
        completedIncome,
        pendingIncome,
        completedCount,
        pendingCount,
        totalCount: schedules.length
      },
      schedules: detailedSchedules
    });
  } catch (error) {
    console.error('获取费用统计失败:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * 获取整体统计数据（Admin only）
 * GET /api/stats/overview
 */
router.get('/overview', requireAuth, (req, res) => {
  try {
    // 只有 admin 可以查看整体统计
    if (req.session.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '无权限查看整体统计'
      });
    }

    const { startDate, endDate } = req.query;
    
    let schedules = scheduleDb.getAll();

    // 如果提供了日期范围，进行过滤
    if (startDate && endDate) {
      schedules = schedules.filter(s => {
        return s.startTime >= startDate && s.startTime <= endDate;
      });
    }

    // 计算整体费用统计
    let totalIncome = 0;
    let completedIncome = 0;
    let pendingIncome = 0;
    let completedCount = 0;
    let pendingCount = 0;

    schedules.forEach(schedule => {
      // 解析学生IDs
      const studentIds = typeof schedule.studentIds === 'string' 
        ? JSON.parse(schedule.studentIds) 
        : schedule.studentIds;

      // 计算课程费用
      let scheduleFee = 0;
      studentIds.forEach(studentId => {
        const student = studentDb.getById(studentId);
        if (student && student.ratePerClass) {
          scheduleFee += student.ratePerClass;
        }
      });

      // 统计费用
      totalIncome += scheduleFee;
      if (schedule.status === 'completed') {
        completedIncome += scheduleFee;
        completedCount++;
      } else {
        pendingIncome += scheduleFee;
        pendingCount++;
      }
    });

    res.json({
      success: true,
      stats: {
        totalIncome,
        completedIncome,
        pendingIncome,
        completedCount,
        pendingCount,
        totalCount: schedules.length
      }
    });
  } catch (error) {
    console.error('获取整体统计失败:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

export default router;
