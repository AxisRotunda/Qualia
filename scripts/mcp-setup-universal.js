#!/usr/bin/env node
/**
 * Universal MCP Server Setup Script for Qualia3D
 * 
 * Auto-detects Cline vs Roo Code and configures MCP for the active extension
 * Target: Windows 11 + VS Code
 * 
 * Usage: node scripts/mcp-setup-universal.js [--dry-run]
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
const BACKUP_DIR = join(PROJECT_ROOT, '.cline', 'backups');

// Extension settings paths
const EXTENSIONS = {
  cline: {
    name: 'Cline',
    dir: join(APPDATA, 'Code', 'User', 'globalStorage', 'saoudrizwan.claude-dev', 'settings'),
    settingsFile: join(APPDATA, 'Code', 'User', 'globalStorage', 'saoudrizwan.claude-dev', 'settings', 'cline_mcp_settings.json')
  },
  rooCode: {
    name: 'Roo Code',
    dir: join(APPDATA, 'Code', 'User', 'globalStorage', 'rooveterinaryinc.roo-cline'),
    settingsFile: join(APPDATA, 'Code', 'User', 'globalStorage', 'rooveterinaryinc.roo-cline', 'settings.json')
  }
};

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

function success(message) { log(`✅ ${message}`, 'green'); }
function warning(message) { log(`⚠️  ${message}`, 'yellow'); }
function error(message) { log(`❌ ${message}`, 'red'); }
function info(message) { log(`ℹ️  ${message}`, 'cyan'); }
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
async function createBackup(sourcePath, extensionName) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = join(BACKUP_DIR, `mcp-settings-${extensionName.toLowerCase().replace(' ', '-')}-${timestamp}.json`);
  
  await mkdir(BACKUP_DIR, { recursive: true });
  await copyFile(sourcePath, backupPath);
  
  return backupPath;
}

// Step 1: Detect which extension is being used
async function detectExtension() {
  header('STEP 1: Extension Detection');
  
  const results = [];
  
  for (const [key, ext] of Object.entries(EXTENSIONS)) {
    const exists = await pathExists(ext.dir);
    results.push({ key, ...ext, exists });
    
    if (exists) {
      const settingsExists = await pathExists(ext.settingsFile);
      log(`  ${exists ? '✅' : '❌'} ${ext.name}: ${ext.dir}`);
      log(`     Settings: ${settingsExists ? 'Found' : 'Not created yet'}`);
    }
  }
  
  // Priority: Cline over Roo Code if both exist (Cline is the primary)
  const detected = results.find(r => r.exists && r.key === 'cline') || results.find(r => r.exists);
  
  if (!detected) {
    error('No extension detected!');
    info('Please install Cline or Roo Code extension in VS Code');
    return null;
  }
  
  success(`Detected: ${detected.name}`);
  return detected;
}

// Step 2: Validate environment
async function validateEnvironment() {
  header('STEP 2: Environment Validation');

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

  return allPassed;
}

// Step 3: Backup existing configuration
async function backupConfiguration(settingsFile, extensionName, dryRun = false) {
  header('STEP 3: Configuration Backup');
  
  if (dryRun) {
    info('[DRY RUN] Would backup existing configuration');
    return true;
  }
  
  if (await pathExists(settingsFile)) {
    try {
      const backupPath = await createBackup(settingsFile, extensionName);
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
async function applyConfiguration(settingsFile, extensionName, dryRun = false) {
  header('STEP 4: MCP Configuration');
  
  // Read existing or create new
  let existingConfig = {};
  if (await pathExists(settingsFile)) {
    try {
      const content = await readFile(settingsFile, 'utf-8');
      existingConfig = JSON.parse(content);
      info(`Loaded existing ${extensionName} configuration`);
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
  await mkdir(dirname(settingsFile), { recursive: true });
  
  // Write configuration
  try {
    await writeFile(settingsFile, JSON.stringify(newConfig, null, 2), 'utf-8');
    success(`Configuration written to: ${settingsFile}`);
  } catch (err) {
    error(`Failed to write configuration: ${err.message}`);
    return false;
  }
  
  return true;
}

// Step 5: Validate configuration
async function validateConfiguration(settingsFile) {
  header('STEP 5: Validation');

  if (!await pathExists(settingsFile)) {
    error('Configuration file not found after writing');
    return false;
  }

  try {
    const content = await readFile(settingsFile, 'utf-8');
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
function generateReport(results, extensionName) {
  header('SETUP REPORT');
  
  const allPassed = Object.values(results).every(r => r);
  
  if (allPassed) {
    success(`All setup steps completed successfully for ${extensionName}!`);
    log('\nNext steps:', 'bright');
    log('1. Restart VS Code (Ctrl+Shift+P → "Developer: Reload Window")');
    log('2. Open CLINE panel and verify MCP servers show green indicators');
    log('3. Test filesystem MCP by asking the agent to list project files');
    log('4. Create .env file with GITHUB_TOKEN to enable GitHub MCP');
  } else {
    error('Some setup steps failed. Check errors above.');
    log('\nTroubleshooting:', 'bright');
    log('• Ensure VS Code is installed');
    log('• Check that Cline/Roo Code extension is installed');
    log('• Verify you have write permissions to AppData');
    log('• Run with --dry-run to see what would change');
  }
  
  log('\nDocumentation:', 'bright');
  log('• MCP Registry: src/docs/core/mcp-registry.md');
  log('• Dev Environment: src/docs/core/development-environment.md');
  log('• CLINE Config: src/docs/CLINE_CONFIGURATION.md');
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  
  log(`${'='.repeat(60)}`, 'bright');
  log('Qualia3D Universal MCP Server Setup', 'bright');
  log('Auto-detects Cline/Roo Code + Windows 11', 'dim');
  log(`${'='.repeat(60)}`, 'bright');
  
  if (dryRun) {
    warning('DRY RUN MODE - No changes will be made');
  }
  
  // Detect extension first
  const extension = await detectExtension();
  if (!extension) {
    process.exit(1);
  }
  
  const results = {
    env: await validateEnvironment(),
    backup: await backupConfiguration(extension.settingsFile, extension.name, dryRun),
    config: await applyConfiguration(extension.settingsFile, extension.name, dryRun),
    validate: dryRun ? true : await validateConfiguration(extension.settingsFile)
  };
  
  generateReport(results, extension.name);
  
  // Exit with appropriate code
  process.exit(Object.values(results).every(r => r) ? 0 : 1);
}

main().catch(err => {
  error(`Unexpected error: ${err.message}`);
  console.error(err);
  process.exit(1);
});
