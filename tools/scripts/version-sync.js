#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Selene Universal Version Synchronizer
 * 
 * Ensures the single source of truth version in package.json / src/lib/version.ts
 * is synchronously propagated across:
 *   - src/lib/version.ts
 *   - src-tauri/tauri.conf.json
 *   - src-tauri/Cargo.toml
 *   - desktop-dist/index.html
 *   - electron/splash.html
 *   - package-lock.json
 */

const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '../..');
const pkgPath = path.join(rootDir, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

// Allow passing new version as CLI argument, otherwise use package.json version
const targetVersion = process.argv[2] ? process.argv[2].replace(/^v/, '') : pkg.version;

console.log(`\n🌙 Synchronizing Selene global version: v${targetVersion}...`);

// 1. Update package.json if changed
if (pkg.version !== targetVersion) {
  pkg.version = targetVersion;
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
  console.log(`  [OK] package.json -> ${targetVersion}`);
} else {
  console.log(`  [OK] package.json already at ${targetVersion}`);
}

// 2. Update src/lib/version.ts
const versionTsPath = path.join(rootDir, 'src/lib/version.ts');
const versionTsContent = `/**
 * Selene Canonical Version & Release Metadata
 * Single source of truth for versioning across client components,
 * API routes, splash screens, and licensing telemetry.
 */

export const APP_VERSION = "${targetVersion}";
export const APP_NAME = "Selene";
export const APP_EDITION = "Titan Edition";
export const APP_VERSION_TAG = \`v\${APP_VERSION}\`;
export const APP_FULL_TITLE = \`\${APP_NAME} \${APP_VERSION_TAG} — \${APP_EDITION}\`;

// Semantic and display aliases
export const SELENE_VERSION = APP_VERSION;
export const SELENE_EDITION = APP_EDITION;
export const SELENE_VERSION_DISPLAY = APP_VERSION_TAG;
export const SELENE_EDITION_DISPLAY = \`\${APP_EDITION} • \${APP_VERSION_TAG}\`;
`;
fs.writeFileSync(versionTsPath, versionTsContent, 'utf8');
console.log(`  [OK] src/lib/version.ts -> v${targetVersion}`);

// 3. Update src-tauri/tauri.conf.json
const tauriConfPath = path.join(rootDir, 'src-tauri/tauri.conf.json');
if (fs.existsSync(tauriConfPath)) {
  const tauriConf = JSON.parse(fs.readFileSync(tauriConfPath, 'utf8'));
  tauriConf.version = targetVersion;
  fs.writeFileSync(tauriConfPath, JSON.stringify(tauriConf, null, 2) + '\n', 'utf8');
  console.log(`  [OK] src-tauri/tauri.conf.json -> ${targetVersion}`);
}

// 4. Update src-tauri/Cargo.toml
const cargoTomlPath = path.join(rootDir, 'src-tauri/Cargo.toml');
if (fs.existsSync(cargoTomlPath)) {
  let cargoContent = fs.readFileSync(cargoTomlPath, 'utf8');
  cargoContent = cargoContent.replace(
    /(\[package\][\s\S]*?version\s*=\s*")[^"]+(")/,
    `$1${targetVersion}$2`
  );
  fs.writeFileSync(cargoTomlPath, cargoContent, 'utf8');
  console.log(`  [OK] src-tauri/Cargo.toml -> ${targetVersion}`);
}

// 5. Update desktop-dist/index.html (Tauri splash / fallback screen)
const desktopDistPath = path.join(rootDir, 'desktop-dist/index.html');
if (fs.existsSync(desktopDistPath)) {
  let html = fs.readFileSync(desktopDistPath, 'utf8');
  html = html.replace(
    /<h1>Selene <span>v[^<]+<\/span><\/h1>/g,
    `<h1>Selene <span>v${targetVersion}</span></h1>`
  );
  fs.writeFileSync(desktopDistPath, html, 'utf8');
  console.log(`  [OK] desktop-dist/index.html -> v${targetVersion}`);
}

// 6. Update electron/splash.html
const electronSplashPath = path.join(rootDir, 'electron/splash.html');
if (fs.existsSync(electronSplashPath)) {
  let html = fs.readFileSync(electronSplashPath, 'utf8');
  html = html.replace(
    /<h1>Selene <span>v[^<]+<\/span><\/h1>/g,
    `<h1>Selene <span>v${targetVersion}</span></h1>`
  );
  fs.writeFileSync(electronSplashPath, html, 'utf8');
  console.log(`  [OK] electron/splash.html -> v${targetVersion}`);
}

// 7. Update package-lock.json
const pkgLockPath = path.join(rootDir, 'package-lock.json');
if (fs.existsSync(pkgLockPath)) {
  const pkgLock = JSON.parse(fs.readFileSync(pkgLockPath, 'utf8'));
  pkgLock.version = targetVersion;
  if (pkgLock.packages && pkgLock.packages['']) {
    pkgLock.packages[''].version = targetVersion;
  }
  fs.writeFileSync(pkgLockPath, JSON.stringify(pkgLock, null, 2) + '\n', 'utf8');
  console.log(`  [OK] package-lock.json -> ${targetVersion}`);
}

// 8. Update .github/workflows/release.yml
const releaseYmlPath = path.join(rootDir, '.github/workflows/release.yml');
if (fs.existsSync(releaseYmlPath)) {
  let yml = fs.readFileSync(releaseYmlPath, 'utf8');
  yml = yml.replace(
    /(description:\s*'Release version tag \(e\.g\. v)[^)]+(\)')/,
    `$1${targetVersion}$2`
  ).replace(
    /(default:\s*'v)[^']+(\')/,
    `$1${targetVersion}$2`
  );
  fs.writeFileSync(releaseYmlPath, yml, 'utf8');
  console.log(`  [OK] .github/workflows/release.yml -> v${targetVersion}`);
}

// 9. Update README.md badge and instructions
const readmePath = path.join(rootDir, 'README.md');
if (fs.existsSync(readmePath)) {
  let readme = fs.readFileSync(readmePath, 'utf8');
  readme = readme.replace(
    /Release-v[0-9.]+\(Titan_Edition\)/g,
    `Release-v${targetVersion}_(Titan_Edition)`
  ).replace(
    /git tag -a v[0-9.]+ -m/g,
    `git tag -a v${targetVersion} -m`
  ).replace(
    /git push origin v[0-9.]+/g,
    `git push origin v${targetVersion}`
  );
  fs.writeFileSync(readmePath, readme, 'utf8');
  console.log(`  [OK] README.md -> v${targetVersion}`);
}

// 10. Update electron/main.js fallback version
const electronMainPath = path.join(rootDir, 'electron/main.js');
if (fs.existsSync(electronMainPath)) {
  let mainJs = fs.readFileSync(electronMainPath, 'utf8');
  mainJs = mainJs.replace(
    /app\.getVersion\(\) \|\| "[0-9.]+"/g,
    `app.getVersion() || "${targetVersion}"`
  );
  fs.writeFileSync(electronMainPath, mainJs, 'utf8');
  console.log(`  [OK] electron/main.js -> v${targetVersion}`);
}

console.log(`✨ All Selene version references synchronized to v${targetVersion} successfully.\n`);
