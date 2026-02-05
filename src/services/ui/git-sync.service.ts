import { Injectable, signal, computed } from '@angular/core';

export interface SyncState {
  localHash: string;
  originHash: string;
  upstreamHash: string;
  state: 'SYNCED' | 'AHEAD' | 'BEHIND_UPSTREAM' | 'DIVERGED' | 'CLEAN' | 'DIRTY';
  aheadCount: number;
  behindCount: number;
  hasOrigin: boolean;
  hasUpstream: boolean;
  lastCheck: number;
}

export interface SyncOperation {
  id: string;
  action: 'check' | 'pull_upstream' | 'push_origin' | 'full_sync';
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: string;
  timestamp: number;
}

@Injectable({
    providedIn: 'root'
})
export class GitSyncService {
    private syncState = signal<SyncState>({
        localHash: '',
        originHash: '',
        upstreamHash: '',
        state: 'CLEAN',
        aheadCount: 0,
        behindCount: 0,
        hasOrigin: false,
        hasUpstream: false,
        lastCheck: 0
    });

    private operations = signal<SyncOperation[]>([]);

    readonly currentState = computed(() => this.syncState());
    readonly pendingOps = computed(() =>
        this.operations().filter(op => op.status === 'pending' || op.status === 'running')
    );
    readonly canSync = computed(() => {
        const state = this.syncState();
        return state.state !== 'DIRTY' && state.hasOrigin && state.hasUpstream;
    });
    readonly needsPull = computed(() => {
        const state = this.syncState();
        return state.behindCount > 0;
    });
    readonly needsPush = computed(() => {
        const state = this.syncState();
        return state.aheadCount > 0;
    });

