// Ensure environment variables are read.
import * as dotenv from 'dotenv';
import fetch from 'node-fetch';
dotenv.config();

export default {
  transformIgnorePatterns: ['<rootDir>/node_modules/'],
  roots: ['<rootDir>/src'],
  testTimeout: 20000,
  setupFilesAfterEnv: ['<rootDir>/test/setupTests.js'],
  moduleFileExtensions: ['js', 'ts', 'tsx'],
  testEnvironment: 'jsdom',
  globals: {
    'ts-jest': {
      babel: true,
      // useESM: true,
      tsConfig: 'tsconfig.json',
    },
    fetch,
  },
};
