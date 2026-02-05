#!/usr/bin/env node
/**
 * SHELL UTILITIES - Cross-Platform PowerShell/Unix Compatibility
 * > **ID**: SHELL_UTILS_V1.0
 * > **Role**: Provides Unix-like commands in PowerShell environments
 * > **Source**: `.clinerules` PowerShell Compatibility Directive
 *
 * This module solves the recurring PowerShell issue where Unix commands
 * like `head`, `tail`, `grep` are not recognized in Windows PowerShell.
 *
 * ## Usage
 * ```js
 * const { head, tail, grep, findPort, killPort } = require('./shell-utils.cjs');
 *
 * // Unix-like file operations
 * const first10Lines = head('file.txt', 10);
 * const last10Lines = tail('file.txt', 10);
 * const matches = grep('pattern', 'file.txt');
 *
 * // Port management
 * const pid = findPort(3000);
 * if (pid) killPort(3000);
 * ```
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// =============================================================================
// UNIX-LIKE FILE COMMANDS (PowerShell Compatible)
// =============================================================================

/**
 * Read first N lines of a file (Unix head equivalent)
 * @param {string} filePath - Path to file
 * @param {number} lines - Number of lines to read (default: 10)
 * @returns {string} File content
 */
function head(filePath, lines = 10) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return content.split('\n').slice(0, lines).join('\n');
  } catch (error) {
    console.error(`head: ${error.message}`);
    return '';
  }
}

/**
 * Read last N lines of a file (Unix tail equivalent)
 * @param {string} filePath - Path to file
 * @param {number} lines - Number of lines to read (default: 10)
 * @returns {string} File content
 */
function tail(filePath, lines = 10) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const allLines = content.split('\n');
    return allLines.slice(-lines).join('\n');
  } catch (error) {
    console.error(`tail: ${error.message}`);
    return '';
  }
}

/**
 * Search for pattern in file (Unix grep equivalent)
 * @param {string|RegExp} pattern - Pattern to search for
 * @param {string} filePath - Path to file
 * @param {Object} options - Options { ignoreCase: boolean, invert: boolean }
 * @returns {string[]} Matching lines
 */
function grep(pattern, filePath, options = {}) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const regex = pattern instanceof RegExp
      ? pattern
      : new RegExp(pattern, options.ignoreCase ? 'i' : '');

    return lines.filter(line => {
      const matches = regex.test(line);
      return options.invert ? !matches : matches;
    });
  } catch (error) {
    console.error(`grep: ${error.message}`);
    return [];
  }
}

/**
 * Search for files by pattern (Unix find equivalent)
 * @param {string} dir - Directory to search
 * @param {string} pattern - File pattern (e.g., '*.ts')
 * @param {Object} options - Options { recursive: boolean }
 * @returns {string[]} Matching file paths
 */
function find(dir, pattern, options = { recursive: true }) {
  const results = [];
  const regex = new RegExp(pattern.replace(/\*/g, '.*').replace(/\?/g, '.'));

  function search(currentDir) {
    try {
      const entries = fs.readdirSync(currentDir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);
        if (entry.isDirectory() && options.recursive) {
          search(fullPath);
        } else if (entry.isFile() && regex.test(entry.name)) {
          results.push(fullPath);
        }
      }
    } catch (error) {
      // Ignore permission errors
    }
  }

  search(dir);
  return results;
}

/**
 * Count lines/words/characters in file (Unix wc equivalent)
 * @param {string} filePath - Path to file
 * @returns {Object} Counts { lines, words, chars }
 */
function wc(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return {
      lines: content.split('\n').length,
      words: content.trim().split(/\s+/).length,
      chars: content.length
    };
  } catch (error) {
    console.error(`wc: ${error.message}`);
    return { lines: 0, words: 0, chars: 0 };
  }
}

// =============================================================================
// PORT MANAGEMENT (Windows PowerShell Compatible)
// =============================================================================

/**
 * Find process ID using a specific port
 * @param {number} port - Port number to check
 * @returns {number|null} Process ID or null if not found
 */
function findPort(port) {
  try {
    // PowerShell command to find process by port
    const cmd = `powershell -Command "Get-NetTCPConnection -LocalPort ${port} -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess"`;
    const result = execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
    return result ? parseInt(result, 10) : null;
  } catch (error) {
    return null;
  }
}

/**
 * Get detailed process information for a port
 * @param {number} port - Port number
 * @returns {Object|null} Process info { pid, name, path } or null
 */
