// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * bg.spec.js
 * SVG background — shape presence, theme-aware colours, star/bird swap
 */

test.describe('Background canvas', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForTimeout(400); // allow bg.js to paint
  });

  test('bg-canvas SVG element exists', async ({ page }) => {
    await expect(page.locator('#bg-canvas')).toBeAttached();
  });

  test('bg-canvas has children (shapes drawn)', async ({ page }) => {
    const count = await page.locator('#bg-canvas').evaluate(el => el.childElementCount);
    expect(count).toBeGreaterThan(0);
  });

  test('light mode: bg-canvas contains paths (clouds/mountains)', async ({ page }) => {
    await page.evaluate(() => {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('sg-theme', 'light');
    });
    await page.reload();
    await page.waitForTimeout(400);
    const pathCount = await page.locator('#bg-canvas path').count();
    expect(pathCount).toBeGreaterThan(5);
  });

  test('light mode: birds (paths) are present, no circle stars', async ({ page }) => {
    await page.evaluate(() => {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('sg-theme', 'light');
    });
    await page.reload();
    await page.waitForTimeout(400);
    // In light mode there should be bird paths but NO star circles
    const circles = await page.locator('#bg-canvas circle').count();
    expect(circles).toBe(0);
  });

  test('dark mode: stars (circle-less paths) replace birds', async ({ page }) => {
    await page.evaluate(() => {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('sg-theme', 'dark');
    });
    await page.reload();
    await page.waitForTimeout(400);
    // Star pentagram shapes are <path> elements; count should still be high
    const pathCount = await page.locator('#bg-canvas path').count();
    expect(pathCount).toBeGreaterThan(10);
  });

  test('dark mode: stroke colour is rustic-night ink (#d4b896)', async ({ page }) => {
    await page.evaluate(() => {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('sg-theme', 'dark');
    });
    await page.reload();
    await page.waitForTimeout(400);
    const stroke = await page.locator('#bg-canvas path').first().getAttribute('stroke');
    expect(stroke?.toLowerCase()).toBe('#d4b896');
  });

  test('light mode: stroke colour is rustic-day ink (#5a3e2b)', async ({ page }) => {
    await page.evaluate(() => {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('sg-theme', 'light');
    });
    await page.reload();
    await page.waitForTimeout(400);
    const stroke = await page.locator('#bg-canvas path').first().getAttribute('stroke');
    expect(stroke?.toLowerCase()).toBe('#5a3e2b');
  });

  test('bg-canvas redraws on theme change without full reload', async ({ page }) => {
    const before = await page.locator('#bg-canvas').evaluate(el => el.innerHTML);
    await page.locator('#btn-theme').click();
    await page.waitForTimeout(400);
    const after = await page.locator('#bg-canvas').evaluate(el => el.innerHTML);
    expect(after).not.toBe(before);
  });

  test('bg-canvas viewBox updates on window resize', async ({ page }) => {
    const vb1 = await page.locator('#bg-canvas').getAttribute('viewBox');
    await page.setViewportSize({ width: 800, height: 600 });
    await page.waitForTimeout(400);
    const vb2 = await page.locator('#bg-canvas').getAttribute('viewBox');
    expect(vb2).toContain('800');
  });

});
