const path = require('path');
const lessLoader = require('../../lib/index');
const fs = require('fs');

const mockPlugin = {
  install(less, pluginManager, functions) {
    functions.add('foo', () => '"bar"');
  }
};

test('test that plugin compiles a file as expected', () => {
  const code = fs.readFileSync('test/resources/a-file-that-references-node-modules.less').toString();
  const expectedCode = fs.readFileSync('test/resources/expected/a-file-that-references-node-modules.css').toString();
  const mockContext = {
    options: {},
    sourceMap: true,
    dependencies: new Set()
  };
  const { process: processLess } = lessLoader({ nodeModulePath: 'test/resources/mock_node_modules', aliases: {} });

  return processLess.call(mockContext, { code }).then(result => {
    expect(result.code).toEqual(expectedCode);
    expect(result.map).toBeDefined();
  });
});

test('test that imports are added to dependencies', () => {
  const code = fs.readFileSync('test/resources/a-file-that-references-node-modules.less').toString();

  const mockContext = {
    options: {},
    dependencies: new Set()
  };

  const { process: processLess } = lessLoader({ nodeModulePath: 'test/resources/mock_node_modules', aliases: {} });

  return processLess.call(mockContext, { code }).then(() => {
    expect(mockContext.dependencies).toEqual(
      new Set([
        'test/resources/mock_node_modules/some-dir/somefile.less',
        'test/resources/mock_node_modules/a-different-dir/someFile.less'
      ])
    );
  });
});

test('test that plugins passed in via options are included when compiling', () => {
  const code = fs.readFileSync('test/resources/a-file-that-references-plugin.less').toString();
  const expectedCode = fs.readFileSync('test/resources/expected/a-file-that-references-plugin.css').toString();

  const mockContext = {
    options: {
      plugins: [mockPlugin]
    }
  };

  const { process: processLess } = lessLoader({ nodeModulePath: 'mock_node_modules', aliases: {} });

  return processLess.call(mockContext, { code }).then(result => expect(result.code).toEqual(expectedCode));
});
