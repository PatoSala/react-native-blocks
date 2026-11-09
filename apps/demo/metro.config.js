// Learn more: https://docs.expo.dev/guides/monorepos/
const path = require('path');
const fs = require('fs');
const { getDefaultConfig } = require('expo/metro-config');

const projectRoot = __dirname;
const projectNodeModules = path.resolve(projectRoot, 'node_modules');

const config = getDefaultConfig(projectRoot);

// This app uses a different Expo SDK (and therefore different react, react-native
// and native module versions) than the one hoisted at the workspace root.
// Workspace packages (packages/core, packages/blocks) would otherwise resolve these
// from the root node_modules, bundling two copies of React / mismatched native code.
// If a package is installed locally in this app, always resolve it from here.
const packageNameOf = (moduleName) => {
  if (moduleName.startsWith('.') || path.isAbsolute(moduleName)) return null;
  const parts = moduleName.split('/');
  return moduleName.startsWith('@') ? parts.slice(0, 2).join('/') : parts[0];
};

const localPackages = new Map();
const isLocalPackage = (name) => {
  if (!localPackages.has(name)) {
    localPackages.set(name, fs.existsSync(path.join(projectNodeModules, name, 'package.json')));
  }
  return localPackages.get(name);
};

const upstreamResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  const resolve = upstreamResolveRequest ?? context.resolveRequest;
  const name = packageNameOf(moduleName);
  if (name && isLocalPackage(name)) {
    return resolve(
      { ...context, originModulePath: path.join(projectRoot, 'package.json') },
      moduleName,
      platform
    );
  }
  return resolve(context, moduleName, platform);
};

module.exports = config;
