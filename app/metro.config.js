/**
 * Metro configuration for Padhai Pocket
 * Adds polyfill for Node.js 'crypto' module
 */

const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add resolver for crypto polyfill using extraNodeModules
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  crypto: path.resolve(__dirname, 'src/polyfills/crypto.ts'),
};

// Also ensure .ts files are resolved
config.resolver.sourceExts = [...config.resolver.sourceExts, 'ts', 'tsx'];

module.exports = config;