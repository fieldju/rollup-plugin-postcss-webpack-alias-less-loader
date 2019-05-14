const aliasRegex = alias => {
  return new RegExp(`(@import.*?)(["'])~${alias}(["'/])(.*?;)`, 'g');
};
const nodeModuleRegex = new RegExp(/(@import.*?)["']~(.*?)["'].*?/g);

/**
 * This function takes the unparsed less code and replaces instances of webpack style aliases with the resolved alias.
 *
 * @param {string} code The unparsed less code.
 * @param {Object.<string, string>} aliases The user defined aliases.
 * @param {string} nodeModulePath The root node modules path.
 * @return {string} The less parsable code with aliases resolved.
 * @private
 */
const replaceAliases = (code, aliases, nodeModulePath) => {
  Object.keys(aliases).forEach(alias => {
    code = code.replace(aliasRegex(alias), `$1$2${aliases[alias]}$3$4`);
  });
  code = code.replace(nodeModuleRegex, `$1"${nodeModulePath}/$2"`);
  return code;
};

module.exports = replaceAliases;
