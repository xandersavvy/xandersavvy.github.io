// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * contact.spec.js
 * Contact section — links, fun section (jokes)
 */

test.describe('Contact section', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/index.html');
  });

  test('contact section heading is present', async ({ page }) => {
    await page.locator('#contact').scrollIntoViewIfNeeded();
    await expect(page.locator('#contact h2')).toContainText('Contact');
  });

  test('email link is present and correctly formatted', async ({ page }) => {
    const emailLink = page.locator('#contact a[href^="mailto:"]');
    await expect(emailLink).toBeAttached();
    const href = await emailLink.getAttribute('href');
    expect(href).toMatch(/mailto:.+@.+/);
  });

  test('GitHub contact link opens in new tab', async ({ page }) => {
    const gh = page.locator('#contact a[href*="github.com"]').first();
    await expect(gh).toHaveAttribute('target', '_blank');
    await expect(gh).toHaveAttribute('rel', /noopener/);
  });

  test('LinkedIn contact link opens in new tab', async ({ page }) => {
    const li = page.locator('#contact a[href*="linkedin.com"]').first();
    await expect(li).toHaveAttribute('target', '_blank');
  });

  test('Credly link is present in contact', async ({ page }) => {
    await expect(page.locator('#contact a[href*="credly.com"]')).toBeAttached();
  });

});

test.describe('Fun section — Dad jokes', () => {

  test.beforeEach(async ({ page }) => {
    // Mock the joke API so tests are deterministic and offline-safe
    await page.route('**/official-joke-api.appspot.com/**', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ setup: 'Why did the test pass?', punchline: 'Because it was well written.' }),
      })
    );
    await page.goto('/index.html');
  });

  test('joke text element is present', async ({ page }) => {
    await expect(page.locator('#joke-text')).toBeAttached();
  });

  test('joke text is populated after load', async ({ page }) => {
    await expect(page.locator('#joke-text')).not.toBeEmpty({ timeout: 8_000 });
  });

  test('"Next joke" button is present', async ({ page }) => {
    await expect(page.locator('#joke-btn')).toBeVisible();
  });

  test('clicking "Next joke" fetches a new joke', async ({ page }) => {
    // Wait for initial load
    await expect(page.locator('#joke-text')).not.toBeEmpty({ timeout: 8_000 });
    const before = await page.locator('#joke-text').innerText();
    await page.locator('#joke-btn').click();
    // After click it shows "Fetching…" briefly then resolves
    await expect(page.locator('#joke-text')).not.toHaveText(before, { timeout: 5_000 });
  });

});
