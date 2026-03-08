import session from 'express-session';
import SQLiteStore from 'connect-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SQLiteStoreSession = SQLiteStore(session);

// Session 配置
export function createSessionMiddleware() {
  return session({
    store: new SQLiteStoreSession({
      db: 'sessions.db',
      dir: path.join(__dirname, '..', 'data')
    }),
    secret: process.env.SESSION_SECRET || 'teaching-system-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // 如果使用 HTTPS，设置为 true
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 默认30天
    },
    name: 'teaching.sid'
  });
}

/**
 * 更新 session cookie 过期时间
 * @param {Object} req Express request 对象
 * @param {boolean} rememberMe 是否记住登录状态
 */
export function updateSessionExpiry(req, rememberMe) {
  if (rememberMe) {
    // 记住我：30天
    req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000;
  } else {
    // 不记住：浏览器关闭即失效
    req.session.cookie.maxAge = null;
  }
}