    /**
   * Generates a Node.js git synchronization script.
   * This can be run standalone for automation.
   */
    generateSyncScript(mode: 'check' | 'pull' | 'push' | 'full' = 'full'): string {
        return `#!/usr/bin/env node
/**
 * QUALIA Git Sync Automation Script
 * Generated: ${new Date().toISOString()}
 * Mode: ${mode}
 * 
 * Usage: node git-sync.cjs [--check|--pull|--push|--full]
 */

const { execSync } = require('child_process');

const COLORS = {
  reset: '\\x1b[0m',
  red: '\\x1b[31m',
  green: '\\x1b[32m',
  yellow: '\\x1b[33m',
  cyan: '\\x1b[36m',
  dim: '\\x1b[2m'
};

function log(msg, color = 'reset') {
  console.log(COLORS[color] + msg + COLORS.reset);
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
  const result = exec(\`git rev-parse \${ref} 2>/dev/null\`);
  return typeof result === 'string' ? result.trim() : null;
}

function getCommitCount(ref1, ref2) {
  const result = exec(\`git rev-list --count \${ref1}...\${ref2} 2>/dev/null\`);
  return typeof result === 'string' ? parseInt(result.trim(), 10) || 0 : 0;
}

function checkWorkingTree() {
  const result = exec('git status --porcelain');
  if (typeof result === 'string') {
    return result.trim().length === 0 ? 'clean' : 'dirty';
  }
  return 'unknown';
}

function hasRemote(name) {
  const result = exec(\`git remote get-url \${name} 2>/dev/null\`);
  return typeof result === 'string' && result.trim().length > 0;
}

function fetchRemote(name) {
  log(\`Fetching from \${name}...\`, 'dim');
  const result = exec(\`git fetch \${name}\`);
  if (result.error) {
    log(\`Failed to fetch from \${name}: \${result.stderr}\`, 'red');
    return false;
  }
  return true;
}

function analyzeSyncState() {
  const branch = getBranch();
  const treeState = checkWorkingTree();
  const hasOrigin = hasRemote('origin');
  const hasUpstream = hasRemote('upstream');
  
  const localHash = getCommitHash('HEAD');
  const originHash = hasOrigin ? getCommitHash('origin/' + branch) : null;
  const upstreamHash = hasUpstream ? getCommitHash('upstream/' + branch) : null;
  
  const aheadOfUpstream = upstreamHash ? getCommitCount(upstreamHash, 'HEAD') : 0;
  const behindUpstream = upstreamHash ? getCommitCount('HEAD', upstreamHash) : 0;
  
  let state = 'SYNCED';
  if (treeState === 'dirty') state = 'DIRTY';
  else if (behindUpstream > 0 && aheadOfUpstream > 0) state = 'DIVERGED';
  else if (behindUpstream > 0) state = 'BEHIND_UPSTREAM';
  else if (aheadOfUpstream > 0) state = 'AHEAD';
  
  return {
    branch,
    treeState,
    hasOrigin,
    hasUpstream,
    localHash: localHash?.slice(0, 7),
    originHash: originHash?.slice(0, 7),
    upstreamHash: upstreamHash?.slice(0, 7),
    state,
    aheadCount: aheadOfUpstream,
    behindCount: behindUpstream
  };
}

function printState(state) {
  console.log('');
  log('╔══════════════════════════════════════╗', 'cyan');
  log('║     QUALIA GIT SYNC STATUS          ║', 'cyan');
  log('╠══════════════════════════════════════╣', 'cyan');
  log(\`║ Branch:    \${state.branch.padEnd(26)}║\`, 'dim');
  log(\`║ Working:   \${state.treeState === 'clean' ? '✓ Clean' : '✗ Dirty'\n                   .padEnd(26)}║\`);
  log(\`║ Origin:    \${(state.hasOrigin ? '✓ ' + state.originHash : '✗ None').padEnd(26)}║\`);
  log(\`║ Upstream:  \${(state.hasUpstream ? '✓ ' + state.upstreamHash : '✗ None').padEnd(26)}║\`);
  log('╠══════════════════════════════════════╣', 'cyan');
  const stateColor = state.state === 'SYNCED' ? 'green' : 
                     state.state === 'DIRTY' ? 'red' : 'yellow';
  log(\`║ State:     \${state.state.padEnd(26)}║\`, stateColor);
  log(\`║ Ahead:     \${String(state.aheadCount).padEnd(26)}║\`, state.aheadCount > 0 ? 'green' : 'dim');
  log(\`║ Behind:    \${String(state.behindCount).padEnd(26)}║\`, state.behindCount > 0 ? 'yellow' : 'dim');
  log('╚══════════════════════════════════════╝', 'cyan');
  console.log('');
}

function pullFromUpstream(state) {
  if (!state.hasUpstream) {
    log('No upstream remote configured.', 'red');
    return false;
  }
  if (state.treeState !== 'clean') {
    log('Working tree is dirty. Commit or stash changes first.', 'red');
    return false;
  }
  if (state.behindCount === 0) {
    log('Already up to date with upstream.', 'green');
    return true;
  }
  
  log('Pulling from upstream (fast-forward only)...', 'cyan');
  const result = exec(\`git merge --ff-only upstream/\${state.branch}\`);
  if (result.error) {
    log('Fast-forward failed. Manual merge required.', 'red');
    return false;
  }
  log('Successfully updated from upstream.', 'green');
  return true;
}

function pushToOrigin(state) {
  if (!state.hasOrigin) {
    log('No origin remote configured.', 'red');
    return false;
  }
  if (state.aheadCount === 0) {
    log('No local commits to push.', 'green');
    return true;
  }
  
  log('Pushing to origin...', 'cyan');
  const result = exec(\`git push origin \${state.branch}\`);
  if (result.error) {
    log(\`Push failed: \${result.stderr}\`, 'red');
    return false;
  }
  log('Successfully pushed to origin.', 'green');
  return true;
}

// Main execution
const mode = process.argv[2] || '${mode}';

log('--- QUALIA GIT SYNC START ---', 'cyan');
console.log('');

// Fetch all remotes first
if (hasRemote('origin')) fetchRemote('origin');
if (hasRemote('upstream')) fetchRemote('upstream');

const state = analyzeSyncState();
printState(state);

if (mode === 'check') {
  process.exit(state.state === 'SYNCED' ? 0 : 1);
}

if (state.treeState === 'dirty' && mode !== 'check') {
  log('ERROR: Working tree is dirty. Commit or stash changes first.', 'red');
  process.exit(1);
}

if (mode === 'pull' || mode === 'full') {
  if (!pullFromUpstream(state)) process.exit(1);
  // Re-analyze after pull
  Object.assign(state, analyzeSyncState());
}

if (mode === 'push' || mode === 'full') {
  if (!pushToOrigin(state)) process.exit(1);
}

log('--- SYNC COMPLETE ---', 'green');
`;
    }

    /**
   * Returns the git commands for manual execution
   */
    getManualSyncCommands(): string {
        return `
# QUALIA Git Sync Commands
# Copy and execute these commands manually if needed

# 1. Check sync status
git fetch origin
git fetch upstream
git status

# 2. View sync comparison
git log --oneline --graph --left-right --decorate origin/main...upstream/main

# 3. Pull from upstream (if behind)
git merge --ff-only upstream/main

# 4. Push to origin (if ahead)
git push origin main

# 5. Full sync cycle
git fetch upstream && git merge --ff-only upstream/main && git push origin main
`;
    }
}
