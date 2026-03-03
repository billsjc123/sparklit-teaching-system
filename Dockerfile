# 多阶段构建 Dockerfile for Teaching System
FROM node:18-alpine AS builder

# 设置工作目录
WORKDIR /app

# 复制 package 文件
COPY package*.json ./

# 安装所有依赖（包括开发依赖）
RUN npm ci

# 复制源代码
COPY . .

# 构建前端
RUN npm run build

# 生产阶段
FROM node:18-alpine

# 安装 SQLite（如果需要）
RUN apk add --no-cache sqlite

WORKDIR /app

# 复制 package 文件
COPY package*.json ./

# 只安装生产依赖
RUN npm ci --production

# 从构建阶段复制构建产物
COPY --from=builder /app/dist ./dist

# 复制服务器代码
COPY server ./server

# 创建数据目录
RUN mkdir -p server/data && \
    chmod 755 server/data

# 暴露端口
EXPOSE 3002

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=3002

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3002/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# 启动应用
CMD ["node", "server/index.js"]
