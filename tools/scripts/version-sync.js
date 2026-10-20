#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * ==============================================================================
 * 🌙 Selene Universal Version Synchronizer
 * File: tools/scripts/version-sync.js
 * ==============================================================================
 * Single source of truth version synchronizer. Propagates canonical semantic
 * versions across the entire repository to eliminate drift across web, desktop,
 * and deployment targets:
 *   1. package.json
 *   2. src/lib/version.ts
 *   3. src-tauri/tauri.conf.json
 *   4. src-tauri/Cargo.toml
 *   5. desktop-dist/index.html
 *   6. electron/splash.html
 *   7. package-lock.json
 *   8. .github/workflows/release.yml
 *   9. README.md
 *  10. electron/main.js
 * ==============================================================================
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const startTime = Date.now();
const rootDir = path.resolve(__dirname, '../..');
const pkgPath = path.join(rootDir, 'package.json');

// Parse CLI arguments
const rawArgs = process.argv.slice(2);
const isHelp = rawArgs.includes('--help') || rawArgs.includes('-h');
const isDryRun = rawArgs.includes('--dry-run') || rawArgs.includes('-n');
const isVerbose = rawArgs.includes('--verbose') || rawArgs.includes('-v');
const versionArg = rawArgs.find(arg => !arg.startsWith('-'));

if (isHelp) {
  console.log(`
🌙 Selene Universal Version Synchronizer

USAGE:
  node tools/scripts/version-sync.js [VERSION] [FLAGS]

ARGUMENTS:
  [VERSION]           Target semantic version (e.g. 0.4.0 or v0.4.0).
                      If omitted, reads current version from package.json.

FLAGS:
  --dry-run, -n       Preview target changes without modifying files on disk.
  --verbose, -v       Display detailed before/after diffs and file telemetry.
  --help, -h          Display this help information.

EXAMPLES:
  node tools/scripts/version-sync.js              # Sync all files to package.json version
  node tools/scripts/version-sync.js 0.5.0        # Bump and propagate v0.5.0 everywhere
  node tools/scripts/version-sync.js 0.5.0 -n     # Dry-run preview bump to v0.5.0
`);
  process.exit(0);
}

// Read base package.json
if (!fs.existsSync(pkgPath)) {
  console.error(`❌ [ERROR] Root package.json not found at: ${pkgPath}`);
  process.exit(1);
}

const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const currentVersion = pkg.version;
const targetVersion = versionArg ? versionArg.replace(/^v/, '').trim() : currentVersion;

// Git Metadata (Safe discovery)
let gitBranch = 'unknown';
let gitCommit = 'unknown';
try {
  gitBranch = execSync('git rev-parse --abbrev-ref HEAD', { cwd: rootDir, stdio: ['pipe', 'pipe', 'ignore'] }).toString().trim();
  gitCommit = execSync('git rev-parse --short HEAD', { cwd: rootDir, stdio: ['pipe', 'pipe', 'ignore'] }).toString().trim();
} catch {
  // Git metadata optional
}

console.log('\n' + '='.repeat(64));
console.log('  🌙 Selene — Universal Version Synchronizer');
console.log('='.repeat(64));
console.log(`  Root Directory : ${rootDir}`);
console.log(`  Git Branch/Rev : ${gitBranch} (${gitCommit})`);
console.log(`  Current Version: v${currentVersion}`);
console.log(`  Target Version : v${targetVersion}${isDryRun ? ' [DRY-RUN - NO DISK WRITE]' : ''}`);
console.log(`  Verbose Mode   : ${isVerbose ? 'ENABLED' : 'STANDARD'}`);
console.log('='.repeat(64) + '\n');

const results = [];

function recordResult(targetName, relPath, status, previousVer, updatedVer, details = '') {
  results.push({
    name: targetName,
    path: relPath,
    status,
    prev: previousVer,
    next: updatedVer,
    details
  });
}

// -----------------------------------------------------------------------------
// 1. package.json
// -----------------------------------------------------------------------------
try {
  const prev = pkg.version;
  if (prev !== targetVersion) {
    if (!isDryRun) {
      pkg.version = targetVersion;
      fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
    }
    recordResult('package.json', 'package.json', 'UPDATED', prev, targetVersion, 'Root npm configuration');
  } else {
    recordResult('package.json', 'package.json', 'IN_SYNC', prev, prev, 'Already at target version');
  }
} catch (err) {
  recordResult('package.json', 'package.json', 'FAILED', 'unknown', targetVersion, err.message);
}

