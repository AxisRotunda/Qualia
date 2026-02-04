/**
 * Path Resolution Utility for Qualia3D MCP Setup
 * 
 * Provides dynamic path resolution for MCP server configuration
 */

import { fileURLToPath } from 'url';
import { dirname, join, resolve } from 'path';
import fs from 'fs';

// Get the directory of the current script
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Resolves the project root directory dynamically
 * 
 * @returns {string} Absolute path to the project root
 * @throws {Error} If project root cannot be determined
 */
export function getProjectRoot() {
  // Start from the scripts directory and go up to find project root
  let currentDir = resolve(__dirname, '..');
  
  // Search for package.json to identify project root
  let maxDepth = 10; // Prevent infinite loops
  while (maxDepth > 0) {
    const packageJsonPath = join(currentDir, 'package.json');
    
    try {
      // Check if package.json exists
      if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
        if (packageJson.name && packageJson.version) {
          return currentDir;
        }
      }
    } catch (error) {
      // package.json not found or invalid, go up one directory
    }
    
    // Go up one directory
    const parentDir = dirname(currentDir);
    if (parentDir === currentDir) {
      break; // Reached filesystem root
    }
    currentDir = parentDir;
    maxDepth--;
  }
  
  throw new Error('Could not determine project root. Please ensure this is run from within a Qualia3D project.');
}

/**
 * Gets the absolute path to the Qualia3D project directory
 * 
 * @returns {string} Absolute path to Qualia3D project
 */
export function getQualiaProjectPath() {
  const projectRoot = getProjectRoot();
  return projectRoot;
}

/**
 * Validates that a path exists and is accessible
 * 
 * @param {string} pathToValidate - Path to validate
 * @returns {boolean} True if path exists and is accessible
 */
export function validatePath(pathToValidate) {
  try {
    fs.accessSync(pathToValidate);
    return true;
  } catch {
    return false;
  }
}

/**
 * Normalizes a path for cross-platform compatibility
 * 
 * @param {string} pathToNormalize - Path to normalize
 * @returns {string} Normalized path
 */
export function normalizePath(pathToNormalize) {
  return resolve(pathToNormalize);
}
