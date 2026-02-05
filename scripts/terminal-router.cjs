#!/usr/bin/env node
/**
 * Terminal Router - Smart Command Routing for VS Code Terminals
 *
 * This utility routes commands to the appropriate function-specific terminal
 * based on command type/intent. Works in conjunction with .vscode/tasks.json
 * and terminal profiles defined in .vscode/settings.json.
 *
 * Usage:
 *   node scripts/terminal-router.cjs <command> [args...]
 *   node scripts/terminal-router.cjs dev serve
 *   node scripts/terminal-router.cjs git status
 *   node scripts/terminal-router.cjs diagnostics
 *
 * @module terminal-router
 * @version 1.0.0
 */

const { execSync } = require('child_process');
const path = require('path');

// Terminal configuration mapping commands to terminals
const TERMINAL_CONFIG = {
  // Purple Dev Terminal - Build, npm, ng commands
  dev: {
    keywords: ['npm', 'ng', 'node', 'npx', 'tsc', 'build', 'serve', 'test', 'lint', 'install'],
    commands: ['npm run', 'ng build', 'ng serve', 'npm install', 'npm test'],
    color: 'magenta',
    icon: 'tools'
  },

  // Green Git Terminal - Git operations
  git: {
    keywords: ['git', 'sync', 'commit', 'push', 'pull', 'merge', 'rebase', 'status', 'log'],
    commands: ['git status', 'git pull', 'git push', 'git commit', 'git log'],
    color: 'green',
    icon: 'git-branch'
  },

  // Yellow esbuild Terminal - Bundling
  esbuild: {
    keywords: ['esbuild', 'bundle', 'rollup', 'webpack', 'vite'],
    commands: ['node esbuild', 'esbuild'],
    color: 'yellow',
    icon: 'package'
  },

  // Red Cline Terminal - Agent operations
  cline: {
    keywords: ['diagnostics', 'analyze', 'audit', 'repair', 'sync', 'check'],
    commands: ['node scripts/', 'diagnostics', 'analyze'],
    color: 'red',
    icon: 'robot'
  },

  // White CLI Terminal - Kat Koder Pro operations
  cli: {
    keywords: ['cli', 'kat', 'koder'],
    commands: [],
    color: 'white',
    icon: 'terminal'
  }
};

/**
 * Detect the target terminal based on command intent
 * @param {string} command - The command to analyze
 * @returns {string} Terminal name (dev, git, esbuild, cline, cli)
 */
function detectTerminal(command) {
  const cmd = command.toLowerCase();

  // Check exact command matches first
  for (const [terminal, config] of Object.entries(TERMINAL_CONFIG)) {
    for (const exactCmd of config.commands) {
      if (cmd.startsWith(exactCmd.toLowerCase())) {
        return terminal;
      }
    }
  }

  // Check keyword matches
  for (const [terminal, config] of Object.entries(TERMINAL_CONFIG)) {
    for (const keyword of config.keywords) {
      if (cmd.includes(keyword.toLowerCase())) {
        return terminal;
      }
    }
  }

  // Default to dev for npm/node related, cline for scripts
  if (cmd.includes('node') || cmd.includes('npm')) {
    return 'dev';
  }

  return 'cline';
}

/**
 * Execute a command in the specified terminal via VS Code CLI
 * @param {string} terminal - Target terminal name
 * @param {string} command - Command to execute
 */
function executeInTerminal(terminal, command) {
  try {
    const terminalName = terminal.charAt(0).toUpperCase() + terminal.slice(1);

    console.log(`[Terminal Router] Routing to ${terminal.toUpperCase()} terminal: ${command}`);

    const colorCode = TERMINAL_CONFIG[terminal]?.color || 'white';
    const icon = TERMINAL_CONFIG[terminal]?.icon || 'terminal';

    console.log(`\x1b[${getColorCode(colorCode)}m[${icon.toUpperCase()} ${terminal.toUpperCase()}]\x1b[0m ${command}`);

    return { terminal, command, color: colorCode, icon };
  } catch (error) {
    console.error('[Terminal Router] Error:', error.message);
    throw error;
  }
}

