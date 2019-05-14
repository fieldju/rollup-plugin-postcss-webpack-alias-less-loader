const less = require('less');
const replaceAliases = require('./replaceAliases');

/**
 * Custom file manager for less to support webpack style aliases.
 * This file manager loads the requested file and replaces instances of aliased imports before returning the file
 * contents for less to parse.
 *
 * Originally inspired by https://github.com/webpack-contrib/less-loader/blob/99aad2171e9784cecef2e7820fb8300698fe7007/src/createWebpackLessPlugin.js#L36
 * @private
 */
class RollupFileManager extends less.FileManager {
  /**
   * @param {Object.<string, string>} aliases The user defined aliases.
   * @param {string} nodeModulePath The root node modules path.
   */
  constructor(aliases, nodeModulePath) {
    super();
    this._aliases = aliases;
    this._node_modulesPath = nodeModulePath;
  }

  supports() {
    return true;
  }

  supportsSync() {
    return false;
  }

  async loadFile(filename, currentDirectory, options, environment) {
    const file = await super.loadFile(filename, currentDirectory, options, environment);
    file.contents = replaceAliases(file.contents, this._aliases, this._node_modulesPath);
    return file;
  }
}

module.exports = RollupFileManager;
