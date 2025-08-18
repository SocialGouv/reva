/// <reference types="vitest" />
/// <reference types="vitest/globals" />

import type { FastifyInstance } from "fastify";

declare global {
  // eslint-disable-next-line no-var
  var testApp: FastifyInstance;
}

export {};
