#!/usr/bin/env bash
# Selene Automated Production Google Cloud Run Deployment Script (Bash)
set -euo pipefail

SERVICE_NAME="${1:-selene-backend}"
REGION="${2:-us-central1}"
PROJECT_ID="${3:-$(gcloud config get-value project 2>/dev/null)}"

echo "=========================================================="
echo "  🌙 Selene — Google Cloud Run Production Deployment      "
echo "=========================================================="
echo "  Service Name : $SERVICE_NAME"
echo "  Region       : $REGION"
echo "  Project ID   : $PROJECT_ID"

if [ -z "$PROJECT_ID" ] || [ "$PROJECT_ID" = "(unset)" ]; then
  echo "Error: No Google Cloud Project ID configured. Set via 'gcloud config set project <ID>'."
  exit 1
fi

echo "--> [1/4] Running Quality & Sanity Verification..."
npm run type-check
npm run lint

echo "--> [2/4] Deploying to Google Cloud Run via Cloud Build..."
gcloud run deploy "$SERVICE_NAME" \
  --source . \
  --project "$PROJECT_ID" \
  --region "$REGION" \
  --platform managed \
  --allow-unauthenticated \
  --port 8080 \
  --memory 1Gi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --set-env-vars "NODE_ENV=production,NEXT_TELEMETRY_DISABLED=1,LICENSOR_SERVER_URL=https://licensor-h5zdysrkqa-uc.a.run.app"

echo "--> [3/4] Fetching Service URL..."
SERVICE_URL=$(gcloud run services describe "$SERVICE_NAME" --project "$PROJECT_ID" --region "$REGION" --format "value(status.url)" 2>/dev/null || echo "")

echo "=========================================================="
echo "  🌙 DEPLOYMENT COMPLETE!                                 "
echo "  Live URL: $SERVICE_URL                                  "
echo "  Health:   $SERVICE_URL/api/health                       "
echo "=========================================================="
