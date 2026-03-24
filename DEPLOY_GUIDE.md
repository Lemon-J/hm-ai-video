# 远程部署指南

## 服务器信息
- IP地址: `192.168.184.128`
- 端口: `22`
- 用户名: `jiaok`
- 密码: `jiaok`
- 目标目录: `/home/jiaok/hm-ai-video`

## 方法一：使用SSH手动部署（推荐）

### 步骤1：连接到服务器
```bash
ssh jiaok@192.168.184.128
# 密码: jiaok
```

### 步骤2：在服务器上创建目录
```bash
mkdir -p /home/jiaok/hm-ai-video
cd /home/jiaok/hm-ai-video
```

### 步骤3：上传文件（从本地机器）
在本地机器上，使用以下命令上传文件：

```bash
# 上传核心文件
scp Dockerfile docker-compose.simple.yml clean-and-rebuild-docker.sh jiaok@192.168.184.128:/home/jiaok/hm-ai-video/

# 上传配置文件
scp next.config.js package.json package-lock.json tsconfig.json tailwind.config.js jiaok@192.168.184.128:/home/jiaok/hm-ai-video/

# 上传源代码目录
scp -r app components lib prisma store styles types jiaok@192.168.184.128:/home/jiaok/hm-ai-video/
```

### 步骤4：在服务器上执行部署
```bash
# 1. 进入目录
cd /home/jiaok/hm-ai-video

# 2. 检查Docker是否安装
docker --version
docker-compose --version

# 如果未安装Docker Compose:
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 3. 停止现有服务（如果有）
docker-compose -f docker-compose.simple.yml down

# 4. 构建镜像
chmod +x clean-and-rebuild-docker.sh
./clean-and-rebuild-docker.sh

# 5. 启动服务
docker-compose -f docker-compose.simple.yml up -d

# 6. 检查状态
docker ps --filter "name=hm-ai-video"
```

## 方法二：使用自动化脚本

### Windows用户
1. 下载PuTTY工具: https://www.chiark.greenend.org.uk/~sgtatham/putty/latest.html
2. 将`plink.exe`和`pscp.exe`添加到PATH环境变量
3. 运行: `deploy-without-sshpass.bat`

### Linux/macOS用户
1. 安装sshpass: `sudo apt-get install sshpass` (Ubuntu) 或 `brew install sshpass` (macOS)
2. 运行: `chmod +x deploy-simple.sh && ./deploy-simple.sh`

## 方法三：使用Git直接部署

### 步骤1：在服务器上克隆仓库
```bash
ssh jiaok@192.168.184.128
cd /home/jiaok
git clone <你的仓库地址> hm-ai-video
cd hm-ai-video
```

### 步骤2：构建和启动
```bash
chmod +x clean-and-rebuild-docker.sh
./clean-and-rebuild-docker.sh
docker-compose -f docker-compose.simple.yml up -d
```

## 验证部署

### 检查服务状态
```bash
# 查看所有容器
docker ps -a

# 查看应用日志
docker logs -f hm-ai-video-app

# 查看特定容器状态
docker-compose -f docker-compose.simple.yml ps
```

### 访问应用
- 主应用: http://192.168.184.128:3000
- 数据库管理: http://192.168.184.128:5050
  - 用户名: `admin@ai-video.com`
  - 密码: `admin`
- Redis管理: http://192.168.184.128:8081

## 环境配置

### 创建环境文件
在服务器上创建 `.env` 文件：
```bash
cd /home/jiaok/hm-ai-video
cp .env.production .env
# 编辑 .env 文件，填写实际配置值
nano .env
```

### 重要环境变量
```bash
NEXTAUTH_SECRET=你的随机密钥
NEXTAUTH_URL=http://192.168.184.128:3000
DATABASE_URL=postgresql://postgres:postgres@db:5432/hm_ai_video
REDIS_URL=redis://redis:6379
```

## 故障排除

### 常见问题

1. **Docker构建失败**
   ```bash
   # 清理缓存重新构建
   docker system prune -a
   ./clean-and-rebuild-docker.sh
   ```

2. **端口冲突**
   ```bash
   # 检查端口占用
   sudo netstat -tulpn | grep :3000
   
   # 修改docker-compose.simple.yml中的端口映射
   ```

3. **数据库连接失败**
   ```bash
   # 检查数据库容器
   docker logs hm-ai-video-db
   
   # 重启数据库
   docker-compose -f docker-compose.simple.yml restart db
   ```

4. **应用无法访问**
   ```bash
   # 检查应用日志
   docker logs hm-ai-video-app
   
   # 检查网络
   docker network ls
   docker network inspect ai-video-network
   ```

### 管理命令

```bash
# 停止所有服务
docker-compose -f docker-compose.simple.yml down

# 重启服务
docker-compose -f docker-compose.simple.yml restart

# 查看日志
docker-compose -f docker-compose.simple.yml logs -f

# 进入容器
docker exec -it hm-ai-video-app sh

# 备份数据库
docker exec hm-ai-video-db pg_dump -U postgres hm_ai_video > backup.sql
```

## 安全建议

1. **修改默认密码**
   - 修改PostgreSQL密码
   - 修改pgAdmin密码
   - 生成强密码的NEXTAUTH_SECRET

2. **配置防火墙**
   ```bash
   # 只允许必要端口
   sudo ufw allow 22/tcp
   sudo ufw allow 3000/tcp
   sudo ufw enable
   ```

3. **使用SSL证书**
   - 配置HTTPS访问
   - 使用Let's Encrypt免费证书

4. **定期更新**
   ```bash
   # 更新Docker镜像
   docker-compose -f docker-compose.simple.yml pull
   docker-compose -f docker-compose.simple.yml up -d
   
   # 更新系统
   sudo apt update && sudo apt upgrade
   ```