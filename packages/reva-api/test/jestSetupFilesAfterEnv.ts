import { FastifyInstance } from "fastify";
import { clearDatabase } from "./jestClearDatabase";
import { getFastifyInstance } from "./jestFastifyInstance";

let app: FastifyInstance;

beforeAll(async () => {
  app = await getFastifyInstance();
});

afterAll(async () => {
  if (app) {
    await app.close();
  }
});

afterEach(async () => {
  await clearDatabase();
  jest.clearAllMocks();
});
