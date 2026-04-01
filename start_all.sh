#!/bin/bash

echo "🚀 OpenGenerativeUI 一键启动脚本"
echo "=================================="

# 清理环境
echo "🔧 清理环境..."
deactivate 2>/dev/null || true
unset VIRTUAL_ENV 2>/dev/null || true

# 杀死所有相关进程
echo "🔪 停止所有相关进程..."
pkill -9 -f "uvicorn\|tsx\|next\|node.*mcp" 2>/dev/null || true
sleep 3

# 检查并释放端口
echo "📡 检查端口..."
for port in 8123 8124 3100 3101 3000; do
    if python3 -c "import socket; s = socket.socket(); s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1); s.settimeout(1); try: s.bind(('0.0.0.0', $port)); s.close(); print('  ✅ 端口 $port 空闲'); except: print('  ⚠️  端口 $port 被占用，尝试释放...');" 2>/dev/null; then
        echo "  ✅ 端口 $port 空闲"
    else
        echo "  ⚠️  端口 $port 被占用，尝试释放..."
        lsof -ti:$port 2>/dev/null | xargs kill -9 2>/dev/null || true
    fi
done

sleep 2

# 设置环境变量
echo "🌐 配置国内镜像源..."
export UV_INDEX_URL="https://pypi.tuna.tsinghua.edu.cn/simple"
export PORT="8124"
export MCP_PORT="3101"

echo ""
echo "📊 服务配置:"
echo "  - Agent服务: http://localhost:8124"
echo "  - MCP服务:   http://localhost:3101/mcp"
echo "  - Web应用:   http://localhost:3000"
echo ""

# 启动服务
echo "🚀 启动所有服务..."
echo "   使用命令: make dev"
echo ""

make dev