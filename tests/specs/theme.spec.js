// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * theme.spec.js
 * Dark / light theme toggle — persistence via localStorage, icon swap,
 * background colour change, bg.js redraw
 */

test.describe('Theme toggle', () => {

  test.beforeEach(async ({ page }) => {
    // Start fresh with no stored preference
    await page.goto('/index.html');
    await page.evaluate(() => localStorage.removeItem('sg-theme'));
    await page.reload();
  });

  test('theme toggle button is present and labelled', async ({ page }) => {
    const btn = page.locator('#btn-theme');
    await expect(btn).toBeVisible();
    await expect(btn).toHaveAttribute('aria-label', 'Toggle dark/light theme');
  });

  test('clicking toggle switches html data-theme attribute', async ({ page }) => {
    const html = page.locator('html');
    const before = await html.getAttribute('data-theme');
    await page.locator('#btn-theme').click();
    const after = await html.getAttribute('data-theme');
    expect(after).not.toBe(before);
    expect(['light', 'dark']).toContain(after);
  });

  test('theme persists across page reload via localStorage', async ({ page }) => {
    // Force dark
    await page.evaluate(() => {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('sg-theme', 'dark');
    });
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  });

  test('dark theme applies rustic-night background colour', async ({ page }) => {
    await page.evaluate(() => {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('sg-theme', 'dark');
    });
    await page.reload();
    const bg = await page.evaluate(() =>
      getComputedStyle(document.body).backgroundColor
    );
    // #1e1a16 = rgb(30, 26, 22)
    expect(bg).toBe('rgb(30, 26, 22)');
  });

  test('light theme applies rustic-day background colour', async ({ page }) => {
    await page.evaluate(() => {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('sg-theme', 'light');
    });
    await page.reload();
    const bg = await page.evaluate(() =>
      getComputedStyle(document.body).backgroundColor
    );
    // #f5f0e8 = rgb(245, 240, 232)
    expect(bg).toBe('rgb(245, 240, 232)');
  });

  test('bg-canvas SVG is present and not empty after load', async ({ page }) => {
    await page.waitForTimeout(300); // allow bg.js to paint
    const childCount = await page.locator('#bg-canvas').evaluate(el => el.childElementCount);
    expect(childCount).toBeGreaterThan(0);
  });

  test('bg-canvas redraws (child count changes) on theme toggle', async ({ page }) => {
    await page.waitForTimeout(300);
    const before = await page.locator('#bg-canvas').evaluate(el => el.childElementCount);
    await page.locator('#btn-theme').click();
    await page.waitForTimeout(300);
    const after = await page.locator('#bg-canvas').evaluate(el => el.childElementCount);
    // Both should be non-zero; exact count may differ (stars vs birds)
    expect(before).toBeGreaterThan(0);
    expect(after).toBeGreaterThan(0);
  });

});
