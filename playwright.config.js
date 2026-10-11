// @ts-check
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 30_000,
  retries: 0,
  reporter: 'list',
  use: {
    baseURL: process.env.APP_URL || 'http://localhost:3001',
    headless: true,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  // Start the demo server automatically before tests
  webServer: {
    command: 'node server.js',
    url: 'http://localhost:3001/health',
    timeout: 15_000,
    reuseExistingServer: true,
    env: {
      PORT: '3001',
      REVISION: process.env.REVISION || 'a',
    },
  },
});
