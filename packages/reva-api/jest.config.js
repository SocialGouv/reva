/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',

  collectCoverage: true,
  collectCoverageFrom: ["./domain/**"],
  coverageThreshold: {
    global: {
      lines: 90
    }
  }

};