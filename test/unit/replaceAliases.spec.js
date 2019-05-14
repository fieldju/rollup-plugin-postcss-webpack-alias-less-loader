const path = require('path')
const replaceAliases = require('../../lib/replaceAliases');
const fs = require('fs')

test('test that replaceAliases can resolve node_modules dir alias', () => {
  const code = fs.readFileSync('test/resources/a-file-that-references-node-modules.less').toString();
  const parsedCode = replaceAliases(code, {}, 'test/resources/mock_node_modules')
  expect(parsedCode).toEqual(fs.readFileSync('test/resources/expected/a-file-that-references-node-modules.less').toString());
})

test('test that replaceAliases can resolve aliases and node_module references', () => {
  const code = fs.readFileSync('test/resources/a-file-that-references-node-modules-and-aliases.less').toString();
  const parsedCode = replaceAliases(code, {
    someAlias: 'some/manual/path/to/something.less'
  }, 'test/resources/mock_node_modules')
  expect(parsedCode).toEqual(fs.readFileSync('test/resources/expected/a-file-that-references-node-modules-and-aliases.less').toString());
})

test('test that replaceAliases resolves alias that is not absolute', () => {
  expect(replaceAliases('@import "~someAlias/foo/bar/it.less";', {
    someAlias: 'test/resources/mock_node_modules/core/core_less'
  }, 'test/resources/mock_node_modules'))
    .toEqual('@import "test/resources/mock_node_modules/core/core_less/foo/bar/it.less";')
})

test('test that replaceAliases resolves alias that is absolute', () => {
  expect(replaceAliases('@import "~someAlias";', {
    someAlias: 'test/resources/mock_node_modules/core/core_less/it.less'
  }, 'test/resources/mock_node_modules'))
    .toEqual('@import "test/resources/mock_node_modules/core/core_less/it.less";')
})

test('test that replaceAliases can resolve aliases that share prefixes', () => {
  const aliases = {
    core: 'path/to/core',
    root: 'path/to/root',
    coreImports: 'node_modules/core-lib/core-imports.less'
  }

  const code = '@import (reference) "~coreImports";\n@import (reference) "~core/it.less";';
  const parsedCode = replaceAliases(code, aliases, 'test/resources/mock_node_modules');
  expect(parsedCode).toEqual('@import (reference) "node_modules/core-lib/core-imports.less";\n@import (reference) "path/to/core/it.less";')
})
