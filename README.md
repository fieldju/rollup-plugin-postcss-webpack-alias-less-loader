# Rollup Plugin Postcss Webpack Alias Less Loader

[![npm version](https://badge.fury.io/js/rollup-plugin-postcss-webpack-alias-less-loader.svg)](https://badge.fury.io/js/rollup-plugin-postcss-webpack-alias-less-loader) [![Build Status](https://travis-ci.org/fieldju/rollup-plugin-postcss-webpack-alias-less-loader.svg?branch=master)](https://travis-ci.org/fieldju/rollup-plugin-postcss-webpack-alias-less-loader) [![Coverage Status](https://coveralls.io/repos/github/fieldju/rollup-plugin-postcss-webpack-alias-less-loader/badge.svg?branch=master)](https://coveralls.io/github/fieldju/rollup-plugin-postcss-webpack-alias-less-loader?branch=master) 

This is a custom loader for [Rollup Plugin Postcss](https://github.com/egoist/rollup-plugin-postcss) that allows users to define webpack style aliases and have them resolve.

ex:
```less
@import "~bootstrap/less/common.less";
@import "~myAlias";
```

see: [rollupPostcssLessLoader](http://fieldju.com/rollup-plugin-postcss-webpack-alias-less-loader/global.html#rollupPostcssLessLoader) for full docs

`~` will get resolved to `node_modules` by default but is overridable.

usage below is a complete example that is used along side webpack to generate cjs and es modules:

```javascript
const alias = require('rollup-plugin-alias');
// Cant use rollup-plugin-typescript until the following issue is resolved, rollup-plugin-typescript2 is slow, but works :(
// https://github.com/rollup/rollup-plugin-typescript/issues/109
// const typescript = require('rollup-plugin-typescript');
const typescript = require('rollup-plugin-typescript2');
const postcss = require('rollup-plugin-postcss');
const path = require('path');
const { minify } = require('html-minifier');
const external = require('@yelo/rollup-node-external');
const rollupPostcssLessLoader = require('rollup-plugin-postcss-webpack-alias-less-loader')

// Slurp in the webpack config so we don't have to duplicate aliases.
const webpackConfig = require('./webpack.config');

const aliases = webpackConfig.resolve.alias;

const NODE_MODULE_PATH = path.resolve('../../../../node_modules');

const CONFIG = {
  external: external({
    modulesDir: NODE_MODULE_PATH,
  }),
  input: [webpackConfig.entry.lib],
  output: { name: 'core', file: 'lib/lib.es.js', format: 'es', sourcemap: true },
  treeshake: true,
  plugins: [
    {
      // LOGGING PLUGIN
      transform(code, id) {
        console.log(`Processing: '${id}'`);
      },
    },
    alias({
      resolve: ['.ts', '.tsx', '/index.ts', '/index.tsx'],
      ...aliases,
    }),
    typescript({
      check: false,
    }),
    postcss({
      loaders: [rollupPostcssLessLoader({
        nodeModulePath: NODE_MODULE_PATH,
        aliases: aliases
      })],
    }),
    {
      // HTML TEMPLATE PLUGIN
      transform(code, id) {
        if (id.endsWith('.html')) {
          return {
            code: `export default ${JSON.stringify(minify(code, {}))}`,
            map: { mappings: '' },
          };
        }
      },
    },
  ],
};

module.exports = {
  default: CONFIG,
};
```
