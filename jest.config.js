/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  roots: ['./src'],
  moduleNameMapper: {
    '@root/*': '<rootDir>/src/*',
    '@models/*': '<rootDir>/src/models/*',
    '@middlewares/(.*)': '<rootDir>/src/middlewares/$1',
    '@repositories/*': '<rootDir>/src/repositories/*',
    '@routes/*': '<rootDir>/src/routes/*',
    '@services/(.*)': '<rootDir>/src/services/$1',
    '@utils/(.*)': '<rootDir>/src/utils/$1',
    '@tests/*': 'tests/*',
  },
};
