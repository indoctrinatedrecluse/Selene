#!/usr/bin/env bash
# ==============================================================================
# 🌙 Selene — Native Desktop Shell Launcher (Bash)
# Location: tools/scripts/desktop/run-desktop.sh
# Compatible with: Linux, macOS, WSL, and Cygwin
# ==============================================================================

set -euo pipefail

ENGINE="electron"
PORT=3000
VERBOSE=0

while [[ $# -gt 0 ]]; do
    case "$1" in
        -e|--engine)
            ENGINE="$2"
            shift 2
            ;;
        -p|--port)
            PORT="$2"
            shift 2
            ;;
        -v|--verbose)
            VERBOSE=1
            shift
            ;;
        -h|--help)
            echo "🌙 Selene — Native Desktop Shell Launcher"
            echo ""
            echo "USAGE: ./tools/scripts/desktop/run-desktop.sh [FLAGS]"
            echo ""
            echo "FLAGS:"
            echo "  -e, --engine ENGINE   Desktop engine: 'electron' (default) or 'tauri'"
            echo "  -p, --port PORT       Development server port (Default: 3000)"
            echo "  -v, --verbose         Enable verbose diagnostic logs"
            echo "  -h, --help            Display this help manual"
            exit 0
            ;;
        electron|tauri)
            ENGINE="$1"
            shift
            ;;
        *)
            echo "Unknown argument: $1"
            echo "Use --help for usage instructions."
            exit 1
            ;;
    esac
done

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../../.." && pwd)"
cd "${PROJECT_ROOT}"

CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
GRAY='\033[0;90m'
NC='\033[0m'

APP_VERSION="0.5.0"
if [ -f "${PROJECT_ROOT}/package.json" ]; then
    APP_VERSION=$(node -e "console.log(require('./package.json').version || '0.5.0')" 2>/dev/null || echo "0.5.0")
fi

GIT_BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo 'unknown')"
GIT_COMMIT="$(git rev-parse --short HEAD 2>/dev/null || echo 'unknown')"

echo ""
echo -e "${CYAN}==================================================================${NC}"
echo -e "${CYAN}  🌙 Selene — Native Desktop Shell Launcher (Bash)                ${NC}"
echo -e "${CYAN}==================================================================${NC}"
echo -e "  Application     : Selene Titan Edition (v${APP_VERSION})"
echo -e "${GRAY}  Working Dir     : ${PROJECT_ROOT}${NC}"
echo -e "${GRAY}  Git Context     : ${GIT_BRANCH} (${GIT_COMMIT})${NC}"
echo -e "${YELLOW}  Desktop Engine  : ${ENGINE}${NC}"
echo -e "${YELLOW}  Server Endpoint : http://localhost:${PORT}${NC}"
echo -e "${CYAN}==================================================================${NC}"

print_phase() {
    echo ""
    echo -e "${CYAN}------------------------------------------------------------------${NC}"
    echo -e "${YELLOW}  [$1] $2${NC}"
    echo -e "${CYAN}------------------------------------------------------------------${NC}"
}

# ------------------------------------------------------------------------------
# 1. Toolchain Diagnostics
# ------------------------------------------------------------------------------
print_phase "1/4" "Checking Toolchain Requirements"

if ! command -v node >/dev/null 2>&1; then
    echo -e "${RED}  ❌ [FAIL] Node.js not detected in PATH.${NC}"
    exit 1
fi
echo -e "${GREEN}  ✓ [OK] Node.js runtime: $(node -v)${NC}"

if ! command -v npm >/dev/null 2>&1; then
    echo -e "${RED}  ❌ [FAIL] npm package manager not detected in PATH.${NC}"
    exit 1
fi
echo -e "${GREEN}  ✓ [OK] npm manager: v$(npm -v)${NC}"

if [ "${ENGINE}" = "tauri" ]; then
    if command -v rustc >/dev/null 2>&1 && command -v cargo >/dev/null 2>&1; then
        echo -e "${GREEN}  ✓ [OK] Rust compiler : $(rustc --version)${NC}"
        echo -e "${GREEN}  ✓ [OK] Cargo manager  : $(cargo --version)${NC}"
    else
        echo -e "${YELLOW}  ⚠️  [WARN] Rust toolchain not found. Falling back to Electron desktop shell.${NC}"
        ENGINE="electron"
    fi
fi

if [ "${ENGINE}" = "electron" ]; then
    if [ -f "${PROJECT_ROOT}/electron/main.js" ]; then
        echo -e "${GREEN}  ✓ [OK] Electron desktop entry point verified (electron/main.js)${NC}"
    fi
fi

# ------------------------------------------------------------------------------
# 2. Dependency Verification
# ------------------------------------------------------------------------------
print_phase "2/4" "Verifying Dependencies (node_modules)"
if [ ! -d "${PROJECT_ROOT}/node_modules" ]; then
    echo -e "${CYAN}  ℹ node_modules missing. Installing via npm install...${NC}"
    npm install
fi
echo -e "${GREEN}  ✓ [OK] Dependencies verified.${NC}"

# ------------------------------------------------------------------------------
# 3. Server Availability Check & Lifecycle
# ------------------------------------------------------------------------------
print_phase "3/4" "Inspecting Local Server Availability (Port ${PORT})"
SERVER_PID=""

is_port_active() {
    if command -v nc >/dev/null 2>&1; then
        nc -z 127.0.0.1 "${PORT}" 2>/dev/null && return 0
    elif command -v lsof >/dev/null 2>&1; then
        lsof -i ":${PORT}" -sTCP:LISTEN -t >/dev/null 2>&1 && return 0
    fi
    return 1
}

if is_port_active; then
    echo -e "${GREEN}  ✓ [OK] Local Selene server is already active on http://localhost:${PORT}${NC}"
else
    echo -e "${CYAN}  ℹ Starting Next.js Turbopack dev server on port ${PORT}...${NC}"
    npx next dev -p "${PORT}" &
    SERVER_PID=$!
    trap 'if [ -n "$SERVER_PID" ]; then echo "  Shutting down server (PID: $SERVER_PID)..."; kill "$SERVER_PID" 2>/dev/null || true; fi' EXIT
    
    echo -e "${GRAY}  ℹ Spawned Next.js dev server (PID: ${SERVER_PID}). Waiting for readiness...${NC}"
    for i in {1..30}; do
        sleep 1
        if is_port_active; then
            echo -e "${GREEN}  ✓ [OK] Local Next.js server is ready and accepting requests!${NC}"
            break
        fi
    done
fi

# ------------------------------------------------------------------------------
# 4. Launch Desktop Shell
# ------------------------------------------------------------------------------
print_phase "4/4" "Launching Selene in Native ${ENGINE} Shell"
echo -e "${GRAY}  ℹ Opening Selene desktop window...${NC}"

if [ "${ENGINE}" = "tauri" ]; then
    npx tauri dev
else
    npx electron electron/main.js
fi

echo ""
echo -e "${GRAY}==================================================================${NC}"
echo -e "${GRAY}  [Selene Desktop Session Closed]                                 ${NC}"
echo -e "${GRAY}==================================================================${NC}"
echo ""
