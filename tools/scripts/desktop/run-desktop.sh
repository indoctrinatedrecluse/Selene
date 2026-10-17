#!/usr/bin/env bash
# ==========================================================
#   🌙 Selene — Native Desktop Shell Launcher (Bash)
# ==========================================================

set -e

ENGINE="${1:-electron}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"

cd "$PROJECT_ROOT"

echo "=========================================================="
echo "  🌙 Selene — Native Desktop Shell Launcher               "
echo "=========================================================="
echo "  Working Directory: $PROJECT_ROOT"
echo "  Selected Desktop Engine: $ENGINE"

# Check Node.js
if ! command -v node >/dev/null 2>&1; then
  echo "  [FAIL] Node.js not found in PATH." >&2
  exit 1
fi

echo "  [OK] Node.js $(node -v)"

# Check dependencies
if [ ! -d "node_modules" ]; then
  echo "--> Installing dependencies..."
  npm install
fi

# Check if port 3000 is occupied
SERVER_PID=""
if nc -z 127.0.0.1 3000 2>/dev/null; then
  echo "  [OK] Server already active on http://localhost:3000"
else
  echo "--> Starting local Next.js server..."
  npx next dev &
  SERVER_PID=$!
  trap 'if [ -n "$SERVER_PID" ]; then kill "$SERVER_PID" 2>/dev/null || true; fi' EXIT
  sleep 3
fi

# Launch Desktop Shell
echo "--> Launching Selene desktop application ($ENGINE)..."
if [ "$ENGINE" = "tauri" ]; then
  npx tauri dev
else
  npx electron electron/main.js
fi
