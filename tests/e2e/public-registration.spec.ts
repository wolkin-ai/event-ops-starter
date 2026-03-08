import { expect, test } from '@playwright/test';

test('event detail to registration complete', async ({ page }) => {
  const attendeeEmail = 'aki+dashboard@example.com';

  await page.goto('/events/signal-summit-tokyo');

  await page.getByLabel('Full name').fill('Aki Ito');
  await page.getByLabel('Work email').fill(attendeeEmail);
  await page.getByLabel('Company').fill('North Star Labs');
  await page.getByRole('button', { name: 'Reserve seat' }).click();

  await expect(page.getByText(/Registration confirmed/)).toBeVisible();

  await page.goto('/dashboard');

  await expect(
    page.getByRole('heading', { name: 'Signal Summit Tokyo' }).first(),
  ).toBeVisible();
});
