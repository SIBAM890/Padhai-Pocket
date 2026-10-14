/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.ts'],
  verbose: true,
  forceExit: true,
  detectOpenHandles: false,
  moduleNameMapper: {
    '^react-native$': '<rootDir>/tests/mocks/react-native.js',
    '^@react-native-community/netinfo$': '<rootDir>/tests/mocks/netinfo.js',
    '^expo-sqlite$': '<rootDir>/tests/mocks/expo-sqlite.js',
    '^expo-secure-store$': '<rootDir>/tests/mocks/expo-secure-store.js',
    '^@react-navigation/native$': '<rootDir>/tests/mocks/react-navigation.js',
    '^@react-navigation/native-stack$': '<rootDir>/tests/mocks/react-navigation.js',
  },
};
