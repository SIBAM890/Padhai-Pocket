/**
 * Metro configuration for Padhai Pocket
 * Adds polyfill for Node.js 'crypto' module
 * Allows imports from content/, shared/ sibling folders
 */

const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '..');

const config = getDefaultConfig(projectRoot);

// Allow imports from content/, shared/, and other sibling folders
config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
];
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  crypto: path.resolve(projectRoot, 'src/polyfills/crypto.ts'),
  '@content': path.resolve(workspaceRoot, 'content'),
  '@shared': path.resolve(workspaceRoot, 'shared'),
};

// Also ensure .ts files are resolved
config.resolver.sourceExts = [...config.resolver.sourceExts, 'ts', 'tsx'];

module.exports = config;