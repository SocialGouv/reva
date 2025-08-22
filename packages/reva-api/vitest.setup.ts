import { FastifyInstance } from "fastify";

import { testClearDatabase } from "./test/test-clear-database";
import { getFastifyInstance } from "./test/test-fastify-instance";

const g = globalThis as any;

if (!g.__REVA_CREATING_APP__) {
  g.__REVA_CREATING_APP__ = (async () => {
    if (!g.__REVA_TEST_APP__) {
      const app: FastifyInstance = await getFastifyInstance();
      g.__REVA_TEST_APP__ = app;
      global.testApp = app;
    } else {
      global.testApp = g.__REVA_TEST_APP__;
    }
    return g.__REVA_TEST_APP__;
  })();
}

beforeEach(async () => {
  await testClearDatabase();
  vi.clearAllMocks();
});