function getProcessOnPort(port) {
  const pid = findPort(port);
  if (!pid) return null;

  try {
    const nameCmd = `powershell -Command "Get-Process -Id ${pid} -ErrorAction SilentlyContinue | Select-Object -ExpandProperty ProcessName"`;
    const name = execSync(nameCmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();

    const pathCmd = `powershell -Command "Get-Process -Id ${pid} -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Path"`;
    const procPath = execSync(pathCmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();

    return { pid, name, path: procPath };
  } catch (error) {
    return { pid, name: 'unknown', path: '' };
  }
}

/**
 * Kill process using a specific port
 * @param {number} port - Port number to free
 * @param {boolean} force - Force kill (default: false)
 * @returns {boolean} Success status
 */
function killPort(port, force = false) {
  const processInfo = getProcessOnPort(port);
  if (!processInfo) {
    console.log(`Port ${port} is not in use.`);
    return true;
  }

  console.log(`Found process using port ${port}:`);
  console.log(`  PID:  ${processInfo.pid}`);
  console.log(`  Name: ${processInfo.name}`);

  try {
    const forceFlag = force ? '-Force' : '';
    const cmd = `powershell -Command "Stop-Process -Id ${processInfo.pid} ${forceFlag} -ErrorAction Stop"`;
    execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
    console.log(`✓ Process ${processInfo.pid} terminated.`);
    return true;
  } catch (error) {
    console.error(`✗ Failed to kill process: ${error.message}`);
    return false;
  }
}

/**
 * Wait for port to become available
 * @param {number} port - Port number to wait for
 * @param {number} timeout - Max wait time in ms (default: 30000)
 * @returns {Promise<boolean>} True if port is free
 */
async function waitForPort(port, timeout = 30000) {
  const startTime = Date.now();
  const checkInterval = 500;

  return new Promise((resolve) => {
    const check = () => {
      const pid = findPort(port);
      if (!pid) {
        resolve(true);
        return;
      }

      if (Date.now() - startTime > timeout) {
        resolve(false);
        return;
      }

      setTimeout(check, checkInterval);
    };
    check();
  });
}

/**
 * Check if port is in use
 * @param {number} port - Port number
 * @returns {boolean} True if port is in use
 */
function isPortInUse(port) {
  return findPort(port) !== null;
}

// =============================================================================
// PROCESS MANAGEMENT
// =============================================================================

/**
 * Kill process by name (PowerShell compatible)
 * @param {string} processName - Name of process to kill
 * @param {boolean} force - Force kill
 * @returns {boolean} Success status
 */
function killProcessByName(processName, force = false) {
  try {
    const forceFlag = force ? '-Force' : '';
    const cmd = `powershell -Command "Get-Process '${processName}' -ErrorAction SilentlyContinue | Stop-Process ${forceFlag}"`;
    execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Check if process is running
 * @param {string} processName - Name of process
 * @returns {boolean} True if running
 */
function isProcessRunning(processName) {
  try {
    const cmd = `powershell -Command "Get-Process '${processName}' -ErrorAction SilentlyContinue | Measure-Object | Select-Object -ExpandProperty Count"`;
    const result = execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
    return parseInt(result, 10) > 0;
  } catch (error) {
    return false;
  }
}

// =============================================================================
// CLI INTERFACE
// =============================================================================

function printUsage() {
  console.log(`
Shell Utils v1.0 - Cross-Platform PowerShell Utilities

Usage: node shell-utils.cjs <command> [args...]

File Commands:
  head <file> [lines]     Show first N lines of file
  tail <file> [lines]     Show last N lines of file
  grep <pattern> <file>   Search for pattern in file
  find <dir> <pattern>    Find files matching pattern
  wc <file>               Count lines/words/chars

Port Commands:
  port:check <port>       Check if port is in use
  port:find <port>        Find process using port
  port:kill <port>        Kill process using port
  port:wait <port>        Wait for port to become free

Examples:
  node shell-utils.cjs head package.json 5
  node shell-utils.cjs port:check 3000
  node shell-utils.cjs port:kill 3000
`);
}

function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    printUsage();
    return;
  }

  const command = args[0];

  switch (command) {
    case 'head': {
      const [file, lines] = [args[1], parseInt(args[2], 10) || 10];
      if (!file) { console.error('Usage: head <file> [lines]'); return; }
      console.log(head(file, lines));
      break;
    }
    case 'tail': {
      const [file, lines] = [args[1], parseInt(args[2], 10) || 10];
      if (!file) { console.error('Usage: tail <file> [lines]'); return; }
      console.log(tail(file, lines));
      break;
    }
    case 'grep': {
      const [pattern, file] = [args[1], args[2]];
      if (!pattern || !file) { console.error('Usage: grep <pattern> <file>'); return; }
      const matches = grep(pattern, file);
      matches.forEach(line => console.log(line));
      break;
    }
    case 'find': {
      const [dir, pattern] = [args[1] || '.', args[2] || '*'];
      const files = find(dir, pattern);
      files.forEach(f => console.log(f));
      break;
    }
    case 'wc': {
      const file = args[1];
      if (!file) { console.error('Usage: wc <file>'); return; }
      const counts = wc(file);
      console.log(`${counts.lines} ${counts.words} ${counts.chars} ${file}`);
      break;
    }
    case 'port:check': {
      const port = parseInt(args[1], 10);
      if (!port) { console.error('Usage: port:check <port>'); return; }
      const inUse = isPortInUse(port);
      console.log(`Port ${port} is ${inUse ? 'IN USE' : 'FREE'}`);
      process.exit(inUse ? 1 : 0);
      break;
    }
    case 'port:find': {
      const port = parseInt(args[1], 10);
      if (!port) { console.error('Usage: port:find <port>'); return; }
      const info = getProcessOnPort(port);
      if (info) {
        console.log(`Port ${port}:`);
        console.log(`  PID:  ${info.pid}`);
        console.log(`  Name: ${info.name}`);
      } else {
        console.log(`Port ${port} is not in use.`);
      }
      break;
    }
    case 'port:kill': {
      const port = parseInt(args[1], 10);
      const force = args[2] === '--force' || args[2] === '-f';
      if (!port) { console.error('Usage: port:kill <port> [--force]'); return; }
      killPort(port, force);
      break;
    }
    case 'port:wait': {
      const port = parseInt(args[1], 10);
      const timeout = parseInt(args[2], 10) || 30000;
      if (!port) { console.error('Usage: port:wait <port> [timeout_ms]'); return; }
      waitForPort(port, timeout).then(free => {
        console.log(free ? `Port ${port} is now free.` : `Timeout waiting for port ${port}`);
      });
      break;
    }
    default:
      console.error(`Unknown command: ${command}`);
      printUsage();
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

// Export for use as module
module.exports = {
  // Unix-like commands
  head,
  tail,
  grep,
  find,
  wc,
  // Port management
  findPort,
  getProcessOnPort,
  killPort,
  waitForPort,
  isPortInUse,
  // Process management
  killProcessByName,
  isProcessRunning
};
