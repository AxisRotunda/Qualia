#!/usr/bin/env node
/**
 * QUALIA Git Sync Automation Script
 * Generated: 2026-02-04T17:12:00.000Z
 * Version: 3.0 - Full Agentic Automation
 * 
 * Usage: node scripts/git-sync.cjs [mode] [options]
 * 
 * MODES:
 *   --check          : Read-only status check
 *   --pull           : Pull from upstream only
 *   --push           : Push to target (auto-commit if dirty)
 *   --sync           : Full sync cycle (pull then push)
 *   --auto           : Full agentic automation (commit + sync)
 *   --auto-commit    : Auto-commit with generated message
 *   --watch          : Watch mode - auto-sync on changes
 * 
 * TARGET: All commits push to https://github.com/AxisRotunda/Qualia/tree/dev
 * Authentication: Uses GITHUB_TOKEN from .env file
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env file
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
      if (match) {
        process.env[match[1]] = match[2].replace(/^["']|["']$/g, '');
      }
    });
  }
}

// Load .env file
loadEnv();

const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m',
  magenta: '\x1b[35m'
};

// Configuration
const TARGET_REPO = process.env.TARGET_REPO_URL || 'https://github.com/AxisRotunda/Qualia.git';
const TARGET_BRANCH = process.env.TARGET_BRANCH || 'dev';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const AUTO_COMMIT_PREFIX = process.env.AUTO_COMMIT_PREFIX || '🤖 [AGENT]';
const WATCH_INTERVAL = parseInt(process.env.WATCH_INTERVAL || '30000', 10); // 30 seconds default

// Build authenticated URL if token is available
function getAuthenticatedUrl() {
  if (!GITHUB_TOKEN) {
    return TARGET_REPO;
  }
  // Insert token into URL: https://token@github.com/user/repo.git
  const url = TARGET_REPO.replace('https://', `https://${GITHUB_TOKEN}@`);
  return url;
}

function log(msg, color = 'reset') {
  const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
  console.log(`${COLORS.dim}[${timestamp}]${COLORS.reset} ${COLORS[color] + msg + COLORS.reset}`);
}

function exec(cmd, options = {}) {
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'], ...options });
  } catch (e) {
    return { error: e, stderr: e.stderr?.toString(), stdout: e.stdout?.toString() };
  }
}

function getBranch() {
  const result = exec('git branch --show-current');
  return typeof result === 'string' ? result.trim() : 'main';
}

function getCommitHash(ref) {
  const result = exec(`git rev-parse ${ref} 2>/dev/null`);
  return typeof result === 'string' ? result.trim() : null;
}

function getCommitCount(ref1, ref2) {
  const result = exec(`git rev-list --count ${ref1}...${ref2} 2>/dev/null`);
  return typeof result === 'string' ? parseInt(result.trim(), 10) || 0 : 0;
}

function checkWorkingTree() {
  const result = exec('git status --porcelain');
  if (typeof result === 'string') {
    return result.trim().length === 0 ? 'clean' : 'dirty';
  }
  return 'unknown';
}

function getChangedFiles() {
  const result = exec('git status --porcelain');
  if (typeof result === 'string') {
    return result.trim().split('\n').filter(line => line.length > 0).map(line => ({
      status: line.slice(0, 2).trim(),
      file: line.slice(3).trim()
    }));
  }
  return [];
}

function hasRemote(name) {
  const result = exec(`git remote get-url ${name} 2>/dev/null`);
  return typeof result === 'string' && result.trim().length > 0;
}

function getRemoteUrl(name) {
  const result = exec(`git remote get-url ${name} 2>/dev/null`);
  return typeof result === 'string' ? result.trim() : null;
}

function fetchRemote(name) {
  log(`Fetching from ${name}...`, 'dim');
  const result = exec(`git fetch ${name} --quiet`);
  if (result.error) {
    log(`Failed to fetch from ${name}: ${result.stderr}`, 'red');
    return false;
  }
  return true;
}

function analyzeSyncState() {
  const branch = getBranch();
  const treeState = checkWorkingTree();
  const hasTarget = hasRemote('target');
  const hasUpstream = hasRemote('upstream');
  
  const localHash = getCommitHash('HEAD');
  const targetHash = hasTarget ? getCommitHash(`target/${TARGET_BRANCH}`) : null;
  const upstreamHash = hasUpstream ? getCommitHash('upstream/main') : null;
  
  const aheadOfTarget = targetHash ? getCommitCount(targetHash, 'HEAD') : 0;
  const behindTarget = targetHash ? getCommitCount('HEAD', targetHash) : 0;
  
  let state = 'SYNCED';
  if (treeState === 'dirty') state = 'DIRTY';
  else if (behindTarget > 0 && aheadOfTarget > 0) state = 'DIVERGED';
  else if (behindTarget > 0) state = 'BEHIND_TARGET';
  else if (aheadOfTarget > 0) state = 'AHEAD';
  
  return {
    branch,
    treeState,
    hasTarget,
    hasUpstream,
    localHash: localHash?.slice(0, 7),
    targetHash: targetHash?.slice(0, 7),
    upstreamHash: upstreamHash?.slice(0, 7),
    state,
    aheadCount: aheadOfTarget,
    behindCount: behindTarget,
    targetBranch: TARGET_BRANCH,
    changedFiles: getChangedFiles()
  };
}

function printState(state) {
  console.log('');
  log('╔══════════════════════════════════════════════════╗', 'cyan');
  log('║     QUALIA GIT SYNC STATUS                       ║', 'cyan');
  log('╠══════════════════════════════════════════════════╣', 'cyan');
  log(`║ Branch:         ${state.branch.padEnd(35)}║`, 'dim');
  log(`║ Target Branch:   ${state.targetBranch.padEnd(35)}║`, 'dim');
  log(`║ Working:        ${(state.treeState === 'clean' ? '✓ Clean' : '✗ Dirty').padEnd(35)}║`, state.treeState === 'clean' ? 'green' : 'yellow');
  log(`║ Target Repo:     ${(state.hasTarget ? '✓ Connected' : '○ Not configured').padEnd(35)}║`);
  log(`║ Target Hash:     ${(state.targetHash ? state.targetHash : 'N/A').padEnd(35)}║`);
  log('╠══════════════════════════════════════════════════╣', 'cyan');
  const stateColor = state.state === 'SYNCED' ? 'green' : 
                     state.state === 'DIRTY' ? 'yellow' : 
                     state.state === 'AHEAD' ? 'cyan' : 'red';
  log(`║ State:           ${state.state.padEnd(35)}║`, stateColor);
  log(`║ Ahead:           ${String(state.aheadCount).padEnd(35)}║`, state.aheadCount > 0 ? 'green' : 'dim');
  log(`║ Behind:          ${String(state.behindCount).padEnd(35)}║`, state.behindCount > 0 ? 'yellow' : 'dim');
  log('╚══════════════════════════════════════════════════╝', 'cyan');
  console.log('');
  log(`Target: ${TARGET_REPO}`, 'dim');
  log(`Branch: ${TARGET_BRANCH}`, 'dim');
  
  if (state.changedFiles.length > 0) {
    console.log('');
    log('Changed Files:', 'yellow');
    state.changedFiles.forEach(f => {
      const statusColor = f.status === 'M' ? 'yellow' : f.status === 'A' ? 'green' : f.status === 'D' ? 'red' : 'dim';
      log(`  [${f.status}] ${f.file}`, statusColor);
    });
  }
  console.log('');
}

function configureTargetRemote(silent = false) {
  // Check if target remote exists
  if (hasRemote('target')) {
    const currentUrl = getRemoteUrl('target');
    // If URL matches (ignoring trailing whitespace), we're good
    if (currentUrl && currentUrl.trim() === TARGET_REPO) {
      return true;
    }
    // Update URL if different
    const result = exec(`git remote set-url target ${TARGET_REPO}`);
    if (result.error && !silent) {
      log(`Failed to update target remote: ${result.stderr}`, 'red');
      return false;
    }
    return true;
  }
  
  // Add target remote (without token for security, token only used for push)
  const result = exec(`git remote add target ${TARGET_REPO}`);
  if (result.error && !silent) {
    log(`Failed to add target remote: ${result.stderr}`, 'red');
    return false;
  }
  
  return true;
}

function generateCommitMessage(files) {
  const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
  
  // Categorize changes
  const modified = files.filter(f => f.status === 'M').map(f => f.file);
  const added = files.filter(f => f.status === 'A' || f.status === '??').map(f => f.file);
  const deleted = files.filter(f => f.status === 'D').map(f => f.file);
  
  let message = `${AUTO_COMMIT_PREFIX} Auto-sync ${timestamp}`;
  
  if (modified.length > 0) {
    message += `\n\nModified (${modified.length}):\n- ${modified.join('\n- ')}`;
  }
  if (added.length > 0) {
    message += `\n\nAdded (${added.length}):\n- ${added.join('\n- ')}`;
  }
  if (deleted.length > 0) {
    message += `\n\nDeleted (${deleted.length}):\n- ${deleted.join('\n- ')}`;
  }
  
  return message;
}

function autoCommit() {
  const files = getChangedFiles();
  if (files.length === 0) {
    log('No changes to commit.', 'dim');
    return true;
  }
  
  log(`Auto-committing ${files.length} changed file(s)...`, 'cyan');
  
  // Stage all changes
  const addResult = exec('git add -A');
  if (addResult.error) {
    log(`Failed to stage files: ${addResult.stderr}`, 'red');
    return false;
  }
  
  // Generate and create commit
  const commitMessage = generateCommitMessage(files);
  const commitResult = exec(`git commit -m "${commitMessage.replace(/"/g, '\\"')}"`);
  
  if (commitResult.error) {
    log(`Failed to commit: ${commitResult.stderr}`, 'red');
    return false;
  }
  
  log('Auto-commit successful.', 'green');
  return true;
}

function pullFromUpstream(state) {
  if (!state.hasUpstream) {
    log('No upstream remote configured.', 'yellow');
    return true; // Not fatal
  }
  
  if (state.behindCount === 0) {
    log('Already up to date with upstream.', 'dim');
    return true;
  }
  
  log('Pulling from upstream (fast-forward only)...', 'cyan');
  const result = exec(`git merge --ff-only upstream/main`);
  if (result.error) {
    log('Fast-forward failed. Manual merge required.', 'red');
    return false;
  }
  log('Successfully updated from upstream.', 'green');
  return true;
}

function pushToTarget(state) {
  if (!GITHUB_TOKEN) {
    log('ERROR: GITHUB_TOKEN not found in .env file', 'red');
    log('Please create a .env file with your GitHub Personal Access Token:', 'yellow');
    log('  GITHUB_TOKEN=your_token_here', 'dim');
    return false;
  }
  
  // Configure target remote (silent)
  if (!configureTargetRemote(true)) {
    return false;
  }
  
  // Fetch target to get latest state
  log('Fetching from target repository...', 'dim');
  const fetchResult = exec('git fetch target --quiet');
  if (fetchResult.error) {
    log(`Fetch warning: ${fetchResult.stderr}`, 'yellow');
  }
  
  // Re-analyze state after fetch
  const freshState = analyzeSyncState();
  
  if (freshState.aheadCount === 0 && freshState.state !== 'DIRTY') {
    log('No local commits to push.', 'green');
    return true;
  }
  
  const authUrl = getAuthenticatedUrl();
  const gitCommand = `git push "${authUrl}" HEAD:${TARGET_BRANCH}`;
  
  log(`Pushing ${freshState.aheadCount} commit(s) to AxisRotunda/Qualia (${TARGET_BRANCH} branch)...`, 'cyan');
  
  // Execute push with authentication
  const result = exec(gitCommand, { 
    env: { 
      ...process.env,
      GIT_TERMINAL_PROMPT: '0'
    }
  });
  
  if (result.error) {
    const errorMsg = result.stderr || result.error.message || 'Unknown error';
    if (errorMsg.includes('everything up-to-date')) {
      log('Everything up-to-date.', 'green');
      return true;
    }
    log(`Push failed: ${errorMsg}`, 'red');
    
    if (errorMsg.includes('403') || errorMsg.includes('Unauthorized')) {
      log('', 'red');
      log('Authentication failed. Please check:', 'yellow');
      log('  1. Your GITHUB_TOKEN is valid and not expired', 'dim');
      log('  2. The token has "repo" scope', 'dim');
      log('  3. You have write access to AxisRotunda/Qualia', 'dim');
    }
    if (errorMsg.includes('Could not resolve host')) {
      log('Network error. Please check your internet connection.', 'yellow');
    }
    return false;
  }
  
  log('✓ Successfully pushed to AxisRotunda/Qualia!', 'green');
  log(`  Branch: ${TARGET_BRANCH}`, 'green');
  log(`  Commits: ${freshState.aheadCount}`, 'green');
  return true;
}

function fullSync(autoCommitEnabled = false) {
  log('Starting full sync to AxisRotunda/Qualia...', 'cyan');
  
  // Step 1: Auto-commit if enabled and dirty
  if (autoCommitEnabled) {
    const state = analyzeSyncState();
    if (state.treeState === 'dirty') {
      if (!autoCommit()) {
        return false;
      }
    }
  }
  
  // Step 2: Pull from upstream
  const state = analyzeSyncState();
  if (!pullFromUpstream(state)) {
    return false;
  }
  
  // Step 3: Push to target
  if (!pushToTarget(analyzeSyncState())) {
    return false;
  }
  
  return true;
}

// Watch mode - auto-sync on changes
let isSyncing = false;
let pendingSync = false;

async function watchMode() {
  log('Starting watch mode...', 'magenta');
  log(`Interval: ${WATCH_INTERVAL}ms`, 'dim');
  log('Press Ctrl+C to stop', 'dim');
  console.log('');
  
  const checkAndSync = async () => {
    if (isSyncing) {
      pendingSync = true;
      return;
    }
    
    const state = analyzeSyncState();
    
    if (state.treeState === 'dirty' || state.aheadCount > 0) {
      isSyncing = true;
      log('Changes detected, auto-syncing...', 'cyan');
      
      const success = fullSync(true); // Auto-commit enabled
      
      isSyncing = false;
      
      if (pendingSync) {
        pendingSync = false;
        await checkAndSync();
      }
    }
  };
  
  // Initial check
  await checkAndSync();
  
  // Set up interval
  setInterval(checkAndSync, WATCH_INTERVAL);
}

// Print usage information
function printUsage() {
  console.log('');
  log('QUALIA Git Sync Automation - v3.0', 'cyan');
  console.log('');
  log('Usage: node scripts/git-sync.cjs [mode] [options]', 'dim');
  console.log('');
  log('MODES:', 'cyan');
  log('  --check          Read-only status check', 'dim');
  log('  --pull           Pull from upstream only', 'dim');
  log('  --push           Push to target (fails if dirty)', 'dim');
  log('  --sync           Full sync cycle (pull then push)', 'dim');
  log('  --auto           Full agentic automation (commit + sync)', 'dim');
  log('  --auto-commit    Auto-commit with generated message', 'dim');
  log('  --watch          Watch mode - auto-sync on changes', 'dim');
  console.log('');
  log('EXAMPLES:', 'cyan');
  log('  node scripts/git-sync.cjs --check', 'dim');
  log('  node scripts/git-sync.cjs --auto', 'dim');
  log('  node scripts/git-sync.cjs --watch', 'dim');
  console.log('');
}

// Main execution
const args = process.argv.slice(2);
const mode = args[0] || '--sync';

// Handle help
if (mode === '--help' || mode === '-h') {
  printUsage();
  process.exit(0);
}

log('--- QUALIA GIT SYNC v3.0 START ---', 'cyan');
log('Target: AxisRotunda/Qualia (dev branch)', 'dim');
console.log('');

// Check if .env exists
const envPath = path.join(__dirname, '..', '.env');
if (!fs.existsSync(envPath)) {
  log('WARNING: .env file not found!', 'yellow');
  log('Create a .env file with GITHUB_TOKEN for authentication.', 'yellow');
}

// Configure target remote (silent)
configureTargetRemote(true);

// Fetch all remotes (silent)
if (hasRemote('target')) fetchRemote('target');
if (hasRemote('upstream')) fetchRemote('upstream');

const state = analyzeSyncState();
printState(state);

// Mode: check
if (mode === '--check') {
  process.exit(state.state === 'SYNCED' || state.state === 'DIRTY' ? 0 : 1);
}

// Mode: auto-commit
if (mode === '--auto-commit') {
  if (state.treeState !== 'dirty') {
    log('Nothing to commit - working tree is clean.', 'green');
    process.exit(0);
  }
  const success = autoCommit();
  process.exit(success ? 0 : 1);
}

// Mode: pull
if (mode === '--pull') {
  if (state.treeState === 'dirty') {
    log('ERROR: Working tree is dirty. Commit or use --auto mode.', 'red');
    process.exit(1);
  }
  const success = pullFromUpstream(state);
  process.exit(success ? 0 : 1);
}

// Mode: push
if (mode === '--push') {
  if (state.treeState === 'dirty') {
    log('ERROR: Working tree is dirty. Commit or use --auto mode.', 'red');
    process.exit(1);
  }
  const success = pushToTarget(state);
  process.exit(success ? 0 : 1);
}

// Mode: sync
if (mode === '--sync') {
  if (state.treeState === 'dirty') {
    log('ERROR: Working tree is dirty. Commit or use --auto mode.', 'red');
    process.exit(1);
  }
  const success = fullSync(false);
  process.exit(success ? 0 : 1);
}

// Mode: auto (full agentic automation)
if (mode === '--auto') {
  const success = fullSync(true);
  if (success) {
    console.log('');
    log('✓ Agentic sync complete!', 'green');
    log(`  All changes committed and pushed to:`, 'green');
    log(`  ${TARGET_REPO}/tree/${TARGET_BRANCH}`, 'cyan');
  }
  process.exit(success ? 0 : 1);
}

// Mode: watch
if (mode === '--watch') {
  watchMode().catch(err => {
    log(`Watch mode error: ${err.message}`, 'red');
    process.exit(1);
  });
  // Don't exit - keep watching
} else {
  log('--- SYNC COMPLETE ---', 'green');
}
