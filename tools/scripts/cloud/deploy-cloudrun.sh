#!/usr/bin/env bash
# ==============================================================================
# 🌙 Selene — Google Cloud Run Production Deployment Suite (Bash)
# Location: tools/scripts/cloud/deploy-cloudrun.sh
# Compatible with: Linux, macOS, WSL, and Cygwin
# ==============================================================================

set -euo pipefail

TOTAL_START=$(date +%s)

# Default Configuration Parameters
PROJECT_ID="indoctrinated-licensor"
REGION="us-central1"
SERVICE_NAME="selene"
BACKEND_SECRET=""
DATABASE_URL=""
DATABASE_TOKEN=""
CPU="1"
MEMORY="1Gi"
MIN_INSTANCES="0"
MAX_INSTANCES="10"
SKIP_TESTS=0
DRY_RUN=0
VERBOSE=0

# CLI Argument Parsing
while [[ $# -gt 0 ]]; do
    case "$1" in
        -p|--project)
            PROJECT_ID="$2"
            shift 2
            ;;
        -r|--region)
            REGION="$2"
            shift 2
            ;;
        -s|--service)
            SERVICE_NAME="$2"
            shift 2
            ;;
        --secret)
            BACKEND_SECRET="$2"
            shift 2
            ;;
        --db-url)
            DATABASE_URL="$2"
            shift 2
            ;;
        --db-token)
            DATABASE_TOKEN="$2"
            shift 2
            ;;
        --cpu)
            CPU="$2"
            shift 2
            ;;
        --memory)
            MEMORY="$2"
            shift 2
            ;;
        --min-instances)
            MIN_INSTANCES="$2"
            shift 2
            ;;
        --max-instances)
            MAX_INSTANCES="$2"
            shift 2
            ;;
        --skip-tests)
            SKIP_TESTS=1
            shift
            ;;
        --dry-run)
            DRY_RUN=1
            shift
            ;;
        -v|--verbose)
            VERBOSE=1
            shift
            ;;
        -h|--help)
            echo "🌙 Selene — Google Cloud Run Production Deployment Suite"
            echo ""
            echo "USAGE: ./tools/scripts/cloud/deploy-cloudrun.sh [FLAGS]"
            echo ""
            echo "FLAGS:"
            echo "  -p, --project ID        Target GCP Project ID (Default: indoctrinated-licensor)"
            echo "  -r, --region REGION     Target GCP Region (Default: us-central1)"
            echo "  -s, --service NAME      Cloud Run Service Name (Default: selene)"
            echo "      --secret SECRET     Custom client attestation backend secret"
            echo "      --db-url URL        Remote LibSQL / Turso database URL"
            echo "      --db-token TOKEN    Database authentication token"
            echo "      --cpu CORES         Allocated vCPU cores (Default: 1)"
            echo "      --memory RAM        Allocated RAM (Default: 1Gi)"
            echo "      --min-instances N   Minimum instances (Default: 0 for scale-to-zero)"
            echo "      --max-instances N   Maximum instances (Default: 10)"
            echo "      --skip-tests        Bypass pre-flight type-check and linting"
            echo "      --dry-run           Preview deployment parameters without invoking gcloud"
            echo "  -v, --verbose           Enable verbose output"
            echo "  -h, --help              Display this help manual"
            exit 0
            ;;
        *)
            echo "Unknown argument: $1"
            echo "Use --help for usage instructions."
            exit 1
            ;;
    esac
done

# Resolve paths
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../../.." && pwd)"
cd "${PROJECT_ROOT}"

# Color codes
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
GRAY='\033[0;90m'
NC='\033[0m'

# Read App Version
APP_VERSION="0.5.0"
if [ -f "${PROJECT_ROOT}/package.json" ]; then
    APP_VERSION=$(node -e "console.log(require('./package.json').version || '0.5.0')" 2>/dev/null || echo "0.5.0")
fi

GIT_BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo 'unknown')"
GIT_COMMIT="$(git rev-parse --short HEAD 2>/dev/null || echo 'unknown')"

echo ""
echo -e "${CYAN}==================================================================${NC}"
echo -e "${CYAN}  🌙 SELENE — Google Cloud Run Production Deployment Suite        ${NC}"
echo -e "${CYAN}==================================================================${NC}"
echo -e "  Target Release : Selene v${APP_VERSION} (Titan Edition)"
echo -e "${GRAY}  Source Path    : ${PROJECT_ROOT}${NC}"
echo -e "${GRAY}  Git Metadata   : ${GIT_BRANCH} (${GIT_COMMIT})${NC}"
echo -e "${YELLOW}  Target Project : ${PROJECT_ID}${NC}"
echo -e "${YELLOW}  Service Name   : ${SERVICE_NAME}${NC}"
echo -e "${YELLOW}  Compute Region : ${REGION}${NC}"
echo -e "${GRAY}  Sizing Specs   : ${CPU} vCPU / ${MEMORY} RAM / Scale: ${MIN_INSTANCES} to ${MAX_INSTANCES}${NC}"
if [ "${DRY_RUN}" -eq 1 ]; then
    echo -e "${YELLOW}  Dry Run Mode   : ACTIVE (No Cloud Run Changes)${NC}"
