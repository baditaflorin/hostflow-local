import { expect, test } from '@playwright/test'

test('home page renders the static host cockpit shell', async ({ page }) => {
  await page.goto('/hostflow-local/')
  await expect(page.getByRole('heading', { name: /airbnb host workflow cockpit/i })).toBeVisible()
  await expect(page.getByRole('link', { name: /star on github/i })).toHaveAttribute(
    'href',
    'https://github.com/baditaflorin/hostflow-local',
  )
  await expect(page.getByText('Target', { exact: true })).toBeVisible()
  await expect(page.getByText(/commit/i)).toBeVisible()
  await page.getByRole('tab', { name: /calendar/i }).click()
  await expect(
    page.getByRole('cell', { name: /benchmark|premium|visibility|gap/i }).first(),
  ).toBeVisible()
})
