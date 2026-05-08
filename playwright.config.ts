import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './test/e2e',
  timeout: 30_000,
  fullyParallel: true,
  use: {
    baseURL: 'http://127.0.0.1:4289/hostflow-local/',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'node scripts/pages-preview-server.mjs',
    url: 'http://127.0.0.1:4289/hostflow-local/',
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})
