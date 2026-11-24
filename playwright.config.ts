import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './testler',
  outputDir: './test-results',
  fullyParallel: true,
  retries: 0,
  reporter: [['list'], ['json', { outputFile: 'test-results/sonuc.json' }]],
  use: { baseURL: 'http://127.0.0.1:4321' },
  webServer: {
    command: 'npx astro preview --port 4321 --host 127.0.0.1',
    url: 'http://127.0.0.1:4321',
    reuseExistingServer: true,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
