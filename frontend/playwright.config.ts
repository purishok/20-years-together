import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  use: { baseURL: process.env.E2E_BASE_URL || 'http://127.0.0.1:5173', trace: 'retain-on-failure' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], channel: 'chrome', viewport: { width: 1440, height: 1000 } } },
    { name: 'mobile', use: { ...devices['iPhone 13'], defaultBrowserType: 'chromium', channel: 'chrome' } },
  ],
  webServer: process.env.E2E_BASE_URL ? undefined : [
    { command: 'uv run --directory ../backend uvicorn app.main:app --host 127.0.0.1 --port 8000', url: 'http://127.0.0.1:8000/api/health', reuseExistingServer: !process.env.CI },
    { command: 'npm run dev -- --host 127.0.0.1', url: 'http://127.0.0.1:5173', reuseExistingServer: !process.env.CI },
  ],
})