// -----------------------------------------------------------------------------
// 2. src/lib/version.ts
// -----------------------------------------------------------------------------
try {
  const versionTsPath = path.join(rootDir, 'src/lib/version.ts');
  const prevContent = fs.existsSync(versionTsPath) ? fs.readFileSync(versionTsPath, 'utf8') : '';
  const prevMatch = prevContent.match(/export const APP_VERSION = "([^"]+)";/);
  const prevVer = prevMatch ? prevMatch[1] : 'unknown';

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

  if (prevVer !== targetVersion || prevContent !== versionTsContent) {
    if (!isDryRun) {
      fs.writeFileSync(versionTsPath, versionTsContent, 'utf8');
    }
    recordResult('TypeScript API', 'src/lib/version.ts', 'UPDATED', prevVer, targetVersion, 'Exports APP_VERSION and metadata');
  } else {
    recordResult('TypeScript API', 'src/lib/version.ts', 'IN_SYNC', prevVer, prevVer, 'Already canonical');
  }
} catch (err) {
  recordResult('TypeScript API', 'src/lib/version.ts', 'FAILED', 'unknown', targetVersion, err.message);
}

// -----------------------------------------------------------------------------
// 3. src-tauri/tauri.conf.json
// -----------------------------------------------------------------------------
try {
  const tauriConfPath = path.join(rootDir, 'src-tauri/tauri.conf.json');
  if (fs.existsSync(tauriConfPath)) {
    const tauriConf = JSON.parse(fs.readFileSync(tauriConfPath, 'utf8'));
    const prev = tauriConf.version || 'unknown';
    if (prev !== targetVersion) {
      if (!isDryRun) {
        tauriConf.version = targetVersion;
        fs.writeFileSync(tauriConfPath, JSON.stringify(tauriConf, null, 2) + '\n', 'utf8');
      }
      recordResult('Tauri Config', 'src-tauri/tauri.conf.json', 'UPDATED', prev, targetVersion, 'Tauri desktop application manifest');
    } else {
      recordResult('Tauri Config', 'src-tauri/tauri.conf.json', 'IN_SYNC', prev, prev, 'Matches target version');
    }
  } else {
    recordResult('Tauri Config', 'src-tauri/tauri.conf.json', 'SKIPPED', 'N/A', 'N/A', 'File not found');
  }
} catch (err) {
  recordResult('Tauri Config', 'src-tauri/tauri.conf.json', 'FAILED', 'unknown', targetVersion, err.message);
}

// -----------------------------------------------------------------------------
// 4. src-tauri/Cargo.toml
// -----------------------------------------------------------------------------
try {
  const cargoTomlPath = path.join(rootDir, 'src-tauri/Cargo.toml');
  if (fs.existsSync(cargoTomlPath)) {
    let cargoContent = fs.readFileSync(cargoTomlPath, 'utf8');
    const match = cargoContent.match(/\[package\][\s\S]*?version\s*=\s*"([^"]+)"/);
    const prev = match ? match[1] : 'unknown';
    if (prev !== targetVersion) {
      cargoContent = cargoContent.replace(
        /(\[package\][\s\S]*?version\s*=\s*")[^"]+(")/,
        `$1${targetVersion}$2`
      );
      if (!isDryRun) {
        fs.writeFileSync(cargoTomlPath, cargoContent, 'utf8');
      }
      recordResult('Cargo Manifest', 'src-tauri/Cargo.toml', 'UPDATED', prev, targetVersion, 'Rust crate package version');
    } else {
      recordResult('Cargo Manifest', 'src-tauri/Cargo.toml', 'IN_SYNC', prev, prev, 'Matches target version');
    }
  } else {
    recordResult('Cargo Manifest', 'src-tauri/Cargo.toml', 'SKIPPED', 'N/A', 'N/A', 'File not found');
  }
} catch (err) {
  recordResult('Cargo Manifest', 'src-tauri/Cargo.toml', 'FAILED', 'unknown', targetVersion, err.message);
}

