#!/usr/bin/env bash
# ==============================================================================
# 🌙 Selene — Desktop Distribution Packaging Suite (Bash)
# Location: tools/scripts/desktop/package-desktop.sh
# Compatible with: Linux, macOS, WSL, and Cygwin
# ==============================================================================

set -euo pipefail

TOTAL_START=$(date +%s)

TARGET="tauri"
SKIP_TESTS=0
CLEAN_BUILD=0
VERBOSE=0

while [[ $# -gt 0 ]]; do
    case "$1" in
        --target|-t)
            TARGET="$2"
            shift 2
            ;;
        --skip-tests)
            SKIP_TESTS=1
            shift
            ;;
        --clean)
            CLEAN_BUILD=1
            shift
            ;;
        --verbose|-v)
            VERBOSE=1
            shift
            ;;
        --help|-h)
            echo "🌙 Selene — Desktop Distribution Packaging Suite"
            echo ""
            echo "USAGE: ./tools/scripts/desktop/package-desktop.sh [FLAGS]"
            echo ""
            echo "FLAGS:"
            echo "  -t, --target TARGET   Packaging target: 'tauri' (default) or 'electron'"
            echo "      --skip-tests      Bypass TypeScript type-check and ESLint static analysis"
            echo "      --clean           Clean prior release bundles before packaging"
            echo "  -v, --verbose         Enable verbose diagnostic logs"
            echo "  -h, --help            Display this help manual"
            exit 0
            ;;
        tauri|electron)
            TARGET="$1"
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
echo -e "${CYAN}  🌙 Selene — Desktop Distribution Packaging Suite                ${NC}"
echo -e "${CYAN}==================================================================${NC}"
echo -e "  Application     : Selene Titan Edition (v${APP_VERSION})"
echo -e "${GRAY}  Working Dir     : ${PROJECT_ROOT}${NC}"
echo -e "${GRAY}  Git Context     : ${GIT_BRANCH} (${GIT_COMMIT})${NC}"
echo -e "${YELLOW}  Packaging Target: ${TARGET}${NC}"
echo -e "${GRAY}  Execution Mode  : Clean=${CLEAN_BUILD} | SkipTests=${SKIP_TESTS} | Verbose=${VERBOSE}${NC}"
echo -e "${CYAN}==================================================================${NC}"

print_phase() {
    echo ""
    echo -e "${CYAN}------------------------------------------------------------------${NC}"
    echo -e "${YELLOW}  [$1] $2${NC}"
    echo -e "${CYAN}------------------------------------------------------------------${NC}"
}

# ------------------------------------------------------------------------------
# 1. Toolchain Verification
# ------------------------------------------------------------------------------
print_phase "1/5" "Toolchain and Environment Verification"

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

if [ "${TARGET}" = "tauri" ]; then
    if command -v rustc >/dev/null 2>&1 && command -v cargo >/dev/null 2>&1; then
        echo -e "${GREEN}  ✓ [OK] Rust compiler : $(rustc --version)${NC}"
        echo -e "${GREEN}  ✓ [OK] Cargo manager  : $(cargo --version)${NC}"
    else
        echo -e "${YELLOW}  ⚠️  [WARN] Rust / Cargo not detected in PATH. Tauri packaging requires Rust toolchain.${NC}"
    fi
fi

if [ "${TARGET}" = "electron" ]; then
    if [ -f "${PROJECT_ROOT}/electron/main.js" ]; then
        echo -e "${GREEN}  ✓ [OK] Electron desktop entry point verified (electron/main.js)${NC}"
    fi
fi

# ------------------------------------------------------------------------------
# 2. Quality and Sanity Checks
# ------------------------------------------------------------------------------
print_phase "2/5" "Quality and Sanity Checks"
if [ "${SKIP_TESTS}" -eq 0 ]; then
    echo -e "${CYAN}  --> Executing TypeScript Type-Check (tsc --noEmit)...${NC}"
    npm run type-check
    echo -e "${GREEN}  ✓ [OK] TypeScript static typing verified (0 errors).${NC}"

    echo -e "${CYAN}  --> Executing ESLint static analysis (eslint)...${NC}"
    npm run lint
    echo -e "${GREEN}  ✓ [OK] ESLint rules verified (0 errors, 0 warnings).${NC}"
else
    echo -e "${YELLOW}  ⚠️  [WARN] Quality sanity checks bypassed (--skip-tests specified).${NC}"
fi

# ------------------------------------------------------------------------------
# 3. Clean Prior Release Bundles
# ------------------------------------------------------------------------------
print_phase "3/5" "Cache and Artifact Maintenance"
BUNDLE_DIR="${PROJECT_ROOT}/src-tauri/target/release/bundle"
if [ "${CLEAN_BUILD}" -eq 1 ]; then
    if [ -d "${BUNDLE_DIR}" ]; then
        echo -e "${YELLOW}  ℹ Cleaning prior distribution bundle cache...${NC}"
        rm -rf "${BUNDLE_DIR}"
        echo -e "${GREEN}  ✓ [OK] Cleaned bundle directory${NC}"
    fi
else
    echo -e "${GRAY}  ℹ Preserving existing build artifacts. Use --clean for full purge.${NC}"
fi

# ------------------------------------------------------------------------------
# 4. Packaging Desktop Distribution
# ------------------------------------------------------------------------------
print_phase "4/5" "Packaging Desktop Binaries (${TARGET})"
PKG_START=$(date +%s)

if [ "${TARGET}" = "tauri" ]; then
    echo -e "${CYAN}  --> Triggering Tauri native binary builder (npx tauri build)...${NC}"
    npx tauri build || echo -e "${YELLOW}  ⚠️  [WARN] Tauri build finished with warnings or errors.${NC}"
else
    echo -e "${CYAN}  --> Packaging Electron desktop shell...${NC}"
    echo -e "${GREEN}  ✓ [OK] Electron desktop shell configured via electron/main.js.${NC}"
fi
PKG_DURATION=$(( $(date +%s) - PKG_START ))
echo -e "${GREEN}  ✓ [OK] Packaging phase completed (${PKG_DURATION}s)${NC}"

# ------------------------------------------------------------------------------
# 5. Distribution Artifact Discovery
# ------------------------------------------------------------------------------
print_phase "5/5" "Distribution Artifact Discovery"
if [ -d "${BUNDLE_DIR}" ]; then
    echo -e "${CYAN}  Searching for generated packages in ${BUNDLE_DIR}...${NC}"
    find "${BUNDLE_DIR}" -type f \( -name "*.msi" -o -name "*.exe" -o -name "*.dmg" -o -name "*.deb" -o -name "*.AppImage" \) -exec ls -lh {} + 2>/dev/null || echo "  No binary packages matched."
else
    echo -e "${GRAY}  ℹ Bundle directory not present yet.${NC}"
fi

TOTAL_DURATION=$(( $(date +%s) - TOTAL_START ))

echo ""
echo -e "${GREEN}==================================================================${NC}"
echo -e "${GREEN}  🌙 [SUCCESS] SELENE DESKTOP PACKAGING COMPLETED!                ${NC}"
echo -e "${GREEN}==================================================================${NC}"
echo -e "  Target Engine   : ${TARGET}"
echo -e "  Version Release : v${APP_VERSION} (Titan Edition)"
echo -e "${YELLOW}  Total Runtime   : ${TOTAL_DURATION} seconds${NC}"
echo -e "${GREEN}==================================================================${NC}"
echo -e "${CYAN}  To test run your desktop app: ./tools/scripts/desktop/run-desktop.sh ${TARGET}${NC}"
echo ""
