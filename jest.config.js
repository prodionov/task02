module.exports = {
  preset: 'ts-jest/presets/js-with-ts',
  rootDir: '.',
  roots: ['<rootDir>'],
  modulePaths: ['<rootDir>'],
  testEnvironment: 'node',
  testTimeout: 20000,
  globals: {
    'ts-jest': {
      tsconfig: './tsconfig.test.json',
    },
  },
  collectCoverage: false,
  testPathIgnorePatterns: ['/node_modules/'],
}
