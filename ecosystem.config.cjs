// PM2 进程管理配置文件
module.exports = {
  apps: [{
    name: 'teaching-system-api',
    script: './server/index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '200M',  // 超过 200MB 自动重启
    node_args: '--max-old-space-size=128',  // 限制 Node.js 堆内存为 128MB
    env: {
      NODE_ENV: 'production',
      PORT: 3002
    },
    env_development: {
      NODE_ENV: 'development',
      PORT: 3002,
      watch: true,  // 开发环境启用监听
      ignore_watch: ['node_modules', 'logs', 'dist', '.git'],
      watch_options: {
        followSymlinks: false
      }
    },
    error_file: './logs/error.log',
    out_file: './logs/output.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    merge_logs: true
  }]
};
