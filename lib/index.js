const importCwd = require('import-cwd');
const pify = require('pify');
const path = require('path');
const { validateRollupPostcssLessLoaderOptions } = require('./validators');
const RollupFileManager = require('./RollupFileManager');
const replaceAliases = require('./replaceAliases');

const humanlizePath = filepath => path.relative(process.cwd(), filepath);

/**
 * Rollup Postcss Less Loader that is capable of resolving webpack style aliases
 *
 * Inspired by https://github.com/egoist/rollup-plugin-postcss/blob/5596ca978bee3d5c4da64c8ddd130ca3d8e77244/src/less-loader.js
 * but modified to use a custom file manager and resolve webpack aliases.
 *
 * @param options Information about the user.
 * @param {Object.<string, string>} options.aliases The user defined aliases.
 * @param {string} [options.nodeModulePath] The root node modules path, defaults to 'node_modules'
 */
const rollupPostcssLessLoader = options => {
  validateRollupPostcssLessLoaderOptions(options);
  options.nodeModulePath = options.nodeModulePath || 'node_modules';
  const rollupFileManager = new RollupFileManager(options.aliases, options.nodeModulePath);

  return {
    name: 'less',
    test: /\.less$/,

    async process({ code }) {
      code = replaceAliases(code, options.aliases, options.nodeModulePath);
      const less = importCwd('less');
      let { css, map, imports } = await pify(less.render.bind(importCwd('less')))(code, {
        ...this.options,
        sourceMap: this.sourceMap && {},
        filename: this.id,
        plugins: [
          {
            install(lessInstance, pluginManager) {
              pluginManager.addFileManager(rollupFileManager);
            },
            minVersion: [2, 1, 1]
          }
        ]
      });

      imports.forEach(dep => {
        this.dependencies.add(dep);
      });

      if (map) {
        map = JSON.parse(map);
        map.sources = map.sources.map(source => humanlizePath(source));
      }

      return {
        code: css,
        map
      };
    }
  };
};

module.exports = rollupPostcssLessLoader;
