#!/usr/bin/env bash
# ==============================================================================
# 🌙 Selene — Production Build & Sanity Suite (Bash)
# Location: tools/scripts/build/build.sh
# Compatible with: Linux, macOS, WSL, and Cygwin
# ==============================================================================

set -euo pipefail

TOTAL_START=$(date +%s)

# Parameter Parsing
SKIP_TESTS=0
CLEAN_BUILD=0
VERBOSE=0

for arg in "$@"; do
    case "$arg" in
        --skip-tests)
            SKIP_TESTS=1
            ;;
        --clean)
            CLEAN_BUILD=1
            ;;
        --verbose|-v)
            VERBOSE=1
            ;;
        --help|-h)
            echo "🌙 Selene Production Build & Sanity Suite"
            echo ""
            echo "USAGE: ./tools/scripts/build/build.sh [FLAGS]"
            echo ""
            echo "FLAGS:"
            echo "  --skip-tests    Bypass TypeScript type-check and ESLint static analysis."
            echo "  --clean         Remove .next build directory prior to compilation."
            echo "  --verbose, -v   Print verbose debugging and telemetry logs."
            echo "  --help, -h      Display this usage manual."
            exit 0
            ;;
    esac
done

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

# Read App Version
APP_VERSION="0.4.0"
if [ -f "${PROJECT_ROOT}/package.json" ]; then
    APP_VERSION=$(node -e "console.log(require('./package.json').version || '0.4.0')" 2>/dev/null || echo "0.4.0")
fi

# Git Metadata
GIT_BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo 'unknown')"
GIT_COMMIT="$(git rev-parse --short HEAD 2>/dev/null || echo 'unknown')"
HOST_INFO="$(uname -s 2>/dev/null || echo 'Unknown-OS') $(uname -m 2>/dev/null || echo '')"

echo ""
echo -e "${CYAN}==================================================================${NC}"
echo -e "${CYAN}  🌙 Selene — Production Build & Quality Sanity Suite            ${NC}"
echo -e "${CYAN}==================================================================${NC}"
echo -e "  Application    : Selene Titan Edition (v${APP_VERSION})"
echo -e "${GRAY}  Working Dir    : ${PROJECT_ROOT}${NC}"
echo -e "${GRAY}  Host Machine   : ${HOST_INFO}${NC}"
echo -e "${GRAY}  Git Context    : ${GIT_BRANCH} (${GIT_COMMIT})${NC}"
echo -e "${GRAY}  Execution Mode : Clean=${CLEAN_BUILD} | SkipTests=${SKIP_TESTS} | Verbose=${VERBOSE}${NC}"
echo -e "${CYAN}==================================================================${NC}"
echo ""

print_phase() {
    echo -e "${CYAN}------------------------------------------------------------------${NC}"
    echo -e "${YELLOW}  [$1] $2${NC}"
    echo -e "${CYAN}------------------------------------------------------------------${NC}"
}

# ------------------------------------------------------------------------------
# Phase 1: Environment & Toolchain Diagnostics
# ------------------------------------------------------------------------------
P1_START=$(date +%s)
print_phase "1/5" "Environment & Toolchain Diagnostics"

if ! command -v node >/dev/null 2>&1; then
    echo -e "${RED}  ❌ [ERROR] Node.js is not installed or not in PATH.${NC}"
    exit 1
fi
NODE_VERSION="$(node -v)"
NODE_MAJOR="$(echo "${NODE_VERSION}" | sed -E 's/^v([0-9]+)\..*/\1/')"
if [ "${NODE_MAJOR}" -lt 18 ]; then
    echo -e "${RED}  ❌ [ERROR] Node.js version ${NODE_VERSION} detected. Selene requires Node.js v18.0.0 or higher.${NC}"
    exit 1
fi
echo -e "${GREEN}  ✓ [OK] Node.js Runtime : ${NODE_VERSION} ($(command -v node))${NC}"

if ! command -v npm >/dev/null 2>&1; then
    echo -e "${RED}  ❌ [ERROR] npm is not installed or not in PATH.${NC}"
    exit 1
fi
echo -e "${GREEN}  ✓ [OK] npm Manager     : v$(npm -v) ($(command -v npm))${NC}"

if [ ! -d "${PROJECT_ROOT}/node_modules" ]; then
    echo -e "${CYAN}  ℹ node_modules missing. Ingesting packages via npm install...${NC}"
    npm install
fi
echo -e "${GREEN}  ✓ [OK] Dependencies verified${NC}"
P1_DURATION=$(( $(date +%s) - P1_START ))

# ------------------------------------------------------------------------------
# Phase 2: Build Cache & Clean Sweep
# ------------------------------------------------------------------------------
P2_START=$(date +%s)
print_phase "2/5" "Build Cache & Clean Sweep"

