#!/bin/bash

echo "正在清理 Docker 构建缓存并重新构建..."

# 清理 Docker 构建缓存
echo "1. 清理 Docker 构建缓存..."
docker builder prune -f
docker system prune -f

# 停止并删除现有容器
echo "2. 停止并删除现有容器..."
docker-compose -f docker-compose.simple.yml down --remove-orphans

# 删除旧镜像
echo "3. 删除旧镜像..."
docker rmi $(docker images "hm-ai-video-*" -q) 2>/dev/null || true

# 重新构建
echo "4. 重新构建应用..."
docker-compose -f docker-compose.simple.yml build --no-cache

echo "构建完成！可以使用以下命令启动应用："
echo "docker-compose -f docker-compose.simple.yml up -d"