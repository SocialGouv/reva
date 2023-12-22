/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  globals: {
    "ts-jest": {
      fastify: true,
    },
  },
  globalSetup: "./test/jestGlobalSetup.ts",
};
