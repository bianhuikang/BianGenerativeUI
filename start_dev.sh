#!/bin/bash

# 清理环境
echo "🔧 清理环境..."
deactivate 2>/dev/null || true
unset VIRTUAL_ENV 2>/dev/null || true

# 杀死可能残留的进程
echo "🔪 停止残留进程..."
pkill -9 -f "uvicorn\|tsx\|next" 2>/dev/null || true
sleep 2

# 检查端口
echo "📡 检查端口状态..."
for port in 8123 3100 3000; do
    if nc -z localhost $port 2>/dev/null; then
        echo "  ⚠️  端口 $port 被占用，尝试释放..."
        lsof -ti:$port 2>/dev/null | xargs kill -9 2>/dev/null || true
    else
        echo "  ✅ 端口 $port 空闲"
    fi
done

# 等待一下确保端口释放
sleep 3

# 使用国内镜像源启动
echo "🚀 启动OpenGenerativeUI服务..."
echo "   使用清华镜像源: https://pypi.tuna.tsinghua.edu.cn/simple"

# 设置环境变量并使用make启动
UV_INDEX_URL=https://pypi.tuna.tsinghua.edu.cn/simple make dev