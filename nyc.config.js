module.exports = {
  'check-coverage': true,
  lines: 90,
  statements: 90,
  functions: 90,
  branches: 90,
  watermarks: {
    lines: [85, 100],
    functions: [85, 100],
    branches: [85, 100],
    statements: [85, 100],
  },
  include: ['**/*.ts'],
  exclude: ['node_modules', 'test-results', 'test/*', "**/*.d.ts", '**/*.spec.ts', '*.config.js'],
  reporter: ['text', 'html', 'cobertura'],
  cache: false,
  all: true,
  'temp-directory': './test-results/coverage/.tmp',
  'report-dir': './test-results/coverage',
  require: [
    'ts-node/register',
    'source-map-support/register'
  ],
};
