#!/usr/bin/env node
/**
 * DEV SERVER AUTOMATION - Port Management & Live Testing
 * > **ID**: DEV_SERVER_V1.0
 * > **Role**: Automated npm run dev/build/serve with port cleanup
 * > **Source**: `angular.json` port configuration
 *
 * Ensures port 3000 is always reserved and easily reset.
 * Handles process cleanup, port conflicts, and dev server lifecycle.
 *
 * ## Usage
 * ```bash
 * npm run dev          # Start dev server (kills port 3000 if needed)
 * npm run dev:clean    # Kill port 3000 and start fresh
 * npm run dev:fresh    # Full clean: kill port, clean cache, start
 * npm run port:free    # Just kill whatever is using port 3000
 * npm run port:check   # Check if port 3000 is in use
 * npm run build        # Production build
 * npm run preview      # Production preview on port 3000
 * ```
 */

const { spawn, execSync } = require('child_process');
const path = require('path');

// Load shell utilities
const {
  killPort,
  isPortInUse,
  waitForPort,
  getProcessOnPort
} = require('./shell-utils.cjs');

// Configuration from angular.json
const DEV_PORT = 3000;
const ANGULAR_CONFIG = 'development';

// Colors for terminal output
const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  dim: '\x1b[2m'
};

function log(msg, color = 'reset') {
  const timestamp = new Date().toISOString().replace('T', ' ').slice(11, 19);
  console.log(`${COLORS.dim}[${timestamp}]${COLORS.reset} ${COLORS[color] + msg + COLORS.reset}`);
}

/**
 * Sleep/delay function (cross-platform, no shell commands)
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function logHeader(title) {
  console.log('');
  log('='.repeat(60), 'dim');
  log(`  ${title}`, 'cyan');
  log('='.repeat(60), 'dim');
  console.log('');
}

// =============================================================================
// PORT MANAGEMENT
// =============================================================================

/**
 * Check and report port status
 */
function checkPort() {
  logHeader('PORT STATUS CHECK');

  const inUse = isPortInUse(DEV_PORT);

  if (inUse) {
    const info = getProcessOnPort(DEV_PORT);
    log(`⚠ Port ${DEV_PORT} is IN USE`, 'yellow');
    if (info) {
      log(`  PID:  ${info.pid}`, 'dim');
      log(`  Name: ${info.name}`, 'dim');
    }
  } else {
    log(`✓ Port ${DEV_PORT} is FREE`, 'green');
  }

  return !inUse;
}

/**
 * Free port 3000 by killing any process using it
 */
function freePort(force = false) {
  logHeader('FREEING PORT 3000');

  const inUse = isPortInUse(DEV_PORT);

  if (!inUse) {
    log(`✓ Port ${DEV_PORT} is already free`, 'green');
    return true;
  }

  const info = getProcessOnPort(DEV_PORT);
  if (info) {
    log(`Found process using port ${DEV_PORT}:`, 'yellow');
    log(`  PID:  ${info.pid}`, 'dim');
    log(`  Name: ${info.name}`, 'dim');
  }

  log(`\nTerminating process...`, 'cyan');
  const success = killPort(DEV_PORT, force);

  if (success) {
    log(`✓ Port ${DEV_PORT} is now free`, 'green');
  } else {
    log(`✗ Failed to free port ${DEV_PORT}`, 'red');
    log('Try running with --force flag', 'yellow');
  }

  return success;
}

// =============================================================================
// CLEANUP OPERATIONS
// =============================================================================

/**
 * Clean Angular cache and build artifacts
 */
function cleanCache() {
  logHeader('CLEANING CACHE');

  const dirsToClean = [
    '.angular',
    'dist',
    'node_modules/.cache'
  ];

  for (const dir of dirsToClean) {
    try {
      // PowerShell compatible remove
      const cmd = `powershell -Command "Remove-Item -Path '${dir}' -Recurse -Force -ErrorAction SilentlyContinue"`;
      execSync(cmd, { cwd: process.cwd(), stdio: 'ignore' });
      log(`✓ Cleaned ${dir}/`, 'green');
    } catch (error) {
      log(`○ ${dir}/ not found or already clean`, 'dim');
    }
  }

  log('\n✓ Cache cleanup complete', 'green');
}

/**
 * Clean npm modules (nuclear option)
 */
function cleanModules() {
  logHeader('CLEANING NODE MODULES');

  try {
    const cmd = `powershell -Command "Remove-Item -Path 'node_modules' -Recurse -Force -ErrorAction SilentlyContinue"`;
    execSync(cmd, { cwd: process.cwd(), stdio: 'ignore' });
    log('✓ Removed node_modules/', 'green');
  } catch (error) {
    log('○ node_modules/ not found', 'dim');
  }
}

// =============================================================================
// DEV SERVER COMMANDS
// =============================================================================

/**
 * Start Angular dev server
 */
