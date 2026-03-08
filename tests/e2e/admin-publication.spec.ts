import { expect, test } from '@playwright/test';

test('draft event can be published to the public catalog', async ({ page }) => {
  const title = `Control Room Publish ${Date.now()}`;
  const editedTitle = `${title} Live`;

  await page.goto('/admin/events/new');
  await expect(page).toHaveURL(/\/login\?/);

  await page.getByRole('button', { name: 'Continue as admin' }).click();
  await expect(page).toHaveURL(/\/admin\/events\/new$/);

  await page.getByLabel('Title').fill(title);
  await page.getByLabel('Venue').fill('Studio North');
  await page
    .getByLabel('Summary')
    .fill('Hands-on clinic for explicit publication.');
  await page.getByRole('button', { name: 'Create event' }).click();

  const row = page.locator('tr', { hasText: title });

  await row.getByRole('button', { name: 'Publish' }).click();
  await expect(
    page.getByText('Event published to the public catalog.'),
  ).toBeVisible();

  await row.getByRole('link', { name: 'Edit copy' }).click();
  await page.getByLabel('Public title').fill(editedTitle);
  await page
    .getByLabel('Public summary')
    .fill('Updated public summary for the live publication editor.');
  await page.getByRole('button', { name: 'Save public copy' }).click();

  await expect(page.getByText('Public copy updated.')).toBeVisible();

  await page.goto('/events');

  await expect(page.getByText(editedTitle).first()).toBeVisible();
});

test('published event with registrations cannot be withdrawn', async ({
  page,
}) => {
  const attendeeEmail = `aki+withdraw-${Date.now()}@example.com`;

  await page.goto('/events/signal-summit-tokyo');
  await page.getByLabel('Full name').fill('Aki Ito');
  await page.getByLabel('Work email').fill(attendeeEmail);
  await page.getByLabel('Company').fill('North Star Labs');
  await page.getByRole('button', { name: 'Reserve seat' }).click();

  await expect(page.getByText(/Registration confirmed/)).toBeVisible();

  await page.goto('/admin/events');
  await expect(page).toHaveURL(/\/login\?/);

  await page.getByRole('button', { name: 'Continue as admin' }).click();
  await expect(page).toHaveURL(/\/admin\/events$/);

  const row = page.locator('tr', { hasText: 'Signal Summit Tokyo' });

  await row.getByRole('button', { name: 'Withdraw' }).click();
  await expect(
    page.getByText(
      'Event publication cannot be withdrawn after registrations exist.',
    ),
  ).toBeVisible();
});
