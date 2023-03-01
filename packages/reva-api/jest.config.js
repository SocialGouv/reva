/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  globals: {
    "ts-jest": {
      fastify: true
    }
  },
  collectCoverage: true,
  collectCoverageFrom: ["./domain/**", "./infra/graphql/subscription/**"],
  // coverageThreshold: {
  //   global: {
  //     lines: 90
  //   }
  // }
};