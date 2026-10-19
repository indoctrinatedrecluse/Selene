/**
 * Selene Canonical Version & Release Metadata
 * Single source of truth for versioning across client components,
 * API routes, splash screens, and licensing telemetry.
 */

export const APP_VERSION = "0.4.0";
export const APP_NAME = "Selene";
export const APP_EDITION = "Titan Edition";
export const APP_VERSION_TAG = `v${APP_VERSION}`;
export const APP_FULL_TITLE = `${APP_NAME} ${APP_VERSION_TAG} — ${APP_EDITION}`;

// Semantic and display aliases
export const SELENE_VERSION = APP_VERSION;
export const SELENE_EDITION = APP_EDITION;
export const SELENE_VERSION_DISPLAY = APP_VERSION_TAG;
export const SELENE_EDITION_DISPLAY = `${APP_EDITION} • ${APP_VERSION_TAG}`;
