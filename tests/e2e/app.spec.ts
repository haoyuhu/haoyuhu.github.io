import { expect, test } from '@playwright/test';

test('renders bundle-driven portfolio and local studio tab', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Haoyu Hu/ })).toBeVisible();
  await expect(page.getByRole('button', { name: 'home.py' }).first()).toBeVisible();
  await expect(page.getByRole('button', { name: 'studio.local' }).first()).toBeVisible();

  await page.getByRole('button', { name: 'studio.local' }).first().click();
  await expect(page.getByText('本地创作控制台')).toBeVisible();
});
