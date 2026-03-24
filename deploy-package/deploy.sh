#!/bin/bash

echo "=== HM-AI-Video 一键部署脚本 ==="
echo "服务器: 192.168.184.128"
echo "用户: jiaok"
echo ""

# 检查当前目录
if [ ! -f "Dockerfile" ]; then
    echo "错误：请在项目根目录运行此脚本"
    exit 1
fi

# 检查是否在服务器上
IS_SERVER=false
if [ "$(hostname)" != "DESKTOP-"* ] && [ "$(uname)" != "MINGW"* ]; then
    IS_SERVER=true
fi

if [ "$IS_SERVER" = true ]; then
    echo "检测到在服务器上运行"
    echo ""
    
    # 执行服务器端部署
    ./clean-and-rebuild-docker.sh
    docker-compose -f docker-compose.simple.yml up -d
    
    echo ""
    echo "部署完成！"
    echo "应用地址: http://localhost:3000"
    echo ""
    echo "查看状态: docker ps"
    echo "查看日志: docker logs hm-ai-video-app"
    
else
    echo "检测到在本地机器上运行"
    echo ""
    
    # 询问是否上传到服务器
    read -p "是否上传到服务器 192.168.184.128？(y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "取消部署"
        exit 0
    fi
    
    # 上传文件到服务器
    echo "上传文件到服务器..."
    
    # 创建临时目录
    TEMP_DIR=$(mktemp -d)
    cp -r . "$TEMP_DIR/"
    
    # 移除不需要的文件
    cd "$TEMP_DIR"
    rm -rf .git .next node_modules *.log *.tmp deploy-package
    
    # 上传到服务器
    echo "正在上传，请输入密码: jiaok"
    scp -r . jiaok@192.168.184.128:~/hm-ai-video/
    
    if [ $? -eq 0 ]; then
        echo "上传成功！"
        echo ""
        echo "请在服务器上执行以下命令："
        echo "1. ssh jiaok@192.168.184.128"
        echo "2. cd ~/hm-ai-video"
        echo "3. chmod +x clean-and-rebuild-docker.sh"
        echo "4. ./clean-and-rebuild-docker.sh"
        echo "5. docker-compose -f docker-compose.simple.yml up -d"
        echo ""
        echo "或直接执行："
        echo "ssh jiaok@192.168.184.128 'cd ~/hm-ai-video && chmod +x clean-and-rebuild-docker.sh && ./clean-and-rebuild-docker.sh && docker-compose -f docker-compose.simple.yml up -d'"
    else
        echo "上传失败"
        exit 1
    fi
    
    # 清理临时目录
    rm -rf "$TEMP_DIR"
fi

echo ""
echo "=== 部署指南结束 ==="