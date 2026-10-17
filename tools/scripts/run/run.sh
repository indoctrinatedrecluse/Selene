#!/usr/bin/env bash
# ==============================================================================
# 🌙 Selene — Development Server Launcher
# Location: tools/scripts/run/run.sh
# Compatible with: Linux, macOS, and Cygwin
# ==============================================================================

set -euo pipefail

PORT="${1:-3000}"
HOST="${2:-localhost}"

# Determine directory structure
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../../.." && pwd)"
cd "${PROJECT_ROOT}"

# Handle Cygwin / Windows path translation if necessary
if command -v cygpath >/dev/null 2>&1; then
    IS_CYGWIN=1
else
    IS_CYGWIN=0
fi

# Color definitions
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
GRAY='\033[0;90m'
NC='\033[0m' # No Color

echo ""
echo -e "${CYAN}==========================================================${NC}"
echo -e "${CYAN}  🌙 Selene — Modern Technical Document & Code Canvas    ${NC}"
echo -e "${CYAN}  Development Server Launcher                            ${NC}"
echo -e "${CYAN}==========================================================${NC}"
echo -e "${GRAY}  Working Directory: ${PROJECT_ROOT}${NC}"
echo ""

# ------------------------------------------------------------------------------
# Dependency & Pre-flight Checks
# ------------------------------------------------------------------------------
echo -e "${YELLOW}[1/4] Checking Node.js environment...${NC}"
if ! command -v node >/dev/null 2>&1; then
    echo -e "${RED}  [ERROR] Node.js is not installed or not in PATH.${NC}"
    echo -e "${RED}  Please install Node.js (v20+ recommended) from https://nodejs.org/${NC}"
    exit 1
fi

NODE_VERSION="$(node -v)"
NODE_MAJOR="$(echo "${NODE_VERSION}" | sed -E 's/^v([0-9]+)\..*/\1/')"
if [ "${NODE_MAJOR}" -lt 18 ]; then
    echo -e "${RED}  [ERROR] Node.js version ${NODE_VERSION} detected. Selene requires Node.js v18.0.0 or higher.${NC}"
    exit 1
fi
echo -e "${GREEN}  ✓ Node.js ${NODE_VERSION} (OK)${NC}"

echo -e "${YELLOW}[2/4] Checking npm package manager...${NC}"
if ! command -v npm >/dev/null 2>&1; then
    echo -e "${RED}  [ERROR] npm is not installed or not in PATH.${NC}"
    exit 1
fi
NPM_VERSION="$(npm -v)"
echo -e "${GREEN}  ✓ npm v${NPM_VERSION} (OK)${NC}"

echo -e "${YELLOW}[3/4] Verifying project dependencies (node_modules)...${NC}"
if [ ! -d "${PROJECT_ROOT}/node_modules" ]; then
    echo -e "${CYAN}  (!) node_modules not found. Installing dependencies automatically...${NC}"
    npm install
    echo -e "${GREEN}  ✓ Dependencies installed successfully.${NC}"
else
    echo -e "${GREEN}  ✓ node_modules present (OK)${NC}"
fi

echo -e "${YELLOW}[4/4] Checking local port status...${NC}"
if command -v lsof >/dev/null 2>&1; then
    if lsof -Pi ":${PORT}" -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${YELLOW}  (!) Port ${PORT} is currently in use. Next.js will negotiate next available port.${NC}"
    else
        echo -e "${GREEN}  ✓ Port ${PORT} is available (OK)${NC}"
    fi
elif command -v netstat >/dev/null 2>&1; then
    if netstat -an | grep "${PORT}" | grep -i listen >/dev/null 2>&1; then
        echo -e "${YELLOW}  (!) Port ${PORT} is active or listening.${NC}"
    else
        echo -e "${GREEN}  ✓ Port ${PORT} check passed (OK)${NC}"
    fi
else
    echo -e "${GREEN}  ✓ Port check passed (OK)${NC}"
fi

# ------------------------------------------------------------------------------
# Starting Development Server
# ------------------------------------------------------------------------------
echo ""
echo -e "${GRAY}----------------------------------------------------------${NC}"
echo -e "${CYAN}  🚀 Launching Next.js Turbopack Development Server...    ${NC}"
echo -e "${CYAN}  Target URL: http://${HOST}:${PORT}                      ${NC}"
echo -e "${GREEN}  Live Reload / HMR: ACTIVE                               ${NC}"
echo -e "${GRAY}  Press Ctrl+C to stop the server                         ${NC}"
echo -e "${GRAY}----------------------------------------------------------${NC}"
echo ""

exec npm run dev -- -p "${PORT}" -H "${HOST}"
