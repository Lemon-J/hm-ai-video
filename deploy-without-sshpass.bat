@echo off
REM Windows批处理部署脚本
REM 使用PuTTY工具进行SSH连接

set SERVER_IP=192.168.184.128
set SERVER_PORT=22
set SERVER_USER=jiaok
set SERVER_PASS=jiaok
set REMOTE_DIR=/home/jiaok/hm-ai-video

echo === 开始部署到服务器: %SERVER_IP% ===

REM 检查PuTTY工具是否可用
where plink >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo 错误：未找到PuTTY工具（plink）
    echo 请从 https://www.chiark.greenend.org.uk/~sgtatham/putty/latest.html 下载并添加到PATH
    pause
    exit /b 1
)

where pscp >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo 错误：未找到PuTTY SCP工具（pscp）
    pause
    exit /b 1
)

echo 1. 测试服务器连接...
echo y | plink -ssh -pw %SERVER_PASS% -P %SERVER_PORT% %SERVER_USER%@%SERVER_IP% "echo 连接成功"
if %ERRORLEVEL% neq 0 (
    echo 错误：无法连接到服务器
    pause
    exit /b 1
)

echo 2. 创建远程目录...
echo y | plink -ssh -pw %SERVER_PASS% -P %SERVER_PORT% %SERVER_USER%@%SERVER_IP% "mkdir -p %REMOTE_DIR% && cd %REMOTE_DIR% && echo 远程目录已创建"

echo 3. 上传部署文件...
for %%f in (Dockerfile docker-compose.simple.yml clean-and-rebuild-docker.sh next.config.js package.json package-lock.json tsconfig.json tailwind.config.js) do (
    echo   上传 %%~f...
    echo y | pscp -pw %SERVER_PASS% -P %SERVER_PORT% %%f %SERVER_USER%@%SERVER_IP%:%REMOTE_DIR%/
)

echo 4. 上传源代码目录...
REM 创建临时目录
set TEMP_DIR=%TEMP%\hm-ai-video-deploy
if exist "%TEMP_DIR%" rmdir /s /q "%TEMP_DIR%"
mkdir "%TEMP_DIR%"

REM 复制源代码
xcopy /E /I app "%TEMP_DIR%\app\"
xcopy /E /I components "%TEMP_DIR%\components\"
xcopy /E /I lib "%TEMP_DIR%\lib\"
xcopy /E /I prisma "%TEMP_DIR%\prisma\"
xcopy /E /I store "%TEMP_DIR%\store\"
xcopy /E /I styles "%TEMP_DIR%\styles\"
xcopy /E /I types "%TEMP_DIR%\types\"

REM 创建压缩文件
cd "%TEMP_DIR%"
tar -czf ..\hm-ai-video-src.tar.gz *
cd ..

echo   上传源代码压缩包...
echo y | pscp -pw %SERVER_PASS% -P %SERVER_PORT% "%TEMP%\hm-ai-video-src.tar.gz" %SERVER_USER%@%SERVER_IP%:%REMOTE_DIR%/

echo 5. 在服务器上执行部署...
plink -ssh -pw %SERVER_PASS% -P %SERVER_PORT% %SERVER_USER%@%SERVER_IP% -m deploy-commands.txt

echo.
echo === 部署完成 ===
echo 请访问 http://192.168.184.128:3000 查看应用
echo.
echo 常用命令:
echo   查看应用日志: plink -ssh -pw %SERVER_PASS% -P %SERVER_PORT% %SERVER_USER%@%SERVER_IP% "cd %REMOTE_DIR% && docker logs -f hm-ai-video-app"
echo   停止服务: plink -ssh -pw %SERVER_PASS% -P %SERVER_PORT% %SERVER_USER%@%SERVER_IP% "cd %REMOTE_DIR% && docker-compose -f docker-compose.simple.yml down"
echo   重启服务: plink -ssh -pw %SERVER_PASS% -P %SERVER_PORT% %SERVER_USER%@%SERVER_IP% "cd %REMOTE_DIR% && docker-compose -f docker-compose.simple.yml restart"

REM 清理临时文件
if exist "%TEMP_DIR%" rmdir /s /q "%TEMP_DIR%"
del "%TEMP%\hm-ai-video-src.tar.gz" 2>nul

pause