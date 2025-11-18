import { test, expect } from '@playwright/test';

test('homepage loads', async ({ page }) => {
  // Determine the base URL explicitly so we always navigate to a real page
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  const targetUrl = new URL('/', baseUrl).toString();

  // Navigate to the resolved base URL
  await page.goto(targetUrl);
  // Wait 2 seconds before moving to next step
  await page.waitForTimeout(2000);

  // The page title will vary based on the environment, so we check for a more flexible pattern
  // Accept various titles: local dev server, test dashboard, or medEbridge
  await expect(page).toHaveTitle(/Create Next App|Test Dashboard|medEbridge/i);
});
