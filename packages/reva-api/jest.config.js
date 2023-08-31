/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  globals: {
    "ts-jest": {
      fastify: true,
    },
  },
  collectCoverage: true,
  collectCoverageFrom: ["./domain/**", "./modules/**"],
  // coverageThreshold: {
  //   global: {
  //     lines: 90
  //   }
  // }
};
