#!/usr/bin/env bash
# ==============================================================================
# 🌙 Selene — Development Server Launcher (Bash)
# Location: tools/scripts/run/run.sh
# Compatible with: Linux, macOS, WSL, and Cygwin
# ==============================================================================

set -euo pipefail

PORT=3000
HOST="localhost"
CLEAN=0
VERBOSE=0

while [[ $# -gt 0 ]]; do
    case "$1" in
        -p|--port)
            PORT="$2"
            shift 2
            ;;
        -H|--host)
            HOST="$2"
            shift 2
            ;;
        -c|--clean)
            CLEAN=1
            shift
            ;;
        -v|--verbose)
            VERBOSE=1
            shift
            ;;
        -h|--help)
            echo "🌙 Selene — Development Server Launcher"
            echo ""
            echo "USAGE: ./tools/scripts/run/run.sh [FLAGS]"
            echo ""
            echo "FLAGS:"
            echo "  -p, --port PORT     Port to bind server (Default: 3000)"
            echo "  -H, --host HOST     Host to bind server (Default: localhost)"
            echo "  -c, --clean         Purge .next cache before launching"
            echo "  -v, --verbose       Enable verbose diagnostic logs"
            echo "  -h, --help          Display this help manual"
            exit 0
            ;;
        *)
            if [[ "$1" =~ ^[0-9]+$ ]]; then
                PORT="$1"
                shift
            else
                HOST="$1"
                shift
            fi
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
echo -e "${CYAN}  🌙 Selene — Development Server Launcher (Bash)                  ${NC}"
echo -e "${CYAN}==================================================================${NC}"
echo -e "  Application    : Selene Titan Edition (v${APP_VERSION})"
echo -e "${GRAY}  Working Dir    : ${PROJECT_ROOT}${NC}"
echo -e "${GRAY}  Git Context    : ${GIT_BRANCH} (${GIT_COMMIT})${NC}"
echo -e "${YELLOW}  Target Host    : ${HOST}${NC}"
echo -e "${YELLOW}  Target Port    : ${PORT}${NC}"
echo -e "${CYAN}==================================================================${NC}"

print_phase() {
    echo ""
    echo -e "${CYAN}------------------------------------------------------------------${NC}"
    echo -e "${YELLOW}  [$1] $2${NC}"
    echo -e "${CYAN}------------------------------------------------------------------${NC}"
}

# ------------------------------------------------------------------------------
# 1. Environment Diagnostics
# ------------------------------------------------------------------------------
print_phase "1/4" "Checking Node.js and Package Manager"

if ! command -v node >/dev/null 2>&1; then
    echo -e "${RED}  ❌ [FAIL] Node.js is not installed or not in PATH.${NC}"
    exit 1
fi
NODE_VERSION="$(node -v)"
NODE_MAJOR="$(echo "${NODE_VERSION}" | sed -E 's/^v([0-9]+)\..*/\1/')"
if [ "${NODE_MAJOR}" -lt 18 ]; then
    echo -e "${RED}  ❌ [FAIL] Node.js version ${NODE_VERSION} detected. Selene requires Node.js v18.0.0 or higher.${NC}"
    exit 1
fi
echo -e "${GREEN}  ✓ [OK] Node.js Runtime : ${NODE_VERSION} ($(command -v node))${NC}"

if ! command -v npm >/dev/null 2>&1; then
    echo -e "${RED}  ❌ [FAIL] npm is not installed or not in PATH.${NC}"
    exit 1
fi
echo -e "${GREEN}  ✓ [OK] npm Manager     : v$(npm -v) ($(command -v npm))${NC}"

# ------------------------------------------------------------------------------
# 2. Dependency Verification
# ------------------------------------------------------------------------------
print_phase "2/4" "Verifying Project Dependencies (node_modules)"
if [ ! -d "${PROJECT_ROOT}/node_modules" ]; then
    echo -e "${CYAN}  ℹ node_modules missing. Installing via npm install...${NC}"
    npm install
fi
echo -e "${GREEN}  ✓ [OK] Dependencies verified.${NC}"

if [ "${CLEAN}" -eq 1 ]; then
    if [ -d "${PROJECT_ROOT}/.next" ]; then
        echo -e "${YELLOW}  ℹ Purging .next build cache...${NC}"
        rm -rf "${PROJECT_ROOT}/.next"
        echo -e "${GREEN}  ✓ [OK] Cleaned .next development cache${NC}"
    fi
fi

# ------------------------------------------------------------------------------
# 3. Port Availability Inspection
# ------------------------------------------------------------------------------
print_phase "3/4" "Inspecting Port ${PORT} Availability"
PORT_BUSY=0
if command -v lsof >/dev/null 2>&1; then
    if lsof -Pi ":${PORT}" -sTCP:LISTEN -t >/dev/null 2>&1; then
        PORT_BUSY=1
    fi
elif command -v nc >/dev/null 2>&1; then
    if nc -z 127.0.0.1 "${PORT}" 2>/dev/null; then
        PORT_BUSY=1
    fi
fi

if [ "${PORT_BUSY}" -eq 1 ]; then
    echo -e "${YELLOW}  ⚠️  [WARN] Port ${PORT} is currently active. Next.js will auto-negotiate or bind.${NC}"
else
    echo -e "${GREEN}  ✓ [OK] Port ${PORT} is available for immediate binding${NC}"
fi

# ------------------------------------------------------------------------------
# 4. Local Network Discovery & Launch
# ------------------------------------------------------------------------------
print_phase "4/4" "Resolving Endpoints & Launching Turbopack Server"

echo -e "  Available Access URLs:"
echo -e "${GREEN}    > Localhost      : http://${HOST}:${PORT}${NC}"

if command -v hostname >/dev/null 2>&1 && hostname -I >/dev/null 2>&1; then
    for ip in $(hostname -I); do
        if [ "${ip}" != "127.0.0.1" ]; then
            echo -e "${CYAN}    > Network (LAN)  : http://${ip}:${PORT}${NC}"
        fi
    done
fi

echo ""
echo -e "${GRAY}------------------------------------------------------------------${NC}"
echo -e "${CYAN}  🚀 Launching Next.js Turbopack Development Server...            ${NC}"
echo -e "${GREEN}  Fast Refresh / HMR : ACTIVE                                     ${NC}"
echo -e "${GRAY}  Press Ctrl+C to terminate the development server                ${NC}"
echo -e "${GRAY}------------------------------------------------------------------${NC}"
echo ""

exec npm run dev -- -p "${PORT}" -H "${HOST}"
