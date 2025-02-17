const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname, {
  isCSSEnabled: true,
});

// Optimize Metro configuration
config.maxWorkers = 4;
config.transformer.minifierPath = require.resolve('metro-minify-terser');
config.transformer.minifierConfig = {
  compress: {
    drop_console: false,
    drop_debugger: true,
    reduce_vars: true
  },
  mangle: {
    toplevel: false,
    keep_classnames: true,
    keep_fnames: true
  }
};

// Optimize for development
config.transformer.devConfiguration = {
  dev: true,
  minify: false,
  generateSourceMaps: false
};

// Configure resolver
config.resolver.sourceExts = [...config.resolver.sourceExts, 'mjs', 'cjs'];
config.resolver.assetExts = [...config.resolver.assetExts, 'wasm'];

// Configure cache
config.resetCache = true;
config.cacheStores = [];

module.exports = config;