async function startDevServer(fresh = false) {
  logHeader('STARTING DEV SERVER');

  // Ensure port is free
  if (isPortInUse(DEV_PORT)) {
    log(`Port ${DEV_PORT} is in use. Attempting to free...`, 'yellow');
    if (!freePort(true)) {
      log(`\n✗ Cannot start dev server - port ${DEV_PORT} is blocked`, 'red');
      log('Please manually kill the process or choose a different port', 'yellow');
      return false;
    }
    // Wait a moment for port to be fully released
    log('Waiting for port to be fully released...', 'dim');
    await sleep(2000);
  }

  log(`Starting Angular dev server on port ${DEV_PORT}...`, 'cyan');
  log('Press Ctrl+C to stop\n', 'dim');

  // Build the ng serve command
  const args = ['serve', `--port=${DEV_PORT}`, `--configuration=${ANGULAR_CONFIG}`];

  if (fresh) {
    log('Fresh start mode: cache cleared', 'cyan');
  }

  // Spawn ng serve
  const ngServe = spawn('ng', args, {
    stdio: 'inherit',
    shell: true,
    cwd: process.cwd()
  });

  // Handle graceful shutdown
  const shutdown = (signal) => {
    log(`\n${signal} received. Shutting down gracefully...`, 'yellow');
    ngServe.kill('SIGTERM');
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));

  // Handle process exit
  ngServe.on('close', (code) => {
    if (code !== 0 && code !== null) {
      log(`\nDev server exited with code ${code}`, 'red');
    } else {
      log('\nDev server stopped', 'dim');
    }
    process.exit(code || 0);
  });

  ngServe.on('error', (error) => {
    log(`\nFailed to start dev server: ${error.message}`, 'red');
    process.exit(1);
  });

  return true;
}

/**
 * Build the project
 */
function build(production = false) {
  logHeader(production ? 'PRODUCTION BUILD' : 'DEVELOPMENT BUILD');

  const config = production ? 'production' : 'development';
  log(`Building with ${config} configuration...`, 'cyan');

  const ngBuild = spawn('ng', ['build', `--configuration=${config}`], {
    stdio: 'inherit',
    shell: true,
    cwd: process.cwd()
  });

  ngBuild.on('close', (code) => {
    if (code === 0) {
      log('\n✓ Build successful', 'green');
    } else {
      log(`\n✗ Build failed with code ${code}`, 'red');
    }
    process.exit(code || 0);
  });

  ngBuild.on('error', (error) => {
    log(`\nBuild error: ${error.message}`, 'red');
    process.exit(1);
  });
}

/**
 * Preview production build
 */
function preview() {
  logHeader('PRODUCTION PREVIEW');

  // Ensure port is free
  if (isPortInUse(DEV_PORT)) {
    log(`Port ${DEV_PORT} is in use. Attempting to free...`, 'yellow');
    if (!freePort(true)) {
      log(`\n✗ Cannot start preview - port ${DEV_PORT} is blocked`, 'red');
      return false;
    }
  }

  log(`Starting production preview on port ${DEV_PORT}...`, 'cyan');

  const ngPreview = spawn('ng', ['serve', `--port=${DEV_PORT}`, '--configuration=production'], {
    stdio: 'inherit',
    shell: true,
    cwd: process.cwd()
  });

  const shutdown = (signal) => {
    log(`\n${signal} received. Stopping preview...`, 'yellow');
    ngPreview.kill('SIGTERM');
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));

  ngPreview.on('close', (code) => {
    process.exit(code || 0);
  });

  ngPreview.on('error', (error) => {
    log(`\nPreview error: ${error.message}`, 'red');
    process.exit(1);
  });

  return true;
}

// =============================================================================
// CLI INTERFACE
// =============================================================================

function printUsage() {
  console.log(`
${COLORS.cyan}Dev Server Automation v1.0${COLORS.reset}
${COLORS.dim}Automated npm run dev/build/serve with port cleanup${COLORS.reset}

${COLORS.yellow}Usage:${COLORS.reset} node dev-server.cjs <command> [options]

${COLORS.cyan}Commands:${COLORS.reset}
  dev                    Start dev server (port 3000, auto-cleanup)
  dev:clean              Kill port 3000 and start dev server
  dev:fresh              Full clean: kill port, clear cache, start
  build                  Development build
  build:prod             Production build
  preview                Production preview on port 3000
  clean                  Clean Angular cache and build artifacts
  clean:all              Clean everything including node_modules
  port:check             Check if port 3000 is in use
  port:free              Kill whatever is using port 3000
  port:status            Show detailed port status

${COLORS.cyan}Options:${COLORS.reset}
  --force, -f            Force kill processes without confirmation
  --help, -h             Show this help

${COLORS.cyan}Examples:${COLORS.reset}
  node dev-server.cjs dev
  node dev-server.cjs dev:fresh
  node dev-server.cjs port:free --force
  node dev-server.cjs build:prod
`);
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'dev';
  const force = args.includes('--force') || args.includes('-f');

  // Handle help
  if (command === '--help' || command === '-h' || command === 'help') {
    printUsage();
    return;
  }

  log(`--- QUALIA DEV SERVER v1.0 ---`, 'magenta');
  log(`Port: ${DEV_PORT}`, 'dim');
  console.log('');

  switch (command) {
    case 'dev':
      await startDevServer(false);
      break;

    case 'dev:clean':
      freePort(force);
      await startDevServer(false);
      break;

    case 'dev:fresh':
      freePort(force);
      cleanCache();
      await startDevServer(true);
      break;

    case 'build':
      build(false);
      break;

    case 'build:prod':
      build(true);
      break;

    case 'preview':
      preview();
      break;

    case 'clean':
      cleanCache();
      break;

    case 'clean:all':
      freePort(force);
      cleanCache();
      cleanModules();
      break;

    case 'port:check':
    case 'port:status':
      checkPort();
      break;

    case 'port:free':
    case 'port:kill':
      freePort(force);
      break;

    default:
      log(`Unknown command: ${command}`, 'red');
      printUsage();
      process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

// Export for use as module
module.exports = {
  checkPort,
  freePort,
  cleanCache,
  startDevServer,
  build,
  preview,
  DEV_PORT
};
