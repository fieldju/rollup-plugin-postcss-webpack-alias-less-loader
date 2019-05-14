/**
 * @private
 * @param options
 */
const validateRollupPostcssLessLoaderOptions = options => {
  if (typeof options !== 'object') {
    throw new Error('options must be a object');
  }
  if (typeof options.aliases !== 'object') {
    throw new Error('options.alias must be a object');
  }
};

module.exports = {
  validateRollupPostcssLessLoaderOptions
};
