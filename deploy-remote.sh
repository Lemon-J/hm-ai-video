#!/bin/bash

# 远程部署脚本
# 使用方式: ./deploy-remote.sh

# 服务器配置
SERVER_IP="192.168.184.128"
SERVER_PORT="22"
SERVER_USER="jiaok"
SERVER_PASSWORD="jiaok"
REMOTE_DIR="/home/jiaok/hm-ai-video"

echo "开始远程部署到服务器: $SERVER_IP"

# 1. 检查本地是否有未提交的更改
echo "1. 检查本地更改..."
if [[ -n $(git status --porcelain) ]]; then
    echo "  警告：本地有未提交的更改"
    read -p "  是否继续部署？(y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "  部署已取消"
        exit 1
    fi
fi

# 2. 打包项目文件（排除不需要的文件）
echo "2. 打包项目文件..."
TEMP_DIR=$(mktemp -d)
DEPLOY_ARCHIVE="$TEMP_DIR/hm-ai-video-deploy.tar.gz"

# 创建要打包的文件列表
cat > "$TEMP_DIR/deploy-files.txt" << EOF
Dockerfile
docker-compose.simple.yml
clean-and-rebuild-docker.sh
next.config.js
package.json
package-lock.json
tsconfig.json
tailwind.config.js
components.json
README.md
app/
components/
lib/
prisma/
store/
styles/
types/
EOF

# 打包文件
tar -czf "$DEPLOY_ARCHIVE" \
    --exclude=.git \
    --exclude=node_modules \
    --exclude=.next \
    --exclude=*.log \
    --exclude=*.tmp \
    -T "$TEMP_DIR/deploy-files.txt"

echo "  打包完成: $(du -h "$DEPLOY_ARCHIVE" | cut -f1)"

# 3. 上传到服务器
echo "3. 上传到服务器..."
sshpass -p "$SERVER_PASSWORD" scp -P "$SERVER_PORT" \
    -o StrictHostKeyChecking=no \
    -o UserKnownHostsFile=/dev/null \
    "$DEPLOY_ARCHIVE" \
    "$SERVER_USER@$SERVER_IP:$REMOTE_DIR/"

if [ $? -ne 0 ]; then
    echo "  上传失败"
    rm -rf "$TEMP_DIR"
    exit 1
fi

echo "  上传成功"

# 4. 在服务器上执行部署
echo "4. 在服务器上执行部署..."
sshpass -p "$SERVER_PASSWORD" ssh -p "$SERVER_PORT" \
    -o StrictHostKeyChecking=no \
    -o UserKnownHostsFile=/dev/null \
    "$SERVER_USER@$SERVER_IP" << 'EOF'
    
    cd /home/jiaok/hm-ai-video
    
    echo "  解压文件..."
    tar -xzf hm-ai-video-deploy.tar.gz
    
    echo "  安装依赖和构建..."
    ./clean-and-rebuild-docker.sh
    
    echo "  启动应用..."
    docker-compose -f docker-compose.simple.yml up -d
    
    echo "  检查容器状态..."
    docker ps --filter "name=hm-ai-video" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    
    echo "  应用部署完成！"
    echo "  访问地址: http://192.168.184.128:3000"
EOF

# 5. 清理临时文件
echo "5. 清理临时文件..."
rm -rf "$TEMP_DIR"

echo "部署完成！"
echo "应用地址: http://192.168.184.128:3000"
echo "数据库管理: http://192.168.184.128:5050 (用户名: admin@ai-video.com, 密码: admin)"
echo "Redis管理: http://192.168.184.128:8081"