// -----------------------------------------------------------------------------
// 5. desktop-dist/index.html
// -----------------------------------------------------------------------------
try {
  const desktopDistPath = path.join(rootDir, 'desktop-dist/index.html');
  if (fs.existsSync(desktopDistPath)) {
    let html = fs.readFileSync(desktopDistPath, 'utf8');
    const match = html.match(/<h1>Selene <span>v([^<]+)<\/span><\/h1>/);
    const prev = match ? match[1] : 'unknown';
    if (prev !== targetVersion) {
      html = html.replace(
        /<h1>Selene <span>v[^<]+<\/span><\/h1>/g,
        `<h1>Selene <span>v${targetVersion}</span></h1>`
      );
      if (!isDryRun) {
        fs.writeFileSync(desktopDistPath, html, 'utf8');
      }
      recordResult('Desktop Dist HTML', 'desktop-dist/index.html', 'UPDATED', prev, targetVersion, 'Tauri splash fallback HTML');
    } else {
      recordResult('Desktop Dist HTML', 'desktop-dist/index.html', 'IN_SYNC', prev, prev, 'Matches target version');
    }
  } else {
    recordResult('Desktop Dist HTML', 'desktop-dist/index.html', 'SKIPPED', 'N/A', 'N/A', 'File not found');
  }
} catch (err) {
  recordResult('Desktop Dist HTML', 'desktop-dist/index.html', 'FAILED', 'unknown', targetVersion, err.message);
}

// -----------------------------------------------------------------------------
// 6. electron/splash.html
// -----------------------------------------------------------------------------
try {
  const electronSplashPath = path.join(rootDir, 'electron/splash.html');
  if (fs.existsSync(electronSplashPath)) {
    let html = fs.readFileSync(electronSplashPath, 'utf8');
    const match = html.match(/<h1>Selene <span>v([^<]+)<\/span><\/h1>/);
    const prev = match ? match[1] : 'unknown';
    if (prev !== targetVersion) {
      html = html.replace(
        /<h1>Selene <span>v[^<]+<\/span><\/h1>/g,
        `<h1>Selene <span>v${targetVersion}</span></h1>`
      );
      if (!isDryRun) {
        fs.writeFileSync(electronSplashPath, html, 'utf8');
      }
      recordResult('Electron Splash', 'electron/splash.html', 'UPDATED', prev, targetVersion, 'Electron boot splash window');
    } else {
      recordResult('Electron Splash', 'electron/splash.html', 'IN_SYNC', prev, prev, 'Matches target version');
    }
  } else {
    recordResult('Electron Splash', 'electron/splash.html', 'SKIPPED', 'N/A', 'N/A', 'File not found');
  }
} catch (err) {
  recordResult('Electron Splash', 'electron/splash.html', 'FAILED', 'unknown', targetVersion, err.message);
}

// -----------------------------------------------------------------------------
// 7. package-lock.json
// -----------------------------------------------------------------------------
try {
  const pkgLockPath = path.join(rootDir, 'package-lock.json');
  if (fs.existsSync(pkgLockPath)) {
    const pkgLock = JSON.parse(fs.readFileSync(pkgLockPath, 'utf8'));
    const prev = pkgLock.version || 'unknown';
    let changed = false;
    if (prev !== targetVersion) {
      pkgLock.version = targetVersion;
      changed = true;
    }
    if (pkgLock.packages && pkgLock.packages[''] && pkgLock.packages[''].version !== targetVersion) {
      pkgLock.packages[''].version = targetVersion;
      changed = true;
    }
    if (changed) {
      if (!isDryRun) {
        fs.writeFileSync(pkgLockPath, JSON.stringify(pkgLock, null, 2) + '\n', 'utf8');
      }
      recordResult('package-lock.json', 'package-lock.json', 'UPDATED', prev, targetVersion, 'npm lockfile top-level package metadata');
    } else {
      recordResult('package-lock.json', 'package-lock.json', 'IN_SYNC', prev, prev, 'Matches target version');
    }
  } else {
    recordResult('package-lock.json', 'package-lock.json', 'SKIPPED', 'N/A', 'N/A', 'File not found');
  }
} catch (err) {
  recordResult('package-lock.json', 'package-lock.json', 'FAILED', 'unknown', targetVersion, err.message);
}

// -----------------------------------------------------------------------------
// 8. .github/workflows/release.yml
// -----------------------------------------------------------------------------
try {
  const releaseYmlPath = path.join(rootDir, '.github/workflows/release.yml');
  if (fs.existsSync(releaseYmlPath)) {
    let yml = fs.readFileSync(releaseYmlPath, 'utf8');
    const match = yml.match(/default:\s*'v([^']+)'/);
    const prev = match ? match[1] : 'unknown';
    if (prev !== targetVersion) {
      yml = yml.replace(
        /(description:\s*'Release version tag \(e\.g\. v)[^)]+(\)')/,
        `$1${targetVersion}$2`
      ).replace(
        /(default:\s*'v)[^']+(\')/,
        `$1${targetVersion}$2`
      );
      if (!isDryRun) {
        fs.writeFileSync(releaseYmlPath, yml, 'utf8');
      }
      recordResult('GitHub Actions', '.github/workflows/release.yml', 'UPDATED', prev, targetVersion, 'Release workflow dispatch defaults');
    } else {
      recordResult('GitHub Actions', '.github/workflows/release.yml', 'IN_SYNC', prev, prev, 'Matches target version');
    }
  } else {
    recordResult('GitHub Actions', '.github/workflows/release.yml', 'SKIPPED', 'N/A', 'N/A', 'File not found');
  }
} catch (err) {
  recordResult('GitHub Actions', '.github/workflows/release.yml', 'FAILED', 'unknown', targetVersion, err.message);
}

