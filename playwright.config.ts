import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './test/e2e',
  timeout: 30_000,
  fullyParallel: true,
  use: {
    baseURL: 'http://127.0.0.1:4173/hostflow-local/',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npx http-server dist -p 4173 -c-1',
    url: 'http://127.0.0.1:4173/hostflow-local/',
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})
