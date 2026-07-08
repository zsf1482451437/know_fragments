#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"
ECOMMERCE_DB_PATH="${ECOMMERCE_DB_PATH:-$BACKEND_DIR/data/ecommerce.db}"

BACKEND_PID=""
FRONTEND_PID=""

cleanup() {
  if [[ -n "$FRONTEND_PID" ]] && kill -0 "$FRONTEND_PID" 2>/dev/null; then
    kill "$FRONTEND_PID" 2>/dev/null || true
  fi
  if [[ -n "$BACKEND_PID" ]] && kill -0 "$BACKEND_PID" 2>/dev/null; then
    kill "$BACKEND_PID" 2>/dev/null || true
  fi
  wait "$FRONTEND_PID" 2>/dev/null || true
  wait "$BACKEND_PID" 2>/dev/null || true
}

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "缺少命令：$1"
    exit 1
  fi
}

wait_for_backend() {
  if ! command -v curl >/dev/null 2>&1; then
    sleep 2
    return
  fi

  for _ in $(seq 1 30); do
    if curl -fsS "http://localhost:8080/api/products" >/dev/null 2>&1; then
      return
    fi
    sleep 1
  done

  echo "后端启动超时，请检查 8080 端口是否被占用。"
  exit 1
}

trap cleanup EXIT INT TERM

require_command go
require_command npm

echo "启动后端：http://localhost:8080"
(
  cd "$BACKEND_DIR"
  ECOMMERCE_DB_PATH="$ECOMMERCE_DB_PATH" go run ./cmd/api
) &
BACKEND_PID=$!

wait_for_backend

echo "后端已就绪，数据库文件：$ECOMMERCE_DB_PATH"

if [[ ! -d "$FRONTEND_DIR/node_modules" ]]; then
  echo "检测到前端依赖未安装，开始执行 npm install"
  (
    cd "$FRONTEND_DIR"
    npm install
  )
fi

echo "启动前端：http://localhost:5174"
(
  cd "$FRONTEND_DIR"
  npm run dev -- --host 0.0.0.0
) &
FRONTEND_PID=$!

echo "前后端已启动。按 Ctrl+C 停止。"
while true; do
  if ! kill -0 "$BACKEND_PID" 2>/dev/null; then
    echo "后端进程已退出。"
    exit 1
  fi
  if ! kill -0 "$FRONTEND_PID" 2>/dev/null; then
    echo "前端进程已退出。"
    exit 1
  fi
  sleep 2
done
