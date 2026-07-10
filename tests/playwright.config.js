// @ts-check
const { defineConfig, devices } = require('@playwright/test');

/**
 * Playwright config for xandersavvy.github.io
 *
 * Projects are split by environment:
 *   local-*  — targets http://127.0.0.1:5500  (live-server must be running)
 *   prod-*   — targets https://xandersavvy.github.io  (post-deployment checks)
 *
 * Run all:          npm test
 * Local only:       npm run test:local
 * Prod only:        npm run test:prod
 */

const LOCAL_URL = 'http://127.0.0.1:5500';
const PROD_URL  = 'https://xandersavvy.github.io';

module.exports = defineConfig({
  testDir: './specs',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: true,
  retries: 1,
  reporter: [['html', { open: 'never', outputFolder: 'playwright-report' }], ['list']],

  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'off',
  },

  projects: [
    // ── Local ──────────────────────────────────────────────────────────────
    {
      name: 'local-chromium',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: LOCAL_URL,
      },
    },
    {
      name: 'local-firefox',
      use: {
        ...devices['Desktop Firefox'],
        baseURL: LOCAL_URL,
      },
    },
    {
      name: 'local-mobile-chrome',
      use: {
        ...devices['Pixel 5'],
        baseURL: LOCAL_URL,
      },
    },

    // ── Production ─────────────────────────────────────────────────────────
    {
      name: 'prod-chromium',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: PROD_URL,
      },
    },
    {
      name: 'prod-firefox',
      use: {
        ...devices['Desktop Firefox'],
        baseURL: PROD_URL,
      },
    },
    {
      name: 'prod-mobile-chrome',
      use: {
        ...devices['Pixel 5'],
        baseURL: PROD_URL,
      },
    },
  ],
});
