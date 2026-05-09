import path from 'node:path'
import { expect, test } from '@playwright/test'

test('host can upload real CSV data and save a workspace', async ({ page }) => {
  await page.goto('/hostflow-local/')

  await page
    .locator('input[type="file"]')
    .setInputFiles(path.resolve('test/fixtures/realdata/01-clean-comps.csv'))

  await page.getByRole('tab', { name: /export/i }).click()
  await expect(page.getByLabel('Markdown report')).toContainText('Imported comparable count: 2')

  const workspaceDownload = page.waitForEvent('download')
  await page.getByRole('button', { name: /save workspace/i }).click()
  const download = await workspaceDownload
  const workspacePath = await download.path()
  expect(workspacePath).toBeTruthy()
})
