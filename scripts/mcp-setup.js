#!/usr/bin/env node
/**
 * MCP Server Setup Script for Qualia3D
 * 
 * Automates MCP server configuration for CLINE/Roo Code
 * Target: Windows 11 + VS Code
 * 
 * Usage: node scripts/mcp-setup.cjs [--dry-run] [--restore]
 */

import { readFile, writeFile, copyFile, mkdir, access, readdir } from 'fs/promises';
import { join, dirname } from 'path';
import { homedir } from 'os';
import { fileURLToPath } from 'url';
import { getQualiaProjectPath } from './utils/path-resolver.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const PROJECT_ROOT = join(__dirname, '..');
const APPDATA = process.env.APPDATA || join(homedir(), 'AppData', 'Roaming');
const CLINE_SETTINGS_DIR = join(APPDATA, 'Code', 'User', 'globalStorage', 'saoudrizwan.claude-dev', 'settings');
const CLINE_SETTINGS_FILE = join(CLINE_SETTINGS_DIR, 'cline_mcp_settings.json');
const BACKUP_DIR = join(PROJECT_ROOT, '.cline', 'backups');

// MCP Server Configuration
const MCP_CONFIG = {
  mcpServers: {
    filesystem: {
      command: 'npx',
      args: [
        '-y',
        '@modelcontextprotocol/server-filesystem',
        getQualiaProjectPath()
      ],
      disabled: false
    },
    github: {
      command: 'npx',
      args: [
        '-y',
        '@modelcontextprotocol/server-github'
      ],
      env: {
        GITHUB_PERSONAL_ACCESS_TOKEN: '${env:GITHUB_TOKEN}'
      },
      disabled: false
    },
    puppeteer: {
      command: 'npx',
      args: [
        '-y',
        '@modelcontextprotocol/server-puppeteer'
      ],
      disabled: true
    }
  }
};

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function success(message) {
  log(`✅ ${message}`, 'green');
}

function warning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function error(message) {
  log(`❌ ${message}`, 'red');
}

function info(message) {
  log(`ℹ️  ${message}`, 'cyan');
}

function header(message) {
  log(`\n${'='.repeat(60)}`, 'bright');
  log(message, 'bright');
  log(`${'='.repeat(60)}\n`, 'bright');
}

// Utility: Check if path exists
async function pathExists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

// Utility: Create backup
async function createBackup(sourcePath) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = join(BACKUP_DIR, `mcp-settings-${timestamp}.json`);
  
  await mkdir(BACKUP_DIR, { recursive: true });
  await copyFile(sourcePath, backupPath);
  
  return backupPath;
}

// Step 1: Validate environment
async function validateEnvironment() {
  header('STEP 1: Environment Validation');

  const checks = [];

  // Check Node.js
  const nodeVersion = process.version;
  const nodeMajor = parseInt(nodeVersion.slice(1).split('.')[0]);
  checks.push({
    name: 'Node.js',
    status: nodeMajor >= 18,
    message: `${nodeVersion} (>= 18 required)`
  });

  // Check npx
  checks.push({
    name: 'npx',
    status: true,
    message: 'Available'
  });

  // Check project root
  const packageJsonExists = await pathExists(join(PROJECT_ROOT, 'package.json'));
  checks.push({
    name: 'Project Root',
    status: packageJsonExists,
    message: packageJsonExists ? PROJECT_ROOT : 'package.json not found'
  });

  // Validate filesystem MCP path
  try {
    const fsPath = getQualiaProjectPath();
    const fsPathExists = await pathExists(fsPath);
    checks.push({
      name: 'Filesystem MCP Path',
      status: fsPathExists,
      message: fsPathExists ? fsPath : `Path not found: ${fsPath}`
    });
  } catch (error) {
    checks.push({
      name: 'Filesystem MCP Path',
      status: false,
      message: `Error resolving path: ${error.message}`
    });
  }

  // Check .env
  const envExists = await pathExists(join(PROJECT_ROOT, '.env'));
  checks.push({
    name: '.env file',
    status: true,
    message: envExists ? 'Found' : 'Not found (create for GitHub MCP)'
  });

  // Print results
  let allPassed = true;
  for (const check of checks) {
    if (check.status) {
      success(`${check.name}: ${check.message}`);
    } else {
      error(`${check.name}: ${check.message}`);
      allPassed = false;
    }
  }

  if (!envExists) {
    warning('Create .env file with GITHUB_TOKEN to enable GitHub MCP');
  }

  return allPassed;
}

