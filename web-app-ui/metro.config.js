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

const http = require('http');

// Reverse-proxy /v1 and /healthz to FastAPI on port 8000 (eliminates Chrome CORS preflight failures)
config.server = {
  ...(config.server || {}),
  enhanceMiddleware: (metroMiddleware) => {
    return (req, res, next) => {
      const url = req.url || '';
      if (
        url === '/healthz' ||
        url.startsWith('/healthz?') ||
        url.startsWith('/v1/')
      ) {
        const proxyReq = http.request(
          {
            hostname: '127.0.0.1',
            port: 8000,
            path: url,
            method: req.method,
            headers: {
              ...req.headers,
              host: '127.0.0.1:8000',
            },
          },
          (proxyRes) => {
            res.writeHead(proxyRes.statusCode, proxyRes.headers);
            proxyRes.pipe(res, { end: true });
          }
        );
        proxyReq.on('error', () => {
          res.writeHead(502, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: false, error: 'BACKEND_OFFLINE' }));
        });
        req.pipe(proxyReq, { end: true });
        return;
      }
      return metroMiddleware(req, res, next);
    };
  },
};

module.exports = config;