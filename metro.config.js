const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Resolve nested node_modules issues
config.resolver.nodeModulesPaths = [
    `${__dirname}/node_modules`,
];

// Ensure symlinks are resolved properly
config.resolver.unstable_enableSymlinks = true;

module.exports = config;
