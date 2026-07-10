// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * nav.spec.js
 * Navigation — links, hamburger drawer (mobile), active state, smooth scroll
 */

test.describe('Navigation', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/index.html');
  });

  test('navbar is visible on load', async ({ page }) => {
    await expect(page.locator('#navbar')).toBeVisible();
  });

  test('logo link is present with text "Souvik"', async ({ page }) => {
    await expect(page.locator('.nav-logo')).toHaveText('Souvik');
  });

  test('all main nav links are present', async ({ page }) => {
    const links = ['About', 'Skills', 'Experience', 'Projects', 'CV', 'Contact', 'Tools'];
    for (const text of links) {
      await expect(page.locator(`.nav-links a:has-text("${text}")`)).toBeVisible();
    }
  });

  test('Download CV button is visible in nav', async ({ page }) => {
    await expect(page.locator('.btn-resume-nav')).toBeVisible();
  });

  test('clicking nav About link scrolls to about section', async ({ page }) => {
    await page.locator('.nav-links a[data-scroll="about"]').click();
    await page.waitForTimeout(600); // allow smooth scroll
    const section = page.locator('#about');
    await expect(section).toBeVisible();
  });

});

test.describe('Navigation — mobile hamburger', () => {

  test.use({ viewport: { width: 390, height: 844 } });

  test.beforeEach(async ({ page }) => {
    await page.goto('/index.html');
  });

  test('hamburger button is visible on mobile', async ({ page }) => {
    await expect(page.locator('#nav-hamburger')).toBeVisible();
  });

  test('drawer opens on hamburger click', async ({ page }) => {
    await page.locator('#nav-hamburger').click();
    await expect(page.locator('#nav-drawer')).toHaveClass(/open/);
  });

  test('drawer closes when a link inside it is clicked', async ({ page }) => {
    await page.locator('#nav-hamburger').click();
    await page.locator('#nav-drawer a[data-scroll="about"]').click();
    await expect(page.locator('#nav-drawer')).not.toHaveClass(/open/);
  });

});