else
    echo -e "${GRAY}  Dry Run Mode   : Disabled${NC}"
fi
echo -e "${CYAN}==================================================================${NC}"

print_phase() {
    echo ""
    echo -e "${CYAN}------------------------------------------------------------------${NC}"
    echo -e "${YELLOW}  [$1] $2${NC}"
    echo -e "${CYAN}------------------------------------------------------------------${NC}"
}

# ------------------------------------------------------------------------------
# 1. Google Cloud SDK and Account Verification
# ------------------------------------------------------------------------------
print_phase "1/5" "Google Cloud SDK and Account Verification"
if ! command -v gcloud >/dev/null 2>&1; then
    echo -e "${RED}  ❌ [FAIL] Google Cloud SDK (gcloud) is not installed or not in PATH.${NC}"
    exit 1
fi
GCLOUD_VER=$(gcloud --version 2>&1 | head -n 1)
echo -e "${GREEN}  ✓ [OK] gcloud CLI verified: ${GCLOUD_VER}${NC}"

ACTIVE_ACCOUNT=$(gcloud auth list --filter='status:ACTIVE' --format='value(account)' 2>/dev/null || echo '')
if [ -n "${ACTIVE_ACCOUNT}" ]; then
    echo -e "${GREEN}  ✓ [OK] Active GCP Identity: ${ACTIVE_ACCOUNT}${NC}"
else
    echo -e "${YELLOW}  ⚠️  [WARN] No active account found in gcloud. Run 'gcloud auth login' if deployment fails.${NC}"
fi

if [ -z "${PROJECT_ID}" ] || [ "${PROJECT_ID}" = "(unset)" ]; then
    PROJECT_ID=$(gcloud config get-value project 2>/dev/null || echo '')
fi

if [ -z "${PROJECT_ID}" ] || [ "${PROJECT_ID}" = "(unset)" ]; then
    echo -e "${RED}  ❌ [FAIL] No GCP project specified or set in active gcloud config. Pass --project <ID>.${NC}"
    exit 1
fi
echo -e "${GREEN}  ✓ [OK] Confirmed GCP Project ID: ${PROJECT_ID}${NC}"

# ------------------------------------------------------------------------------
# 2. Quality and Sanity Pre-Flight Verification
# ------------------------------------------------------------------------------
print_phase "2/5" "Quality and Sanity Pre-Flight Verification"
if [ "${SKIP_TESTS}" -eq 0 ]; then
    echo -e "${CYAN}  --> Executing TypeScript Type-Check (tsc --noEmit)...${NC}"
    npm run type-check
    echo -e "${GREEN}  ✓ [OK] TypeScript static typing verified.${NC}"

    echo -e "${CYAN}  --> Executing ESLint static analysis (eslint)...${NC}"
    npm run lint
    echo -e "${GREEN}  ✓ [OK] ESLint lint rules verified.${NC}"
else
    echo -e "${YELLOW}  ⚠️  [WARN] Pre-flight sanity checks bypassed (--skip-tests).${NC}"
fi

# ------------------------------------------------------------------------------
# 3. Configuring Environment Variables and Secrets
# ------------------------------------------------------------------------------
print_phase "3/5" "Configuring Environment Variables and Secrets"
ENV_LIST=(
    "NODE_ENV=production"
    "NEXT_TELEMETRY_DISABLED=1"
    "LICENSOR_SERVER_URL=https://licensor-h5zdysrkqa-uc.a.run.app"
)

if [ -n "${BACKEND_SECRET}" ]; then
    echo -e "${GRAY}  ℹ Injecting Custom Backend Secret [MASKED]${NC}"
    ENV_LIST+=("SELENE_BACKEND_SECRET=${BACKEND_SECRET}")
else
    echo -e "${GRAY}  ℹ Using built-in Cryptographic Attestation Secret${NC}"
fi

if [ -n "${DATABASE_URL}" ]; then
    echo -e "${GRAY}  ℹ Configuring Remote LibSQL Database: ${DATABASE_URL}${NC}"
    ENV_LIST+=("DATABASE_URL=${DATABASE_URL}")
else
    echo -e "${GRAY}  ℹ Using Container Serverless SQLite persistence (/tmp/selene.db)$NC"
fi

