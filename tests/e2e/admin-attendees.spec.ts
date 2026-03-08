import { expect, test } from '@playwright/test';

test('admin attendee list shows registrations after login', async ({
  page,
}) => {
  const attendeeEmail = 'mina+attendees@example.com';

  await page.goto('/events/signal-summit-tokyo');

  await page.getByLabel('Full name').fill('Mina Chen');
  await page.getByLabel('Work email').fill(attendeeEmail);
  await page.getByLabel('Company').fill('Field Notes');
  await page.getByRole('button', { name: 'Reserve seat' }).click();
  await expect(page.getByText(/Registration confirmed/)).toBeVisible();

  await page.goto('/admin/attendees');
  await expect(page).toHaveURL(/\/login\?/);

  await page.getByRole('button', { name: 'Continue as admin' }).click();
  await expect(page).toHaveURL(/\/admin\/attendees$/);

  await expect(page.getByText(attendeeEmail).first()).toBeVisible();
  await expect(page.getByText('Signal Summit Tokyo').first()).toBeVisible();
});
