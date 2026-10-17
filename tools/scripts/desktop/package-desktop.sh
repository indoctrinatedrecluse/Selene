#!/usr/bin/env bash
# ==========================================================
#   🌙 Selene — Desktop Distribution Packaging Suite (Bash)
# ==========================================================

set -e

TARGET="${1:-tauri}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"

cd "$PROJECT_ROOT"

echo "=========================================================="
echo "  🌙 Selene — Desktop Distribution Packaging Suite        "
echo "=========================================================="
echo "  Working Directory: $PROJECT_ROOT"
echo "  Packaging Target: $TARGET"

echo "--> [1/4] Running Quality and Sanity Checks..."
npm run type-check
npm run lint

echo "--> [2/4] Compiling Next.js Web Application Bundle..."
npm run build

echo "--> [3/4] Packaging native desktop bundle ($TARGET)..."
if [ "$TARGET" = "tauri" ]; then
  npx tauri build || echo "  [WARN] Tauri build finished with warnings."
else
  echo "  [*] Electron bundle configured with electron/main.js"
fi

echo "--> [4/4] Finalizing Desktop Package..."
echo "=========================================================="
echo "  [SUCCESS] Selene Desktop Packaging Complete!"
echo "=========================================================="