if [ -n "${DATABASE_TOKEN}" ]; then
    echo -e "${GRAY}  ℹ Configuring Database Auth Token [MASKED]${NC}"
    ENV_LIST+=("DATABASE_AUTH_TOKEN=${DATABASE_TOKEN}")
fi

ENV_VARS_STRING=$(IFS=, ; echo "${ENV_LIST[*]}")
echo -e "${GREEN}  ✓ [OK] Configured ${#ENV_LIST[@]} production environment variables${NC}"

# ------------------------------------------------------------------------------
# 4. Compiling Container via Cloud Build and Deploying
# ------------------------------------------------------------------------------
print_phase "4/5" "Compiling Container via Cloud Build and Deploying"

DEPLOY_CMD=(
    gcloud run deploy "${SERVICE_NAME}"
    --source .
    --project "${PROJECT_ID}"
    --region "${REGION}"
    --platform managed
    --allow-unauthenticated
    --port 8080
    --memory "${MEMORY}"
    --cpu "${CPU}"
    --min-instances "${MIN_INSTANCES}"
    --max-instances "${MAX_INSTANCES}"
    --set-env-vars "${ENV_VARS_STRING}"
)

if [ "${DRY_RUN}" -eq 1 ]; then
    echo -e "${YELLOW}  ⚠️  [DRY-RUN] Command that would be executed:${NC}"
    echo -e "${GRAY}  ${DEPLOY_CMD[*]}${NC}"
    echo -e "${GREEN}  ✓ [OK] Dry-run check completed successfully. Exiting.${NC}"
    exit 0
fi

echo -e "${GRAY}  ℹ Submitting build context to Google Cloud Build...${NC}"
echo -e "${GRAY}  ℹ Google Cloud Build will parse Dockerfile and compile Next.js standalone image.${NC}"
echo -e "${GRAY}  ℹ Estimated execution time: 2-3 minutes...${NC}"

DEPLOY_START=$(date +%s)
"${DEPLOY_CMD[@]}"
DEPLOY_DURATION=$(( $(date +%s) - DEPLOY_START ))
echo -e "${GREEN}  ✓ [OK] Cloud Run service deployment completed (${DEPLOY_DURATION}s)${NC}"

# ------------------------------------------------------------------------------
# 5. Live Health Probe and Telemetry Verification
# ------------------------------------------------------------------------------
print_phase "5/5" "Live Health Probe and Telemetry Verification"

SERVICE_URL=$(gcloud run services describe "${SERVICE_NAME}" --project "${PROJECT_ID}" --region "${REGION}" --format='value(status.url)' 2>/dev/null || echo '')
ACTIVE_REVISION=$(gcloud run services describe "${SERVICE_NAME}" --project "${PROJECT_ID}" --region "${REGION}" --format='value(status.latestReadyRevisionName)' 2>/dev/null || echo '')
TOTAL_DURATION=$(( $(date +%s) - TOTAL_START ))

if [ -n "${SERVICE_URL}" ]; then
    echo ""
    echo -e "${GREEN}==================================================================${NC}"
    echo -e "${GREEN}  🌙 [SUCCESS] SELENE CLOUD RUN DEPLOYMENT LIVE!                 ${NC}"
    echo -e "${GREEN}==================================================================${NC}"
    echo -e "  Application      : Selene v${APP_VERSION} (Titan Edition)"
    echo -e "${CYAN}  Active Revision  : ${ACTIVE_REVISION}${NC}"
    echo -e "${CYAN}  Live Service URL : ${SERVICE_URL}${NC}"
    echo -e "${CYAN}  Health Endpoint  : ${SERVICE_URL}/api/health${NC}"
    echo -e "${YELLOW}  Total Deploy Time: ${TOTAL_DURATION} seconds${NC}"
    echo -e "${CYAN}------------------------------------------------------------------${NC}"

    echo -e "${CYAN}  --> Dispatching HTTP probe to ${SERVICE_URL}/api/health...${NC}"
    if command -v curl >/dev/null 2>&1; then
        HEALTH_OUT=$(curl -s --max-time 15 "${SERVICE_URL}/api/health" || echo '')
        if echo "${HEALTH_OUT}" | grep -q '"status":"ok"'; then
            echo -e "${GREEN}  ✓ [OK] Health check probe responded OK!${NC}"
            echo -e "${GRAY}  ℹ Response Payload: ${HEALTH_OUT}${NC}"
        else
            echo -e "${YELLOW}  ⚠️  [WARN] Health check did not return status:ok immediately.${NC}"
        fi
    fi
    echo -e "${GREEN}==================================================================${NC}"
    echo ""
else
    echo -e "${YELLOW}  ⚠️  [WARN] Could not automatically resolve Cloud Run URL. Check Google Cloud Console.${NC}"
fi