NEXT_DIR="${PROJECT_ROOT}/.next"
if [ "${CLEAN_BUILD}" -eq 1 ]; then
    if [ -d "${NEXT_DIR}" ]; then
        echo -e "${YELLOW}  ℹ Purging prior Next.js build cache (.next)...${NC}"
        rm -rf "${NEXT_DIR}"
        echo -e "${GREEN}  ✓ [OK] Removed previous .next distribution directory${NC}"
    else
        echo -e "${GREEN}  ✓ [OK] Clean sweep skipped (no prior .next folder existed)${NC}"
    fi
else
    if [ -d "${NEXT_DIR}" ]; then
        echo -e "${GRAY}  ℹ Incremental build cache active (.next preserved). Use --clean for full wipe.${NC}"
    else
        echo -e "${GRAY}  ℹ Fresh build workspace detected (no existing .next directory).${NC}"
    fi
fi
P2_DURATION=$(( $(date +%s) - P2_START ))

# ------------------------------------------------------------------------------
# Phase 3: Quality & Static Sanity Suite
# ------------------------------------------------------------------------------
P3_START=$(date +%s)
print_phase "3/5" "Quality & Static Sanity Suite"

if [ "${SKIP_TESTS}" -eq 0 ]; then
    echo -e "${CYAN}  --> Executing TypeScript Type-Check (tsc --noEmit)...${NC}"
    npm run type-check
    echo -e "${GREEN}  ✓ [OK] TypeScript strict type verification passed (0 errors)${NC}"

    echo -e "${CYAN}  --> Executing ESLint Static Analysis (eslint)...${NC}"
    npm run lint
    echo -e "${GREEN}  ✓ [OK] ESLint rules passed (0 errors, 0 warnings)${NC}"
else
    echo -e "${GRAY}  ℹ All quality sanity checks bypassed (--skip-tests specified).${NC}"
fi
P3_DURATION=$(( $(date +%s) - P3_START ))

# ------------------------------------------------------------------------------
# Phase 4: Production Distribution Compilation
# ------------------------------------------------------------------------------
P4_START=$(date +%s)
print_phase "4/5" "Production Distribution Compilation (next build)"

echo -e "${CYAN}  --> Triggering Next.js production build...${NC}"
npm run build
echo -e "${GREEN}  ✓ [OK] Next.js compilation completed${NC}"
P4_DURATION=$(( $(date +%s) - P4_START ))

# ------------------------------------------------------------------------------
# Phase 5: Build Artifact Verification & Telemetry
# ------------------------------------------------------------------------------
P5_START=$(date +%s)
print_phase "5/5" "Build Artifact Verification & Sizing"

if [ -d "${NEXT_DIR}" ]; then
    BUNDLE_SIZE="unknown"
    if command -v du >/dev/null 2>&1; then
        BUNDLE_SIZE=$(du -sh "${NEXT_DIR}" | cut -f1)
    fi
    echo -e "${GREEN}  ✓ [OK] Verified build artifacts in ${NEXT_DIR}${NC}"
    echo -e "${GRAY}  ℹ Total Artifact Size : ${BUNDLE_SIZE}${NC}"
else
    echo -e "${RED}  ❌ [ERROR] .next output directory not found after build.${NC}"
    exit 1
fi
P5_DURATION=$(( $(date +%s) - P5_START ))
TOTAL_DURATION=$(( $(date +%s) - TOTAL_START ))

# ------------------------------------------------------------------------------
# Build Summary Table
# ------------------------------------------------------------------------------
echo ""
echo -e "${GREEN}==================================================================${NC}"
echo -e "${GREEN}  🌙 [SUCCESS] SELENE PRODUCTION BUILD READY!                     ${NC}"
echo -e "${GREEN}==================================================================${NC}"
echo -e "  Application     : Selene v${APP_VERSION} (Titan Edition)"
echo -e "${CYAN}  Distribution    : ${NEXT_DIR}${NC}"
echo -e "${CYAN}  Bundle Footprint: ${BUNDLE_SIZE}${NC}"
echo -e "${YELLOW}  Total Runtime   : ${TOTAL_DURATION}s${NC}"
echo ""
echo -e "${GRAY}  Execution Timeline:${NC}"
echo -e "${GRAY}    [1/5] Environment Checks : ${P1_DURATION}s${NC}"
echo -e "${GRAY}    [2/5] Clean Sweep        : ${P2_DURATION}s${NC}"
echo -e "${GRAY}    [3/5] Quality Sanity     : ${P3_DURATION}s${NC}"
echo -e "${GRAY}    [4/5] Next.js Build      : ${P4_DURATION}s${NC}"
echo -e "${GRAY}    [5/5] Artifact Telemetry : ${P5_DURATION}s${NC}"
echo -e "${GREEN}==================================================================${NC}"
echo -e "${CYAN}  To test the compiled bundle locally: npm start${NC}"
echo ""
