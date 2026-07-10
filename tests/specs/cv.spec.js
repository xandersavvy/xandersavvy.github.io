// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * cv.spec.js
 * cv.html — palette tokens, toolbar, markdown render, theme toggle
 */

test.describe('CV page', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/cv.html');
  });

  test('page title contains "CV"', async ({ page }) => {
    await expect(page).toHaveTitle(/CV/);
  });

  test('toolbar is visible', async ({ page }) => {
    await expect(page.locator('#cv-toolbar')).toBeVisible();
  });

  test('"Back" button links to index.html', async ({ page }) => {
    await expect(page.locator('#cv-toolbar a:has-text("Back")')).toHaveAttribute('href', 'index.html');
  });

  test('"Download PDF" button is present', async ({ page }) => {
    await expect(page.locator('#btn-print-cv')).toBeVisible();
  });

  test('theme toggle button is present', async ({ page }) => {
    await expect(page.locator('#btn-theme-cv')).toBeVisible();
  });

  test('CV content renders (markdown loaded)', async ({ page }) => {
    // resume.md is fetched — wait for content to appear
    await expect(page.locator('#cv-content')).toBeVisible({ timeout: 10_000 });
    const text = await page.locator('#cv-content').innerText();
    expect(text.trim().length).toBeGreaterThan(100);
  });

  test('rustic-day background applied in light mode', async ({ page }) => {
    await page.evaluate(() => {
      document.documentElement.setAttribute('data-theme', 'light');
    });
    const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    // #f5f0e8 = rgb(245, 240, 232)
    expect(bg).toBe('rgb(245, 240, 232)');
  });

  test('rustic-night background applied in dark mode', async ({ page }) => {
    await page.evaluate(() => {
      document.documentElement.setAttribute('data-theme', 'dark');
    });
    const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    // #1e1a16 = rgb(30, 26, 22)
    expect(bg).toBe('rgb(30, 26, 22)');
  });

  test('theme toggle on cv page switches data-theme', async ({ page }) => {
    const before = await page.locator('html').getAttribute('data-theme');
    await page.locator('#btn-theme-cv').click();
    const after = await page.locator('html').getAttribute('data-theme');
    expect(after).not.toBe(before);
  });

});
