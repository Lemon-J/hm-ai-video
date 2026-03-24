#!/bin/bash

# 简单远程部署脚本
# 使用SSH直接执行命令

SERVER_IP="192.168.184.128"
SERVER_PORT="22"
SERVER_USER="jiaok"
SERVER_PASS="jiaok"
REMOTE_DIR="/home/jiaok/hm-ai-video"

echo "=== 开始部署到服务器: $SERVER_IP ==="

# 1. 检查服务器连接
echo "1. 测试服务器连接..."
sshpass -p "$SERVER_PASS" ssh -p "$SERVER_PORT" \
    -o StrictHostKeyChecking=no \
    -o ConnectTimeout=10 \
    "$SERVER_USER@$SERVER_IP" "echo '连接成功'"

if [ $? -ne 0 ]; then
    echo "错误：无法连接到服务器"
    exit 1
fi

# 2. 创建远程目录
echo "2. 创建远程目录..."
sshpass -p "$SERVER_PASS" ssh -p "$SERVER_PORT" \
    -o StrictHostKeyChecking=no \
    "$SERVER_USER@$SERVER_IP" "
    mkdir -p $REMOTE_DIR
    cd $REMOTE_DIR
    echo '远程目录已创建'
"

# 3. 上传必要文件
echo "3. 上传部署文件..."

# 上传Docker相关文件
for file in Dockerfile docker-compose.simple.yml clean-and-rebuild-docker.sh; do
    echo "  上传 $file..."
    sshpass -p "$SERVER_PASS" scp -P "$SERVER_PORT" \
        -o StrictHostKeyChecking=no \
        "$file" "$SERVER_USER@$SERVER_IP:$REMOTE_DIR/"
done

# 上传配置文件
for file in next.config.js package.json package-lock.json tsconfig.json tailwind.config.js; do
    echo "  上传 $file..."
    sshpass -p "$SERVER_PASS" scp -P "$SERVER_PORT" \
        -o StrictHostKeyChecking=no \
        "$file" "$SERVER_USER@$SERVER_IP:$REMOTE_DIR/"
done

# 4. 上传源代码目录（排除不需要的文件）
echo "4. 上传源代码目录..."

# 创建临时目录并复制源代码
TEMP_DIR=$(mktemp -d)
cp -r app components lib prisma store styles types "$TEMP_DIR/"
# 移除不需要的文件
find "$TEMP_DIR" -name "*.log" -delete
find "$TEMP_DIR" -name "*.tmp" -delete

# 打包并上传
tar -czf "$TEMP_DIR/src.tar.gz" -C "$TEMP_DIR" .
sshpass -p "$SERVER_PASS" scp -P "$SERVER_PORT" \
    -o StrictHostKeyChecking=no \
    "$TEMP_DIR/src.tar.gz" "$SERVER_USER@$SERVER_IP:$REMOTE_DIR/"

# 5. 在服务器上执行部署
echo "5. 在服务器上执行部署..."
sshpass -p "$SERVER_PASS" ssh -p "$SERVER_PORT" \
    -o StrictHostKeyChecking=no \
    "$SERVER_USER@$SERVER_IP" << 'ENDSSH'
    
    cd /home/jiaok/hm-ai-video
    
    echo "  解压源代码..."
    tar -xzf src.tar.gz
    rm -f src.tar.gz
    
    echo "  检查Docker和Docker Compose..."
    if ! command -v docker &> /dev/null; then
        echo "错误：Docker未安装"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        echo "警告：docker-compose未安装，尝试安装..."
        sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        sudo chmod +x /usr/local/bin/docker-compose
    fi
    
    echo "  停止现有服务..."
    docker-compose -f docker-compose.simple.yml down 2>/dev/null || true
    
    echo "  清理旧镜像..."
    docker rmi -f hm-ai-video-app hm-ai-video-worker 2>/dev/null || true
    
    echo "  构建新镜像..."
    ./clean-and-rebuild-docker.sh
    
    echo "  启动服务..."
    docker-compose -f docker-compose.simple.yml up -d
    
    echo "  等待服务启动..."
    sleep 10
    
    echo "  检查服务状态..."
    echo ""
    echo "=== 容器状态 ==="
    docker ps --filter "name=hm-ai-video" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    
    echo ""
    echo "=== 应用日志（最后10行）==="
    docker logs --tail 10 hm-ai-video-app 2>/dev/null || echo "应用容器日志不可用"
    
    echo ""
    echo "=== 部署完成 ==="
    echo "应用地址: http://192.168.184.128:3000"
    echo "数据库管理: http://192.168.184.128:5050 (用户名: admin@ai-video.com, 密码: admin)"
    echo "Redis管理: http://192.168.184.128:8081"
ENDSSH

# 6. 清理临时文件
rm -rf "$TEMP_DIR"

echo ""
echo "=== 本地部署完成 ==="
echo "请访问 http://192.168.184.128:3000 查看应用"
echo ""
echo "常用命令:"
echo "  查看应用日志: ssh $SERVER_USER@$SERVER_IP 'cd $REMOTE_DIR && docker logs -f hm-ai-video-app'"
echo "  停止服务: ssh $SERVER_USER@$SERVER_IP 'cd $REMOTE_DIR && docker-compose -f docker-compose.simple.yml down'"
echo "  重启服务: ssh $SERVER_USER@$SERVER_IP 'cd $REMOTE_DIR && docker-compose -f docker-compose.simple.yml restart'"
echo "  查看所有容器: ssh $SERVER_USER@$SERVER_IP 'docker ps -a'"