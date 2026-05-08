import { expect, test } from '@playwright/test'

test('home page renders the static host cockpit shell', async ({ page }) => {
  await page.goto('/')
  await expect(
    page.getByRole('heading', { name: /static short-term rental host cockpit/i }),
  ).toBeVisible()
  await expect(page.getByRole('link', { name: /star on github/i })).toHaveAttribute(
    'href',
    'https://github.com/baditaflorin/hostflow-local',
  )
  await expect(page.getByText(/version/i)).toBeVisible()
  await expect(page.getByText(/commit/i)).toBeVisible()
})
