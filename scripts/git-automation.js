/**
 * QUALIA Git Automation Module
 * Provides programmatic API for agentic git operations
 * 
 * This module can be imported and used by the agent workflow system
 * to enable automatic commit and sync operations.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Load environment variables
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

loadEnv();

const TARGET_REPO = process.env.TARGET_REPO_URL || 'https://github.com/AxisRotunda/Qualia.git';
const TARGET_BRANCH = process.env.TARGET_BRANCH || 'dev';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const AUTO_COMMIT_PREFIX = process.env.AUTO_COMMIT_PREFIX || '🤖 [AGENT]';

class GitAutomation {
  constructor() {
    this.targetRepo = TARGET_REPO;
    this.targetBranch = TARGET_BRANCH;
    this.token = GITHUB_TOKEN;
  }

  exec(cmd, options = {}) {
    try {
      return execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'], ...options });
    } catch (e) {
      return { error: e, stderr: e.stderr?.toString(), stdout: e.stdout?.toString() };
    }
  }

  getBranch() {
    const result = this.exec('git branch --show-current');
    return typeof result === 'string' ? result.trim() : 'main';
  }

  checkWorkingTree() {
    const result = this.exec('git status --porcelain');
    if (typeof result === 'string') {
      return result.trim().length === 0 ? 'clean' : 'dirty';
    }
    return 'unknown';
  }

  getChangedFiles() {
    const result = this.exec('git status --porcelain');
    if (typeof result === 'string') {
      return result.trim().split('\n').filter(line => line.length > 0).map(line => ({
        status: line.slice(0, 2).trim(),
        file: line.slice(3).trim()
      }));
    }
    return [];
  }

  hasRemote(name) {
    const result = this.exec(`git remote get-url ${name}`);
    return typeof result === 'string' && result.trim().length > 0;
  }

  configureTargetRemote() {
    if (this.hasRemote('target')) {
      this.exec('git remote remove target');
    }
    const result = this.exec(`git remote add target ${this.targetRepo}`);
    return !result.error;
  }

  generateCommitMessage(files) {
    const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
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

  /**
   * Auto-commit all changes with generated message
   * @returns {Promise<{success: boolean, commitHash?: string, message?: string}>}
   */
  async autoCommit() {
    const files = this.getChangedFiles();
    if (files.length === 0) {
      return { success: true, message: 'No changes to commit' };
    }

    // Stage all changes
    const addResult = this.exec('git add -A');
    if (addResult.error) {
      return { success: false, message: `Failed to stage: ${addResult.stderr}` };
    }

    // Create commit
    const commitMessage = this.generateCommitMessage(files);
    const commitResult = this.exec(`git commit -m "${commitMessage.replace(/"/g, '\\"')}"`);
    
    if (commitResult.error) {
      return { success: false, message: `Failed to commit: ${commitResult.stderr}` };
    }

    // Get commit hash
    const hashResult = this.exec('git rev-parse HEAD');
    const commitHash = typeof hashResult === 'string' ? hashResult.trim().slice(0, 7) : 'unknown';

    return { 
      success: true, 
      commitHash,
      message: `Committed ${files.length} file(s)`
    };
  }

  /**
   * Push to target repository
   * @returns {Promise<{success: boolean, message?: string}>}
   */
  async push() {
    if (!this.token) {
      return { success: false, message: 'GITHUB_TOKEN not configured' };
    }

    this.configureTargetRemote();

    const authUrl = this.targetRepo.replace('https://', `https://${this.token}@`);
    const result = this.exec(`git push "${authUrl}" HEAD:${this.targetBranch}`, {
      env: { ...process.env, GIT_TERMINAL_PROMPT: '0' }
    });

    if (result.error) {
      const errorMsg = result.stderr || result.error.message || 'Unknown error';
      if (errorMsg.includes('everything up-to-date')) {
        return { success: true, message: 'Everything up-to-date' };
      }
      return { success: false, message: errorMsg };
    }

    return { success: true, message: `Pushed to ${this.targetBranch}` };
  }

  /**
   * Full agentic sync: auto-commit (if dirty) + push
   * @returns {Promise<{success: boolean, message?: string, commits?: number}>}
   */
  async autoSync() {
    // Step 1: Auto-commit if needed
    if (this.checkWorkingTree() === 'dirty') {
      const commitResult = await this.autoCommit();
      if (!commitResult.success) {
        return commitResult;
      }
    }

    // Step 2: Push
    const pushResult = await this.push();
    return pushResult;
  }

  /**
   * Check if sync is needed
   * @returns {{needed: boolean, reason?: string, changedFiles: number}}
   */
  checkSyncNeeded() {
    const files = this.getChangedFiles();
    const isDirty = files.length > 0;
    
    // Check commit count
    const aheadResult = this.exec(`git rev-list --count target/${this.targetBranch}...HEAD`);
    const aheadCount = typeof aheadResult === 'string' ? parseInt(aheadResult.trim(), 10) || 0 : 0;

    if (isDirty) {
      return { needed: true, reason: 'working_tree_dirty', changedFiles: files.length };
    }
    if (aheadCount > 0) {
      return { needed: true, reason: 'commits_to_push', changedFiles: 0 };
    }
    return { needed: false, changedFiles: 0 };
  }
}

// Export for module usage
module.exports = { GitAutomation };

// CLI usage
if (require.main === module) {
  const automation = new GitAutomation();
  
  const command = process.argv[2];
  
  switch (command) {
    case 'commit':
      automation.autoCommit().then(r => {
        console.log(r.success ? '✓ ' + r.message : '✗ ' + r.message);
        process.exit(r.success ? 0 : 1);
      });
      break;
    case 'push':
      automation.push().then(r => {
        console.log(r.success ? '✓ ' + r.message : '✗ ' + r.message);
        process.exit(r.success ? 0 : 1);
      });
      break;
    case 'sync':
      automation.autoSync().then(r => {
        console.log(r.success ? '✓ ' + r.message : '✗ ' + r.message);
        process.exit(r.success ? 0 : 1);
      });
      break;
    case 'check':
      const status = automation.checkSyncNeeded();
      console.log(status.needed ? `Sync needed: ${status.reason}` : 'No sync needed');
      process.exit(status.needed ? 1 : 0);
      break;
    default:
      console.log('Usage: node git-automation.js [commit|push|sync|check]');
      process.exit(1);
  }
}
