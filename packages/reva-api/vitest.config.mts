import path from "path";

import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    env: {
      BASE_URL: "http://localhost:3003",
      ADMIN_REACT_BASE_URL: "http://localhost:3003/admin2",
      NODE_ENV: "test",
      DATABASE_URL: "postgresql://reva:password@localhost:5444/reva-test",
    },
    setupFiles: ["./vitest.setup.ts"],
    server: {
      deps: {
        inline: ["@keycloak/keycloak-admin-client"],
      },
    },
    globalSetup: ["./vitest.global-setup.ts"],
    include: ["./modules/**/*.test.ts"],
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/coverage/**",
      "**/.cache/**",
    ],
    testTimeout: 30000,
    hookTimeout: 10000,
    pool: "threads",
    poolOptions: {
      threads: {
        singleThread: true,
      },
    },
    isolate: false,
    maxConcurrency: 1,
    fileParallelism: false,
    sequence: {
      hooks: "list",
      concurrent: false,
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary", "html"],
      reportsDirectory: "./coverage",
      exclude: [
        "coverage/**",
        "dist/**",
        "test/**",
        "**/*.d.ts",
        "vitest*.ts",
        "prisma/**",
        "scripts/**",
        "**/node_modules/**",
      ],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
    },
    reporters: ["basic"],
    clearMocks: true,
    restoreMocks: true,
    mockReset: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
      ".prisma/client": path.resolve(
        __dirname,
        "./node_modules/.prisma/client",
      ),
    },
  },
});
