import { defineConfig, devices } from '@playwright/test'

const backendOrigin = 'http://127.0.0.1:4100'
const frontendOrigin = 'http://127.0.0.1:5174'

export default defineConfig({
  testDir: './tests',
  timeout: 90_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: 'list',
  use: {
    baseURL: frontendOrigin,
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium-desktop',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'chromium-mobile',
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: [
    {
      command: 'node ./scripts/start-backend.mjs',
      url: `${backendOrigin}/graphql`,
      reuseExistingServer: false,
      timeout: 120_000,
    },
    {
      command: `npm --prefix ../frontend run dev -- --host 127.0.0.1 --port 5174 --strictPort`,
      url: frontendOrigin,
      reuseExistingServer: false,
      timeout: 120_000,
      env: {
        ...process.env,
        VITE_BACKEND_URL: '/graphql',
        VITE_DEV_PROXY_TARGET: backendOrigin,
      },
    },
  ],
})
