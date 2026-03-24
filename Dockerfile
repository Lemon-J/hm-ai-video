# 优化版 Dockerfile - 使用 Alpine 镜像 + 国内镜像源 + 加速配置
FROM node:20-alpine AS base

# 配置 Alpine 使用阿里云镜像源（国内加速）
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories

# 安装基础系统依赖
RUN apk add --no-cache \
    libc6-compat \
    curl \
    openssl \
    ca-certificates \
    bash

# 设置工作目录
WORKDIR /app

# 配置 npm 使用淘宝镜像（国内加速）
RUN npm config set registry https://registry.npmmirror.com

# 复制依赖文件
COPY package*.json ./
COPY prisma ./prisma/

# 安装依赖（添加超时设置和重试）
RUN npm install --verbose --timeout=300000 --fetch-retries=3

# 复制源代码
COPY . .

# 清理构建缓存
RUN rm -rf .next

# 构建应用 - 简化构建命令，移除过时配置
RUN DISABLE_FONT_OPTIMIZATION=true NODE_OPTIONS="--max-old-space-size=4096" npm run build

# 应用生产环境阶段
FROM node:20-alpine AS app-production

# 配置 Alpine 使用阿里云镜像源
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories

# 安装运行时依赖
RUN apk add --no-cache \
    libc6-compat \
    curl

WORKDIR /app

# 创建非 root 用户（安全考虑）
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 从 base 阶段复制文件
COPY --from=base /app/package*.json ./package*.json
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/.next ./.next
COPY --from=base /app/prisma ./prisma
COPY --from=base /app/lib ./lib
COPY --from=base /app/app ./app
COPY --from=base /app/components ./components
COPY --from=base /app/store ./store
COPY --from=base /app/types ./types
COPY --from=base /app/styles ./styles

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# 设置正确的文件权限
RUN chown -R nextjs:nodejs /app
RUN chmod -R 755 /app

# 切换到非 root 用户
USER nextjs

# 暴露端口
EXPOSE 3000

# 健康检查 - 使用 curl 替代 wget（更可靠）
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 CMD curl -f http://localhost:3000/api/health || exit 1

# 启动应用 - 在容器启动时生成 Prisma Client
CMD ["sh", "-c", "npx prisma generate && npm run start"]

# Worker 生产环境阶段
FROM node:20-alpine AS worker-production

# 配置 Alpine 使用阿里云镜像源
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories

# 安装运行时依赖
RUN apk add --no-cache \
    libc6-compat \
    curl

WORKDIR /app

# 创建非 root 用户（安全考虑）
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 从 base 阶段复制文件
COPY --from=base /app/package*.json ./package*.json
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/prisma ./prisma
COPY --from=base /app/lib ./lib
COPY --from=base /app/store ./store
COPY --from=base /app/types ./types

# 设置环境变量
ENV NODE_ENV=production

# 设置正确的文件权限
RUN chown -R nextjs:nodejs /app
RUN chmod -R 755 /app

# 切换到非 root 用户
USER nextjs

# 启动 Worker - 在容器启动时生成 Prisma Client
CMD ["sh", "-c", "npx prisma generate && npm run queue:worker"]

# 默认生产环境（兼容现有配置）
FROM app-production AS production