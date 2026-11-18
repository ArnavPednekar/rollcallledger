#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "Checking PostgreSQL..."
if ! pg_isready -h 127.0.0.1 -p 5432 >/dev/null 2>&1; then
  echo "PostgreSQL is not running on 127.0.0.1:5432"
  exit 1
fi

if [ ! -f "$ROOT/backend/.env" ]; then
  cp "$ROOT/backend/.env.example" "$ROOT/backend/.env"
  echo "Created backend/.env - set a strong JWT_SECRET before presenting."
fi

echo "Building backend..."
cd "$ROOT/backend"
cargo build

echo "Starting backend on http://127.0.0.1:3000 ..."
./target/debug/backend &
BACKEND_PID=$!

echo "Starting frontend on http://127.0.0.1:5173 ..."
cd "$ROOT/frontend"
npm run dev -- --host 127.0.0.1 &
FRONTEND_PID=$!

trap 'kill "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null || true' EXIT INT TERM

echo "Press Ctrl+C to stop both servers."
wait