// Step 2: Detect VS Code installation
async function detectVSCode() {
  header('STEP 2: VS Code Detection');
  
  const vscodePaths = [
    join(APPDATA, 'Code'),
    'C:\\Program Files\\Microsoft VS Code',
    'C:\\Program Files (x86)\\Microsoft VS Code'
  ];
  
  let found = false;
  for (const path of vscodePaths) {
    if (await pathExists(path)) {
      success(`VS Code found: ${path}`);
      found = true;
      break;
    }
  }
  
  if (!found) {
    error('VS Code installation not detected');
    info('Please install VS Code from https://code.visualstudio.com/');
    return false;
  }
  
  info(`CLINE settings directory: ${CLINE_SETTINGS_DIR}`);
  
  return true;
}

// Step 3: Backup existing configuration
async function backupConfiguration(dryRun = false) {
  header('STEP 3: Configuration Backup');
  
  if (dryRun) {
    info('[DRY RUN] Would backup existing configuration');
    return true;
  }
  
  if (await pathExists(CLINE_SETTINGS_FILE)) {
    try {
      const backupPath = await createBackup(CLINE_SETTINGS_FILE);
      success(`Backed up existing configuration to: ${backupPath}`);
    } catch (err) {
      error(`Failed to create backup: ${err.message}`);
      return false;
    }
  } else {
    info('No existing configuration to backup');
  }
  
  return true;
}

// Step 4: Apply MCP configuration
async function applyConfiguration(dryRun = false) {
  header('STEP 4: MCP Configuration');
  
  // Read existing or create new
  let existingConfig = {};
  if (await pathExists(CLINE_SETTINGS_FILE)) {
    try {
      const content = await readFile(CLINE_SETTINGS_FILE, 'utf-8');
      existingConfig = JSON.parse(content);
      info('Loaded existing CLINE configuration');
    } catch (err) {
      warning(`Could not parse existing config: ${err.message}`);
    }
  }
  
  // Merge configurations
  const newConfig = {
    ...existingConfig,
    mcpServers: {
      ...existingConfig.mcpServers,
      ...MCP_CONFIG.mcpServers
    }
  };
  
  // Show what will change
  info('MCP Servers to configure:');
  for (const [name, config] of Object.entries(MCP_CONFIG.mcpServers)) {
    const status = config.disabled ? 'disabled' : 'enabled';
    log(`  • ${name}: ${status}`, config.disabled ? 'dim' : 'green');
  }
  
  if (dryRun) {
    info('[DRY RUN] Would write configuration:');
    console.log(JSON.stringify(newConfig, null, 2));
    return true;
  }
  
  // Create directory if needed
  await mkdir(CLINE_SETTINGS_DIR, { recursive: true });
  
  // Write configuration
  try {
    await writeFile(CLINE_SETTINGS_FILE, JSON.stringify(newConfig, null, 2), 'utf-8');
    success(`Configuration written to: ${CLINE_SETTINGS_FILE}`);
  } catch (err) {
    error(`Failed to write configuration: ${err.message}`);
    return false;
  }
  
  return true;
}

