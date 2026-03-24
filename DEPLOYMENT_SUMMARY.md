# 部署总结

## 服务器信息
- **IP地址**: 192.168.184.128
- **SSH端口**: 22
- **用户名**: jiaok
- **密码**: jiaok
- **目标目录**: `/home/jiaok/hm-ai-video`

## 已修复的构建问题
在部署前，我们已修复以下Docker构建问题：

1. ✅ 移除了过时的 `SKIP_EXTERNAL_CHECK` 环境变量
2. ✅ 修复了 `useSession()` 在构建时的调用问题
3. ✅ 简化了Next.js配置
4. ✅ 优化了Docker多阶段构建

## 部署选项

### 选项1：SSH手动部署（最简单）
```bash
# 1. 连接到服务器
ssh jiaok@192.168.184.128
# 密码: jiaok

# 2. 创建目录并进入
mkdir -p ~/hm-ai-video
cd ~/hm-ai-video

# 3. 从本地机器上传文件（在本地终端执行）
# scp -r Dockerfile docker-compose.simple.yml clean-and-rebuild-docker.sh next.config.js package.json app/ components/ lib/ prisma/ store/ styles/ types/ jiaok@192.168.184.128:~/hm-ai-video/

# 4. 构建和启动（在服务器上执行）
chmod +x clean-and-rebuild-docker.sh
./clean-and-rebuild-docker.sh
docker-compose -f docker-compose.simple.yml up -d
```

### 选项2：使用部署脚本
```bash
# 方法A：使用sshpass（Linux/macOS）
chmod +x deploy-simple.sh
./deploy-simple.sh

# 方法B：使用PuTTY（Windows）
# 运行 deploy-without-sshpass.bat

# 方法C：一键部署
chmod +x deploy-package/deploy.sh
./deploy-package/deploy.sh
```

### 选项3：分步详细部署

#### 步骤1：准备服务器环境
```bash
# 安装Docker（如果未安装）
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# 安装Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 退出重新登录
exit
ssh jiaok@192.168.184.128
```

#### 步骤2：上传项目文件
从本地机器执行：
```bash
# 上传核心文件
scp Dockerfile docker-compose.simple.yml clean-and-rebuild-docker.sh jiaok@192.168.184.128:~/hm-ai-video/

# 上传配置和源代码
scp next.config.js package.json package-lock.json tsconfig.json tailwind.config.js jiaok@192.168.184.128:~/hm-ai-video/
scp -r app components lib prisma store styles types jiaok@192.168.184.128:~/hm-ai-video/
```

#### 步骤3：构建和运行
在服务器上执行：
```bash
cd ~/hm-ai-video
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
docker logs hm-ai-video-app

# 健康检查
curl http://localhost:3000/api/health
```

### 访问地址
- 🚀 **主应用**: http://192.168.184.128:3000
- 🗄️ **数据库管理**: http://192.168.184.128:5050
  - 用户名: `admin@ai-video.com`
  - 密码: `admin`
- 🔴 **Redis管理**: http://192.168.184.128:8081

## 环境配置

### 创建生产环境文件
```bash
cd ~/hm-ai-video
cp .env.production .env
nano .env  # 编辑配置文件
```

### 关键环境变量
```env
NEXTAUTH_SECRET=your-strong-random-secret-here
NEXTAUTH_URL=http://192.168.184.128:3000
DATABASE_URL=postgresql://postgres:postgres@db:5432/hm_ai_video
REDIS_URL=redis://redis:6379
```

## 故障排除

### 常见问题

1. **端口被占用**
   ```bash
   # 检查端口
   sudo netstat -tulpn | grep :3000
   
   # 修改docker-compose.simple.yml中的端口映射
   # 例如: "4000:3000"
   ```

2. **Docker构建失败**
   ```bash
   # 清理缓存
   docker system prune -a
   
   # 重新构建
   ./clean-and-rebuild-docker.sh
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
   docker logs -f hm-ai-video-app
   
   # 检查网络
   docker network inspect ai-video-network
   ```

### 管理命令
```bash
# 停止服务
docker-compose -f docker-compose.simple.yml down

# 重启服务
docker-compose -f docker-compose.simple.yml restart

# 查看实时日志
docker-compose -f docker-compose.simple.yml logs -f

# 进入容器
docker exec -it hm-ai-video-app sh

# 备份数据库
docker exec hm-ai-video-db pg_dump -U postgres hm_ai_video > backup_$(date +%Y%m%d).sql
```

## 文件说明

### 部署相关文件
- `deploy-simple.sh` - Linux/macOS自动部署脚本
- `deploy-without-sshpass.bat` - Windows部署脚本
- `deploy-package/` - 完整部署包
- `clean-and-rebuild-docker.sh` - Docker清理和构建脚本

### 配置和文档
- `DEPLOY_GUIDE.md` - 详细部署指南
- `QUICK_DEPLOY.md` - 快速部署指南
- `BUILD_FIXES.md` - 构建问题修复说明
- `.env.production` - 生产环境配置模板

## 后续步骤

1. ✅ **已修复所有构建问题**
2. 📦 **已创建部署脚本和指南**
3. 🚀 **可以开始部署到服务器**

### 开始部署
选择最适合你的部署方式，按照上述指南操作即可。

### 技术支持
如果遇到问题，请检查：
1. 服务器防火墙设置
2. Docker和Docker Compose版本
3. 查看容器日志：`docker logs [容器名]`
4. 参考 `BUILD_FIXES.md` 中的解决方案

---

**部署完成后，应用将在 http://192.168.184.128:3000 可用**