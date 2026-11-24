import { defineConfig, devices } from '@playwright/test';

// Yerelde önce siteyi derleyip önizlemeyi başlat: npm run build && npx astro preview --background
// Canlı siteyi denemek için: TABAN=https://aliyilmaz16.github.io npx playwright test
const taban = process.env.TABAN ?? 'http://127.0.0.1:4321';

export default defineConfig({
  testDir: './testler',
  outputDir: './test-results',
  fullyParallel: true,
  retries: 0,
  reporter: [['list'], ['json', { outputFile: 'test-results/sonuc.json' }]],
  use: { baseURL: taban },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
