#!/usr/bin/env node
/**
 * MCP Server Setup Script for Qualia3D
 * 
 * Automates MCP server configuration for CLINE/Roo Code
 * Target: Windows 11 + VS Code
 * 
 * Usage: node scripts/mcp-setup.cjs [--dry-run] [--restore]
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

// Configuration
const PROJECT_ROOT = path.resolve(__dirname, '..');
const APPDATA = process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming');
const CLINE_SETTINGS_DIR = path.join(APPDATA, 'Code', 'User', 'globalStorage', 'saoudrizwan.claude-dev', 'settings');
const CLINE_SETTINGS_FILE = path.join(CLINE_SETTINGS_DIR, 'cline_mcp_settings.json');
const BACKUP_DIR = path.join(PROJECT_ROOT, '.cline', 'backups');

// Get project path
function getQualiaProjectPath() {
  return PROJECT_ROOT;
}

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
      disabled: false,
      autoApprove: [
        'read_file',
        'read_text_file',
        'read_media_file',
        'read_multiple_files',
        'write_file',
        'edit_file',
        'create_directory',
        'list_directory',
        'list_directory_with_sizes',
        'directory_tree',
        'move_file',
        'search_files',
        'get_file_info'
      ]
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
      disabled: false,
      autoApprove: [
        'search_repositories',
        'get_file_contents',
        'create_issue',
        'create_pull_request',
        'fork_repository',
        'list_commits'
      ]
    },
    puppeteer: {
      command: 'npx',
      args: [
        '-y',
        '@modelcontextprotocol/server-puppeteer'
      ],
      disabled: true,
      autoApprove: [
        'puppeteer_navigate',
        'puppeteer_screenshot',
        'puppeteer_click',
        'puppeteer_fill',
        'puppeteer_select',
        'puppeteer_hover',
        'puppeteer_evaluate'
      ]
    },
    memory: {
      command: 'npx',
      args: [
        '-y',
        '@modelcontextprotocol/server-memory'
      ],
      disabled: false,
      autoApprove: [
        'create_entities',
        'create_relations',
        'add_observations',
        'delete_entities',
        'delete_observations',
        'delete_relations',
        'read_graph',
        'search_nodes',
        'open_nodes'
      ]
    },
    'sequential-thinking': {
      command: 'npx',
      args: [
        '-y',
        '@modelcontextprotocol/server-sequential-thinking'
      ],
      disabled: false,
      autoApprove: ['sequentialthinking']
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
function pathExistsSync(checkPath) {
  try {
    fs.accessSync(checkPath);
    return true;
  } catch {
    return false;
  }
}

// Utility: Create backup
function createBackup(sourcePath) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(BACKUP_DIR, `mcp-settings-${timestamp}.json`);
  
  if (!pathExistsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }
  
  fs.copyFileSync(sourcePath, backupPath);
  
  return backupPath;
}

// Step 1: Validate environment
function validateEnvironment() {
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
  const packageJsonExists = pathExistsSync(path.join(PROJECT_ROOT, 'package.json'));
  checks.push({
    name: 'Project Root',
    status: packageJsonExists,
    message: packageJsonExists ? PROJECT_ROOT : 'package.json not found'
  });

  // Validate filesystem MCP path
  try {
    const fsPath = getQualiaProjectPath();
    const fsPathExists = pathExistsSync(fsPath);
    checks.push({
      name: 'Filesystem MCP Path',
      status: fsPathExists,
      message: fsPathExists ? fsPath : `Path not found: ${fsPath}`
    });
  } catch (err) {
    checks.push({
      name: 'Filesystem MCP Path',
      status: false,
      message: `Error resolving path: ${err.message}`
    });
  }

  // Check .env
  const envExists = pathExistsSync(path.join(PROJECT_ROOT, '.env'));
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
function detectVSCode() {
  header('STEP 2: VS Code Detection');
  
  const vscodePaths = [
    path.join(APPDATA, 'Code'),
    'C:\\Program Files\\Microsoft VS Code',
    'C:\\Program Files (x86)\\Microsoft VS Code'
  ];
  
  let found = false;
  for (const vscodePath of vscodePaths) {
    if (pathExistsSync(vscodePath)) {
      success(`VS Code found: ${vscodePath}`);
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
function backupConfiguration(dryRun = false) {
  header('STEP 3: Configuration Backup');
  
  if (dryRun) {
    info('[DRY RUN] Would backup existing configuration');
    return true;
  }
  
  if (pathExistsSync(CLINE_SETTINGS_FILE)) {
    try {
      const backupPath = createBackup(CLINE_SETTINGS_FILE);
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
function applyConfiguration(dryRun = false) {
  header('STEP 4: MCP Configuration');
  
  // Read existing or create new
  let existingConfig = {};
  if (pathExistsSync(CLINE_SETTINGS_FILE)) {
    try {
      const content = fs.readFileSync(CLINE_SETTINGS_FILE, 'utf-8');
      existingConfig = JSON.parse(content);
      info('Loaded existing CLINE configuration');
    } catch (err) {
      warning(`Could not parse existing config: ${err.message}`);
    }
  }
  
  // Merge configurations - preserve existing servers not in our config
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
    const color = config.disabled ? 'dim' : 'green';
    log(`  • ${name}: ${status}`, color);
  }
  
  if (dryRun) {
    info('[DRY RUN] Would write configuration:');
    console.log(JSON.stringify(newConfig, null, 2));
    return true;
  }
  
  // Create directory if needed
  if (!pathExistsSync(CLINE_SETTINGS_DIR)) {
    fs.mkdirSync(CLINE_SETTINGS_DIR, { recursive: true });
  }
  
  // Write configuration
  try {
    fs.writeFileSync(CLINE_SETTINGS_FILE, JSON.stringify(newConfig, null, 2), 'utf-8');
    success(`Configuration written to: ${CLINE_SETTINGS_FILE}`);
  } catch (err) {
    error(`Failed to write configuration: ${err.message}`);
    return false;
  }
  
  return true;
}

// Step 5: Validate configuration
function validateConfiguration() {
  header('STEP 5: Validation');

  if (!pathExistsSync(CLINE_SETTINGS_FILE)) {
    error('Configuration file not found after writing');
    return false;
  }

  try {
    const content = fs.readFileSync(CLINE_SETTINGS_FILE, 'utf-8');
    const config = JSON.parse(content);

    // Validate structure
    if (!config.mcpServers) {
      error('MCP servers section missing');
      return false;
    }

    const requiredServers = ['filesystem', 'github', 'puppeteer', 'memory', 'sequential-thinking'];
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
      const serverPath = fsConfig.args[fsConfig.args.length - 1];
      const expectedPath = getQualiaProjectPath();
      
      if (serverPath === expectedPath) {
        success('Filesystem MCP path correctly set to Qualia3D project');
      } else {
        warning(`Filesystem MCP path may be incorrect: ${serverPath}`);
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
function restoreConfiguration() {
  header('RESTORE MODE');
  
  if (!pathExistsSync(BACKUP_DIR)) {
    error('No backup directory found');
    return false;
  }
  
  const backups = fs.readdirSync(BACKUP_DIR).filter(f => f.endsWith('.json'));
  
  if (backups.length === 0) {
    error('No backups found');
    return false;
  }
  
  // Sort by date (newest first)
  backups.sort().reverse();
  const latestBackup = path.join(BACKUP_DIR, backups[0]);
  
  info(`Restoring from: ${latestBackup}`);
  
  if (!pathExistsSync(CLINE_SETTINGS_DIR)) {
    fs.mkdirSync(CLINE_SETTINGS_DIR, { recursive: true });
  }
  
  fs.copyFileSync(latestBackup, CLINE_SETTINGS_FILE);
  
  success('Configuration restored');
  info('Please restart VS Code to apply changes');
  
  return true;
}

// Main execution
function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const restore = args.includes('--restore');
  
  log(`${'='.repeat(60)}`, 'bright');
  log('Qualia3D MCP Server Setup', 'bright');
  log('Windows 11 + VS Code + CLINE', 'dim');
  log(`${'='.repeat(60)}`, 'bright');
  
  if (restore) {
    const restored = restoreConfiguration();
    process.exit(restored ? 0 : 1);
  }
  
  if (dryRun) {
    warning('DRY RUN MODE - No changes will be made');
  }
  
  const results = {
    env: validateEnvironment(),
    vscode: detectVSCode(),
    backup: backupConfiguration(dryRun),
    config: applyConfiguration(dryRun),
    validate: dryRun ? true : validateConfiguration()
  };
  
  generateReport(results);
  
  // Exit with appropriate code
  process.exit(Object.values(results).every(r => r) ? 0 : 1);
}

main();