/**
 * Get ANSI color code
 * @param {string} color - Color name
 * @returns {string} ANSI color code
 */
function getColorCode(color) {
  const codes = {
    magenta: '35',
    red: '31',
    green: '32',
    yellow: '33',
    white: '37'
  };
  return codes[color] || '37';
}

/**
 * Run diagnostics on the project
 */
function runDiagnostics() {
  console.log('\n🔍 Running Project Diagnostics...\n');

  const checks = [
    { name: 'Node Version', cmd: 'node --version' },
    { name: 'NPM Version', cmd: 'npm --version' },
    { name: 'Git Status', cmd: 'git status --short' }
  ];

  for (const check of checks) {
    try {
      const result = execSync(check.cmd, { encoding: 'utf8', cwd: process.cwd(), stdio: ['pipe', 'pipe', 'ignore'] }).trim();
      console.log(`  ✓ ${check.name}: ${result || 'OK'}`);
    } catch (error) {
      console.log(`  ✗ ${check.name}: Error`);
    }
  }

  console.log('\n✅ Diagnostics complete.\n');
}

/**
 * Analyze codebase structure
 */
function analyzeCodebase() {
  console.log('\n📊 Analyzing Codebase Structure...\n');

  try {
    // Use PowerShell for cross-platform file counting on Windows
    const srcCount = execSync('powershell -Command "(Get-ChildItem -Recurse -Filter *.ts | Measure-Object).Count"', { encoding: 'utf8' }).trim();
    console.log(`  TypeScript Files: ${srcCount}`);

    const compCount = execSync('powershell -Command "(Get-ChildItem -Path src/components -Recurse -Filter *.ts -ErrorAction SilentlyContinue | Measure-Object).Count"', { encoding: 'utf8' }).trim();
    console.log(`  Components: ${compCount}`);

    const svcCount = execSync('powershell -Command "(Get-ChildItem -Path src/services -Recurse -Filter *.ts -ErrorAction SilentlyContinue | Measure-Object).Count"', { encoding: 'utf8' }).trim();
    console.log(`  Services: ${svcCount}`);

    const engCount = execSync('powershell -Command "(Get-ChildItem -Path src/engine -Recurse -Filter *.ts -ErrorAction SilentlyContinue | Measure-Object).Count"', { encoding: 'utf8' }).trim();
    console.log(`  Engine: ${engCount}`);

  } catch (error) {
    console.log('  Note: File counting requires PowerShell');
  }

  console.log('\n✅ Analysis complete.\n');
}

/**
 * Main CLI handler
 */
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
Terminal Router v1.0.0

Usage:
  node scripts/terminal-router.cjs <command> [args...]

Commands:
  dev <cmd>       Route to purple dev terminal (npm, ng, build)
  git <cmd>       Route to green git terminal
  esbuild <cmd>   Route to yellow esbuild terminal
  cline <cmd>     Route to red cline terminal
  cli <cmd>       Route to white CLI terminal

Special Commands:
  diagnostics     Run project diagnostics
  analyze         Analyze codebase structure

Examples:
  node scripts/terminal-router.cjs dev npm run build
  node scripts/terminal-router.cjs git status
  node scripts/terminal-router.cjs diagnostics
`);
    return;
  }

  const subCommand = args[0];
  const remainingArgs = args.slice(1);
  const fullCommand = remainingArgs.join(' ');

  // Handle special commands
  if (subCommand === 'diagnostics') {
    runDiagnostics();
    return;
  }

  if (subCommand === 'analyze') {
    analyzeCodebase();
    return;
  }

  // Handle terminal routing
  const validTerminals = Object.keys(TERMINAL_CONFIG);

  if (validTerminals.includes(subCommand)) {
    // Explicit terminal specified
    executeInTerminal(subCommand, fullCommand);
  } else {
    // Auto-detect terminal based on command
    const detectedTerminal = detectTerminal(subCommand + ' ' + fullCommand);
    executeInTerminal(detectedTerminal, args.join(' '));
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  detectTerminal,
  executeInTerminal,
  TERMINAL_CONFIG
};
