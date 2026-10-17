#!/usr/bin/env bash
# ==============================================================================
# 🌙 Selene — Production Build & Sanity Suite
# Location: tools/scripts/build/build.sh
# Compatible with: Linux, macOS, and Cygwin
# ==============================================================================

set -euo pipefail

SKIP_TESTS="${1:-}"
CLEAN_BUILD="${2:-}"

# Determine directory structure
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../../.." && pwd)"
cd "${PROJECT_ROOT}"

# Color definitions
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
GRAY='\033[0;90m'
NC='\033[0m'

echo ""
echo -e "${CYAN}==========================================================${NC}"
echo -e "${CYAN}  🌙 Selene — Production Build & Quality Sanity Suite    ${NC}"
echo -e "${CYAN}==========================================================${NC}"
echo -e "${GRAY}  Working Directory: ${PROJECT_ROOT}${NC}"
echo ""

# ------------------------------------------------------------------------------
# Dependency & Environment Checks
# ------------------------------------------------------------------------------
echo -e "${YELLOW}[1/5] Checking Node.js runtime...${NC}"
if ! command -v node >/dev/null 2>&1; then
    echo -e "${RED}  [ERROR] Node.js is not installed or not in PATH.${NC}"
    exit 1
fi
NODE_VERSION="$(node -v)"
NODE_MAJOR="$(echo "${NODE_VERSION}" | sed -E 's/^v([0-9]+)\..*/\1/')"
if [ "${NODE_MAJOR}" -lt 18 ]; then
    echo -e "${RED}  [ERROR] Node.js version ${NODE_VERSION} detected. Selene requires Node.js v18.0.0 or higher.${NC}"
    exit 1
fi
echo -e "${GREEN}  ✓ Node.js ${NODE_VERSION} (OK)${NC}"

echo -e "${YELLOW}[2/5] Checking npm package manager...${NC}"
if ! command -v npm >/dev/null 2>&1; then
    echo -e "${RED}  [ERROR] npm is not installed or not in PATH.${NC}"
    exit 1
fi
echo -e "${GREEN}  ✓ npm v$(npm -v) (OK)${NC}"

echo -e "${YELLOW}[3/5] Verifying dependency integrity...${NC}"
if [ ! -d "${PROJECT_ROOT}/node_modules" ]; then
    echo -e "${CYAN}  (!) node_modules missing. Running npm install...${NC}"
    npm install
fi
echo -e "${GREEN}  ✓ Dependencies intact (OK)${NC}"

if [ "${CLEAN_BUILD}" = "--clean" ]; then
    echo -e "${YELLOW}  Cleaning prior build artifacts (.next)...${NC}"
    rm -rf "${PROJECT_ROOT}/.next"
    echo -e "${GREEN}  ✓ Cleaned .next directory${NC}"
fi

# ------------------------------------------------------------------------------
# Quality & Sanity Test Suite
# ------------------------------------------------------------------------------
if [ "${SKIP_TESTS}" != "--skip-tests" ]; then
    echo ""
    echo -e "${YELLOW}[4/5] Executing Quality & Sanity Test Suite...${NC}"

    echo -e "${CYAN}  --> Running TypeScript Type-Check (tsc --noEmit)...${NC}"
    npm run type-check
    echo -e "${GREEN}  ✓ Type check passed (0 errors).${NC}"

    echo -e "${CYAN}  --> Running ESLint static analysis (eslint)...${NC}"
    npm run lint
    echo -e "${GREEN}  ✓ ESLint passed (0 errors, 0 warnings).${NC}"
else
    echo -e "${GRAY}[4/5] Skipping test suite (--skip-tests specified).${NC}"
fi

# ------------------------------------------------------------------------------
# Production Build
# ------------------------------------------------------------------------------
echo ""
echo -e "${YELLOW}[5/5] Compiling production distribution bundle (next build)...${NC}"
npm run build

# ------------------------------------------------------------------------------
# Build Artifact Verification
# ------------------------------------------------------------------------------
if [ -d "${PROJECT_ROOT}/.next" ]; then
    echo ""
    echo -e "${GREEN}==========================================================${NC}"
    echo -e "${GREEN}  ✓ Build Succeeded! Production distribution is ready.   ${NC}"
    echo -e "${GREEN}==========================================================${NC}"
    echo -e "${GRAY}  Output Directory: ${PROJECT_ROOT}/.next${NC}"
    echo -e "${CYAN}  Run 'npm start' to serve the production build locally.${NC}"
    echo ""
else
    echo -e "${RED}  [ERROR] .next output directory not found after build.${NC}"
    exit 1
fi
