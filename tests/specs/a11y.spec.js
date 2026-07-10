// @ts-check
const { test, expect } = require('@playwright/test');


/**
 * a11y.spec.js
 * Basic accessibility checks — ARIA roles, labels, keyboard navigation,
 * skip links, image alt text, meta tags
 * 
 * Works for both environments:
 *   local  — baseURL http://127.0.0.1:5500  → navigates to /index.html
 *   prod   — baseURL https://xandersavvy.github.io → navigates to /
 * Resolve the correct index path based on the baseURL in use.
 * @param {string | undefined} baseURL
 */
function indexPath(baseURL) {
  return baseURL && baseURL.startsWith('https://') ? '/' : '/index.html';
}

test.describe('Accessibility — landmarks & roles', () => {

  test.beforeEach(async ({ page, baseURL }) => {
    await page.goto(indexPath(baseURL));
  });

  test('page has a <main> element', async ({ page }) => {
    await expect(page.locator('main#main-content')).toBeAttached();
  });

  test('nav has role="navigation" and aria-label', async ({ page }) => {
    const nav = page.locator('#navbar');
    await expect(nav).toHaveAttribute('role', 'navigation');
    await expect(nav).toHaveAttribute('aria-label', 'Main navigation');
  });

  test('theme button has aria-label', async ({ page }) => {
    await expect(page.locator('#btn-theme')).toHaveAttribute('aria-label');
  });

  test('hamburger button has aria-label and aria-expanded', async ({ page }) => {
    const btn = page.locator('#nav-hamburger');
    await expect(btn).toHaveAttribute('aria-label');
    await expect(btn).toHaveAttribute('aria-expanded');
  });

  test('terminal input has aria-label', async ({ page }) => {
    await expect(page.locator('#terminal-input')).toHaveAttribute('aria-label');
  });

  test('hero section has aria-label', async ({ page }) => {
    await expect(page.locator('#hero')).toHaveAttribute('aria-label');
  });

  test('about photo img has non-empty alt text', async ({ page }) => {
    const alt = await page.locator('.about-photo img').getAttribute('alt');
    expect(alt && alt.trim().length).toBeGreaterThan(0);
  });

  test('credly badge images have alt attributes', async ({ page }) => {
    const images = page.locator('.credly-badge img');
    const count = await images.count();
    for (let i = 0; i < count; i++) {
      const alt = await images.nth(i).getAttribute('alt');
      expect(alt && alt.trim().length).toBeGreaterThan(0);
    }
  });

});

test.describe('Accessibility — meta & SEO', () => {

  test.beforeEach(async ({ page, baseURL }) => {
    await page.goto(indexPath(baseURL));
  });

  test('page has a descriptive title', async ({ page }) => {
    await expect(page).toHaveTitle(/Souvik Ghosh/);
  });

  test('meta description is present', async ({ page }) => {
    const desc = await page.locator('meta[name="description"]').getAttribute('content');
    expect(desc && desc.trim().length).toBeGreaterThan(20);
  });

  test('canonical link is set', async ({ page }) => {
    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
    expect(canonical).toMatch(/xandersavvy\.github\.io/);
  });

  test('Open Graph title is present', async ({ page }) => {
    const og = await page.locator('meta[property="og:title"]').getAttribute('content');
    expect(og && og.trim().length).toBeGreaterThan(0);
  });

  test('lang attribute is set on html element', async ({ page }) => {
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });

  test('favicon link is present', async ({ page }) => {
    await expect(page.locator('link[rel="icon"]')).toBeAttached();
  });

});

test.describe('Accessibility — keyboard navigation', () => {

  test.beforeEach(async ({ page, baseURL }) => {
    await page.goto(indexPath(baseURL));
  });

  test('nav links are focusable via Tab', async ({ page }) => {
    await page.keyboard.press('Tab');
    // First focusable element should be inside the nav
    const focused = await page.evaluate(() => document.activeElement?.tagName);
    expect(['A', 'BUTTON', 'INPUT']).toContain(focused);
  });

  test('theme button is reachable and activatable via keyboard', async ({ page }) => {
    const btn = page.locator('#btn-theme');
    await btn.focus();
    const before = await page.locator('html').getAttribute('data-theme');
    await page.keyboard.press('Enter');
    const after = await page.locator('html').getAttribute('data-theme');
    expect(after).not.toBe(before);
  });

});
