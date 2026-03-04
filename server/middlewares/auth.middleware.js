/**
 * 认证中间件 - 要求用户已登录
 */
export function requireAuth(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({
      success: false,
      message: '请先登录'
    });
  }
  next();
}

/**
 * Admin 权限中间件 - 要求用户角色为 admin
 */
export function requireAdmin(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({
      success: false,
      message: '请先登录'
    });
  }

  if (req.session.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: '无权限执行此操作，需要管理员权限'
    });
  }

  next();
}

/**
 * 教师权限中间件 - 要求用户角色为 teacher
 */
export function requireTeacher(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({
      success: false,
      message: '请先登录'
    });
  }

  if (req.session.role !== 'teacher') {
    return res.status(403).json({
      success: false,
      message: '无权限执行此操作，需要教师权限'
    });
  }

  next();
}

/**
 * 教师自我权限中间件 - 教师只能访问自己的数据
 * 通过 URL 参数中的 teacherId 进行验证
 */
export function requireSelfTeacher(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({
      success: false,
      message: '请先登录'
    });
  }

  const { role, teacherId: sessionTeacherId } = req.session;
  
  // Admin 可以访问所有教师数据
  if (role === 'admin') {
    return next();
  }

  // 教师只能访问自己的数据
  if (role === 'teacher') {
    const requestedTeacherId = req.params.teacherId || req.body.teacherId || req.query.teacherId;
    
    if (requestedTeacherId && requestedTeacherId !== sessionTeacherId) {
      return res.status(403).json({
        success: false,
        message: '无权限访问其他教师的数据'
      });
    }
    
    // 将当前教师ID附加到请求对象，方便后续使用
    req.currentTeacherId = sessionTeacherId;
    return next();
  }

  res.status(403).json({
    success: false,
    message: '无权限执行此操作'
  });
}

/**
 * Admin 或教师自己 - 教师可以修改自己的信息，Admin 可以修改所有
 */
export function requireAdminOrSelf(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({
      success: false,
      message: '请先登录'
    });
  }

  const { role, userId: sessionUserId } = req.session;
  const requestedUserId = req.params.id || req.params.userId;

  // Admin 可以操作所有用户
  if (role === 'admin') {
    return next();
  }

  // 用户只能操作自己的账号
  if (requestedUserId === sessionUserId) {
    return next();
  }

  res.status(403).json({
    success: false,
    message: '无权限执行此操作'
  });
}
