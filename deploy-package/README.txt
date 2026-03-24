# HM-AI-Video 部署包

## 包含文件
1. Dockerfile - Docker构建文件
2. docker-compose.simple.yml - Docker Compose配置
3. clean-and-rebuild-docker.sh - 清理和重建脚本
4. 所有源代码文件

## 部署步骤

### 方法一：自动部署（推荐）
1. 将整个deploy-package目录上传到服务器
2. 在服务器上执行：
   ```bash
   cd /path/to/deploy-package
   chmod +x deploy.sh
   ./deploy.sh
   ```

### 方法二：手动部署
1. 将文件复制到服务器：`/home/jiaok/hm-ai-video/`
2. 执行：
   ```bash
   cd /home/jiaok/hm-ai-video
   chmod +x clean-and-rebuild-docker.sh
   ./clean-and-rebuild-docker.sh
   docker-compose -f docker-compose.simple.yml up -d
   ```

### 方法三：分步部署
```bash
# 1. 上传文件到服务器
scp -r * jiaok@192.168.184.128:~/hm-ai-video/

# 2. SSH连接到服务器
ssh jiaok@192.168.184.128

# 3. 进入目录
cd ~/hm-ai-video

# 4. 构建和启动
./clean-and-rebuild-docker.sh
docker-compose -f docker-compose.simple.yml up -d
```

## 服务器要求
- Docker 20.10+
- Docker Compose 2.20+
- 至少4GB内存
- 10GB可用磁盘空间

## 访问地址
- 应用: http://192.168.184.128:3000
- 数据库管理: http://192.168.184.128:5050
- Redis管理: http://192.168.184.128:8081

## 技术支持
如有问题，请检查：
1. 防火墙是否开放3000、5432、6379端口
2. Docker服务是否运行：`sudo systemctl status docker`
3. 容器日志：`docker logs hm-ai-video-app`