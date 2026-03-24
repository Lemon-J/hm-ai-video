# 快速部署指南

## 服务器信息
- IP: 192.168.184.128
- 用户: jiaok
- 密码: jiaok
- 端口: 22

## 简单部署步骤

### 1. 连接到服务器
打开终端或命令提示符，执行：
```bash
ssh jiaok@192.168.184.128
# 输入密码: jiaok
```

### 2. 在服务器上执行以下命令

```bash
# 1. 创建项目目录
mkdir -p ~/hm-ai-video
cd ~/hm-ai-video

# 2. 下载部署脚本
curl -O https://raw.githubusercontent.com/your-repo/hm-ai-video/main/deploy-simple.sh
chmod +x deploy-simple.sh

# 3. 运行部署（如果使用sshpass）
# ./deploy-simple.sh

# 或者手动执行：
```

### 3. 手动部署命令

```bash
# 在服务器上执行
cd ~/hm-ai-video

# 安装Docker（如果未安装）
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# 安装Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 重新登录使Docker组生效
exit
ssh jiaok@192.168.184.128

# 继续部署
cd ~/hm-ai-video

# 从本地复制文件（在本地机器执行）
# scp -r * jiaok@192.168.184.128:~/hm-ai-video/

# 构建和启动
docker-compose -f docker-compose.simple.yml build
docker-compose -f docker-compose.simple.yml up -d

# 查看状态
docker ps
```

## 最简部署方法

如果你已经将文件上传到服务器，只需执行：

```bash
# 在服务器上执行
cd ~/hm-ai-video
chmod +x clean-and-rebuild-docker.sh
./clean-and-rebuild-docker.sh
docker-compose -f docker-compose.simple.yml up -d
```

## 检查部署

```bash
# 查看容器状态
docker ps

# 查看应用日志
docker logs hm-ai-video-app

# 测试应用
curl http://localhost:3000/api/health
```

## 访问地址
- 应用: http://192.168.184.128:3000
- 有问题请检查防火墙和端口设置