// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * sections.spec.js
 * About, Skills, Experience, Projects, Certs — content + interactions
 */

test.describe('About section', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/index.html');
  });

  test('about section exists and has heading', async ({ page }) => {
    await expect(page.locator('#about h2')).toContainText('About Me');
  });

  test('about photo is present', async ({ page }) => {
    const img = page.locator('.about-photo img[alt="Souvik Ghosh"]:not(.about-gh-avatar)');
    await expect(img).toBeVisible();
    await expect(img).toHaveAttribute('alt', 'Souvik Ghosh');
  });

  test('stats row has at least 4 items', async ({ page }) => {
    const stats = page.locator('.about-stat');
    expect(await stats.count()).toBeGreaterThanOrEqual(4);
  });

  test('IBM Awards stat is present', async ({ page }) => {
    await expect(page.locator('.about-stats')).toContainText('IBM Awards');
  });

  test('Credly Badges stat is present', async ({ page }) => {
    await expect(page.locator('.about-stats')).toContainText('Credly Badges');
  });

});

test.describe('Skills section', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/index.html');
  });

  test('skills section heading is present', async ({ page }) => {
    await expect(page.locator('#skills h2')).toContainText('Technical Skills');
  });

  test('Playwright is listed as a skill tag', async ({ page }) => {
    await expect(page.locator('#skills .skill-tag:has-text("Playwright")')).toBeVisible();
  });

  test('Java is listed as a skill tag', async ({ page }) => {
    await expect(page.locator('#skills .skill-tag').filter({ hasText: /^Java$/ })).toBeVisible();
  });

});

test.describe('Experience section', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/index.html');
  });

  test('experience section heading is present', async ({ page }) => {
    await expect(page.locator('#experience h2')).toContainText('Experience');
  });

  test('IBM Consulting is mentioned', async ({ page }) => {
    await expect(page.locator('#experience')).toContainText('IBM Consulting');
  });

});

test.describe('Projects section', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/index.html');
  });

  test('projects section heading is present', async ({ page }) => {
    await expect(page.locator('#projects h2')).toContainText('Projects');
  });

  test('at least 3 project cards are present', async ({ page }) => {
    const cards = page.locator('.project-card');
    expect(await cards.count()).toBeGreaterThan(2);
  });

  test('clicking a project card flips it (adds flipped class)', async ({ page }) => {
    const card = page.locator('.project-card').first();
    await card.click();
    await expect(card).toHaveClass(/flipped/);
  });

  test('clicking a flipped card unflips it', async ({ page }) => {
    const card = page.locator('.project-card').first();
    await card.click(); // flip
    await card.click(); // unflip
    await expect(card).not.toHaveClass(/flipped/);
  });

});

test.describe('Certifications & Achievements section', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/index.html');
  });

  test('certs section heading is present', async ({ page }) => {
    await expect(page.locator('#certs h2')).toContainText('Certifications');
  });

  test('ISTQB cert card is present', async ({ page }) => {
    await expect(page.locator('#certs')).toContainText('ISTQB');
  });

  test('IBM Growth Award is listed', async ({ page }) => {
    await expect(page.locator('#certs')).toContainText('IBM Growth Award');
  });

  test('credly badge grid contains at least 10 badges', async ({ page }) => {
    const badges = page.locator('.credly-badge');
    expect(await badges.count()).toBeGreaterThan(9);
  });

  test('credly badge images load without error', async ({ page }) => {
    const images = page.locator('.credly-badge img');
    const count = await images.count();
    for (let i = 0; i < count; i++) {
      const naturalWidth = await images.nth(i).evaluate(img => /** @type {HTMLImageElement} */ (img).naturalWidth);
      expect(naturalWidth).toBeGreaterThan(0);
    }
  });

  test('View all link points to credly profile', async ({ page }) => {
    await expect(page.locator('.credly-all-link'))
      .toHaveAttribute('href', /credly\.com\/users\/souvik-ghosh/);
  });

});
