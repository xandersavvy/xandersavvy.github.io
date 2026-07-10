// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * hero.spec.js
 * Hero section — content, terminal game, social links
 */

test.describe('Hero section', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/index.html');
  });

  test('hero section is visible', async ({ page }) => {
    await expect(page.locator('#hero')).toBeVisible();
  });

  test('hero name heading contains "Souvik"', async ({ page }) => {
    await expect(page.locator('.hero-name')).toContainText('Souvik');
  });

  test('hero role contains SDET', async ({ page }) => {
    await expect(page.locator('.hero-role')).toContainText('SDET');
  });

  test('"About me" CTA is present and links to #about', async ({ page }) => {
    const btn = page.locator('.hero-cta a[data-scroll="about"]');
    await expect(btn).toBeVisible();
    await expect(btn).toContainText('About me');
  });

  test('"Get in touch" CTA is present', async ({ page }) => {
    await expect(page.locator('.hero-cta a[data-scroll="contact"]')).toBeVisible();
  });

  test('social links are present (GitHub, LinkedIn, Blog, Email)', async ({ page }) => {
    const socials = page.locator('.hero-social a');
    await expect(socials).toHaveCount(4);
  });

  test('GitHub link points to correct profile', async ({ page }) => {
    const gh = page.locator('.hero-social a[aria-label="GitHub"]');
    await expect(gh).toHaveAttribute('href', 'https://github.com/xandersavvy');
  });

});

test.describe('Terminal game', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/index.html');
    // Terminal may need DOMContentLoaded
    await page.waitForSelector('#terminal-input');
  });

  test('terminal input is present', async ({ page }) => {
    await expect(page.locator('#terminal-input')).toBeVisible();
  });

  test('typing "help" shows available commands', async ({ page }) => {
    await page.locator('#terminal-input').fill('help');
    await page.locator('#terminal-input').press('Enter');
    await expect(page.locator('#terminal-output')).toContainText(/help|whoami|skills/i);
  });

  test('typing "whoami" returns output', async ({ page }) => {
    await page.locator('#terminal-input').fill('whoami');
    await page.locator('#terminal-input').press('Enter');
    await expect(page.locator('#terminal-output')).not.toBeEmpty();
  });

  test('typing "skills" returns output', async ({ page }) => {
    await page.locator('#terminal-input').fill('skills');
    await page.locator('#terminal-input').press('Enter');
    await expect(page.locator('#terminal-output')).not.toBeEmpty();
  });

  test('unknown command shows error message', async ({ page }) => {
    await page.locator('#terminal-input').fill('foobar_unknown_command');
    await page.locator('#terminal-input').press('Enter');
    await expect(page.locator('#terminal-output')).toContainText(/not found|unknown|error/i);
  });

});
