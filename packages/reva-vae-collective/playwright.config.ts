import { defineConfig, devices } from "next/experimental/testmode/playwright";

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testMatch: "tests/**/*.spec.ts",
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : 4,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: "html",
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: "http://localhost:4005/",

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        // Set cookies for all tests in this project
        contextOptions: {
          storageState: {
            cookies: [
              {
                name: "VAE_COLLECTIVE_AUTH_TOKENS",
                value: JSON.stringify({
                  accessToken:
                    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2ODQ4MzQ3MzAsImlhdCI6MTY4NDgzNDY3MCwiYXV0aF90aW1lIjoxNjg0ODM0NjE4LCJqdGkiOiIxMjMiLCJpc3MiOiJodHRwczovL2V4YW1wbGUuY29tIiwiYXVkIjoiYWNjb3VudCIsInN1YiI6IjEyMyIsInR5cCI6IkJlYXJlciIsImF6cCI6InJldmEtYWRtaW4iLCJub25jZSI6IjFkZDQ5ZDYyLWJjZjMtNDQyMC1iZTAzLTU3NjUxMTg0ZTQzMSIsInNlc3Npb25fc3RhdGUiOiJmOWVhZDJhMy1lMDk1LTQ2MDAtOWU4ZC02MTRiOWQ2ZTcwM2YiLCJhY3IiOiIwIiwiYWxsb3dlZC1vcmlnaW5zIjpbXSwicmVhbG1fYWNjZXNzIjp7InJvbGVzIjpbImRlZmF1bHQtcm9sZXMtcmV2YSIsIm1hbmFnZV9hY2NvdW50Iiwib2ZmbGluZV9hY2Nlc3MiLCJhZG1pbiIsInVtYV9hdXRob3JpemF0aW9uIl19LCJyZXNvdXJjZV9hY2Nlc3MiOnsicmV2YS12YWUtY29sbGVjdGl2ZSI6eyJyb2xlcyI6WyJtYW5hZ2VfYWNjb3VudCIsImFkbWluIl19LCJhY2NvdW50Ijp7InJvbGVzIjpbIm1hbmFnZS1hY2NvdW50IiwibWFuYWdlLWFjY291bnQtbGlua3MiLCJ2aWV3LXByb2ZpbGUiXX19LCJzY29wZSI6IiIsInNpZCI6IiIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiIiLCJlbWFpbCI6IiJ9.Y28LgwcBXp1A7IyDCLWcuMvbVzKziJUOzeEais5oWRE",
                  refreshToken:
                    "eyJhbGciOiJIUzI1NiJ9.eyJleHAiOjE2ODQ4MzY0NzAsImlhdCI6MTY4NDgzNDY3MCwiaXNzIjoiaHR0cHM6Ly9leGFtcGxlLmNvbSIsImF1ZCI6Imh0dHBzOi8vZXhhbXBsZS5jb20iLCJzdWIiOiI5NzI5ZTQ1OC04NjYxLTQxNWYtYjk2MC0wOGExMjU0MTZhM2EiLCJ0eXAiOiJSZWZyZXNoIiwiYXpwIjoicmV2YS1hZG1pbiIsIm5vbmNlIjoiMWRkNDlkNjItYmNmMy00NDIwLWJlMDMtNTc2NTExODRlNDMxIiwic2Vzc2lvbl9zdGF0ZSI6ImY5ZWFkMmEzLWUwOTUtNDYwMC05ZThkLTYxNGI5ZDZlNzAzZiIsInNjb3BlIjoiIiwic2lkIjoiIn0.Uw_LXLsrn90Yau8sT_nN-_3WSrS2ZHEomgaU7jqieEg",
                }),
                domain: "localhost",
                path: "/",
                httpOnly: false,
                secure: false,
                sameSite: "Lax",
                expires: -1,
              },
            ],
            origins: [],
          },
        },
      },
    },
    /*
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },

    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
*/
    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: "npm run dev -- -p 4005",
    url: "http://localhost:4005/vae-collective/",
    stdout: "ignore",
    env: {
      APP_ENV: "test",
      GRAPHQL_API_URL: "https://reva-api/api/graphql",
    },
  },
});