// -----------------------------------------------------------------------------
// 9. README.md badge and instructions
// -----------------------------------------------------------------------------
try {
  const readmePath = path.join(rootDir, 'README.md');
  if (fs.existsSync(readmePath)) {
    let readme = fs.readFileSync(readmePath, 'utf8');
    const match = readme.match(/Release-v([0-9.]+)/);
    const prev = match ? match[1] : 'unknown';
    let changed = false;

    if (prev !== targetVersion) {
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
      changed = true;
    }

    if (changed) {
      if (!isDryRun) {
        fs.writeFileSync(readmePath, readme, 'utf8');
      }
      recordResult('Documentation', 'README.md', 'UPDATED', prev, targetVersion, 'Release badge & git tag instructions');
    } else {
      recordResult('Documentation', 'README.md', 'IN_SYNC', prev, prev, 'Matches target version');
    }
  } else {
    recordResult('Documentation', 'README.md', 'SKIPPED', 'N/A', 'N/A', 'File not found');
  }
} catch (err) {
  recordResult('Documentation', 'README.md', 'FAILED', 'unknown', targetVersion, err.message);
}

// -----------------------------------------------------------------------------
// 10. electron/main.js fallback version
// -----------------------------------------------------------------------------
try {
  const electronMainPath = path.join(rootDir, 'electron/main.js');
  if (fs.existsSync(electronMainPath)) {
    let mainJs = fs.readFileSync(electronMainPath, 'utf8');
    const match = mainJs.match(/app\.getVersion\(\) \|\| "([0-9.]+)"/);
    const prev = match ? match[1] : 'unknown';
    if (prev !== targetVersion) {
      mainJs = mainJs.replace(
        /app\.getVersion\(\) \|\| "[0-9.]+"/g,
        `app.getVersion() || "${targetVersion}"`
      );
      if (!isDryRun) {
        fs.writeFileSync(electronMainPath, mainJs, 'utf8');
      }
      recordResult('Electron Main', 'electron/main.js', 'UPDATED', prev, targetVersion, 'Fallback runtime version in native menu');
    } else {
      recordResult('Electron Main', 'electron/main.js', 'IN_SYNC', prev, prev, 'Matches target version');
    }
  } else {
    recordResult('Electron Main', 'electron/main.js', 'SKIPPED', 'N/A', 'N/A', 'File not found');
  }
} catch (err) {
  recordResult('Electron Main', 'electron/main.js', 'FAILED', 'unknown', targetVersion, err.message);
}

// -----------------------------------------------------------------------------
// Summary Presentation
// -----------------------------------------------------------------------------
console.log('Synchronizer Results Matrix:');
console.log('-'.repeat(64));
for (const item of results) {
  const statusIcon = item.status === 'UPDATED' ? '✨ [UPDATED]' : item.status === 'IN_SYNC' ? '✓  [IN_SYNC]' : item.status === 'SKIPPED' ? '⚠️ [SKIPPED]' : '❌ [FAILED]';
  console.log(`  ${statusIcon.padEnd(13)} ${item.name.padEnd(18)} : v${item.prev} -> v${item.next}`);
  if (isVerbose || item.status === 'FAILED') {
    console.log(`     ↳ Path: ${item.path}`);
    console.log(`     ↳ Note: ${item.details}`);
  }
}
console.log('-'.repeat(64));

const updatedCount = results.filter(r => r.status === 'UPDATED').length;
const inSyncCount = results.filter(r => r.status === 'IN_SYNC').length;
const failedCount = results.filter(r => r.status === 'FAILED').length;
const elapsedMs = Date.now() - startTime;

if (failedCount > 0) {
  console.error(`\n❌ Synchronization finished with ${failedCount} error(s) in ${elapsedMs}ms.\n`);
  process.exit(1);
} else {
  console.log(`\n✨ Successfully verified all ${results.length} targets (${updatedCount} updated, ${inSyncCount} already in sync) in ${elapsedMs}ms.\n`);
}