// Step 5: Validate configuration
async function validateConfiguration() {
  header('STEP 5: Validation');

  if (!await pathExists(CLINE_SETTINGS_FILE)) {
    error('Configuration file not found after writing');
    return false;
  }

  try {
    const content = await readFile(CLINE_SETTINGS_FILE, 'utf-8');
    const config = JSON.parse(content);

    // Validate structure
    if (!config.mcpServers) {
      error('MCP servers section missing');
      return false;
    }

    const requiredServers = ['filesystem', 'github', 'puppeteer'];
    for (const server of requiredServers) {
      if (config.mcpServers[server]) {
        success(`Server configured: ${server}`);
      } else {
        warning(`Server not found: ${server}`);
      }
    }

    // Validate filesystem path
    const fsConfig = config.mcpServers.filesystem;
    if (fsConfig && fsConfig.args) {
      const path = fsConfig.args[fsConfig.args.length - 1];
      const expectedPath = getQualiaProjectPath();
      
      if (path === expectedPath) {
        success('Filesystem MCP path correctly set to Qualia3D project');
      } else {
        warning(`Filesystem MCP path may be incorrect: ${path}`);
        warning(`Expected: ${expectedPath}`);
      }
    }

    return true;
  } catch (err) {
    error(`Validation failed: ${err.message}`);
    return false;
  }
}

// Step 6: Generate report
function generateReport(results) {
  header('SETUP REPORT');
  
  const allPassed = Object.values(results).every(r => r);
  
  if (allPassed) {
    success('All setup steps completed successfully!');
    log('\nNext steps:', 'bright');
    log('1. Restart VS Code (Ctrl+Shift+P → "Developer: Reload Window")');
    log('2. Open CLINE panel and verify MCP servers show green indicators');
    log('3. Test filesystem MCP by asking the agent to list project files');
    log('4. Create .env file with GITHUB_TOKEN to enable GitHub MCP');
  } else {
    error('Some setup steps failed. Check errors above.');
    log('\nTroubleshooting:', 'bright');
    log('• Ensure VS Code is installed');
    log('• Check that CLINE extension is installed');
    log('• Verify you have write permissions to AppData');
    log('• Run with --dry-run to see what would change');
  }
  
  log('\nDocumentation:', 'bright');
  log('• MCP Registry: src/docs/core/mcp-registry.md');
  log('• Dev Environment: src/docs/core/development-environment.md');
  log('• CLINE Config: src/docs/CLINE_CONFIGURATION.md');
}

// Restore from backup
async function restoreConfiguration() {
  header('RESTORE MODE');
  
  const backups = await pathExists(BACKUP_DIR) 
    ? await readdir(BACKUP_DIR)
    : [];
  
  if (backups.length === 0) {
    error('No backups found');
    return false;
  }
  
  // Sort by date (newest first)
  backups.sort().reverse();
  const latestBackup = join(BACKUP_DIR, backups[0]);
  
  info(`Restoring from: ${latestBackup}`);
  
  await mkdir(CLINE_SETTINGS_DIR, { recursive: true });
  await copyFile(latestBackup, CLINE_SETTINGS_FILE);
  
  success('Configuration restored');
  info('Please restart VS Code to apply changes');
  
  return true;
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const restore = args.includes('--restore');
  
  log(`${'='.repeat(60)}`, 'bright');
  log('Qualia3D MCP Server Setup', 'bright');
  log('Windows 11 + VS Code + CLINE', 'dim');
  log(`${'='.repeat(60)}`, 'bright');
  
  if (restore) {
    await restoreConfiguration();
    return;
  }
  
  if (dryRun) {
    warning('DRY RUN MODE - No changes will be made');
  }
  
  const results = {
    env: await validateEnvironment(),
    vscode: await detectVSCode(),
    backup: await backupConfiguration(dryRun),
    config: await applyConfiguration(dryRun),
    validate: dryRun ? true : await validateConfiguration()
  };
  
  generateReport(results);
  
  // Exit with appropriate code
  process.exit(Object.values(results).every(r => r) ? 0 : 1);
}

main().catch(err => {
  error(`Unexpected error: ${err.message}`);
  console.error(err);
  process.exit(1);
});
