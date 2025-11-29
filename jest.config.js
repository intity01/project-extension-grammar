module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/test'],
  testMatch: ['**/*.test.ts'],
  passWithNoTests: true,
  moduleNameMapper: {
    '^vscode$': '<rootDir>/test/__mocks__/vscode.ts',
    '^vscode-languageclient$': '<rootDir>/test/__mocks__/vscode-languageclient.ts',
    '^vscode-languageclient/node$': '<rootDir>/test/__mocks__/vscode-languageclient.ts'
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
