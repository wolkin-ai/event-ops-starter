import { expect, test } from '@playwright/test';

test('event create to event list reflect', async ({ page }) => {
  const title = `Control Room Clinic ${Date.now()}`;

  await page.goto('/admin/events/new');
  await expect(page).toHaveURL(/\/login\?/);

  await page.getByRole('button', { name: 'Continue as admin' }).click();
  await expect(page).toHaveURL(/\/admin\/events\/new$/);

  await page.getByLabel('Title').fill(title);
  await page.getByLabel('Venue').fill('Studio North');
  await page.getByLabel('Summary').fill('Hands-on clinic for ops runbooks.');
  await page.getByRole('button', { name: 'Create event' }).click();

  await expect(page).toHaveURL(/\/admin\/events\?created=1/);
  await expect(page.getByText(title).first()).toBeVisible();
});
