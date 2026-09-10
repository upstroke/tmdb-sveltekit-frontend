// @ts-check
import { test, expect, devices } from '@playwright/test';
import { checkA11y } from '../../setup/a11y.js';

const mobile = devices['iPhone 13'];

/**
 * Accessibility tests for navigation flows (desktop and mobile).
 * 
 * Test plan: tests/acceptance/accessibility/accessibility-testplan.md
 * 
 * Test cases:
 * - A11Y-001: Desktop homepage initial load accessibility
 * - A11Y-002: Desktop homepage after search interaction accessibility
 * - A11Y-003: Desktop search results page accessibility
 * - A11Y-004: Desktop details page accessibility
 * - A11Y-005: Mobile burger menu closed state accessibility
 * - A11Y-006: Mobile burger menu open state accessibility
 * - A11Y-007: Mobile navigation menu accessibility
 * - A11Y-008: Mobile-specific interactions accessibility
 */

test.describe('Accessibility - Desktop Navigation', () => {
  // A11Y-001: Desktop homepage initial load accessibility
  test('Desktop homepage initial load has no automatically detected WCAG A/AA violations', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await checkA11y(page);
  });

  // A11Y-002: Desktop homepage after search interaction accessibility
  test('Desktop homepage after search interaction has no automatically detected WCAG A/AA violations', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Perform search interaction
    const searchInput = page.locator('input[aria-label="Search"], input[placeholder*="Search"], input[type="search"]');
    await searchInput.fill('dune');
    await page.waitForTimeout(1000); // Wait for search results
    
    await checkA11y(page);
  });

  // A11Y-003: Desktop search results page accessibility
  test('Desktop search results page has no automatically detected WCAG A/AA violations', async ({ page }) => {
    await page.goto('/search?q=dune');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('.media-card, [class*="card"], [data-testid*="card"]');
    
    await checkA11y(page);
  });

  // A11Y-004: Desktop details page accessibility
  test('Desktop movie details page has no automatically detected WCAG A/AA violations', async ({ page }) => {
    // Navigate to a movie details page (using a known movie ID)
    await page.goto('/movie/438631'); // Dune
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('.details-hero, [class*="hero"], [data-testid*="details"]');
    
    await checkA11y(page);
  });
});

test.describe('Accessibility - Mobile Navigation', () => {
  test.use({
    viewport: mobile.viewport,
    deviceScaleFactor: mobile.deviceScaleFactor,
    isMobile: mobile.isMobile,
    hasTouch: mobile.hasTouch,
    userAgent: mobile.userAgent,
  });

  // A11Y-005: Mobile burger menu closed state accessibility
  test('Mobile homepage with closed burger menu has no automatically detected WCAG A/AA violations', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Ensure burger menu is closed
    const burgerButton = page.locator('button[aria-label="Toggle menu"], button[aria-label="Menu"], .burger-menu, .mobile-menu-toggle').first();
    await expect(burgerButton).toBeVisible();
    
    await checkA11y(page);
  });

  // A11Y-006: Mobile burger menu open state accessibility
  test('Mobile homepage with open burger menu has no automatically detected WCAG A/AA violations', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Open mobile burger menu
    const burgerButton = page.locator('button[aria-label="Toggle menu"], button[aria-label="Menu"], .burger-menu, .mobile-menu-toggle').first();
    await burgerButton.click();
    await page.waitForTimeout(500); // Wait for menu animation
    
    // Verify menu is open
    const mobileMenu = page.locator('.mobile-menu, nav[aria-label="Mobile navigation"], .nav-mobile').first();
    await expect(mobileMenu).toBeVisible();
    
    await checkA11y(page);
  });

  // A11Y-007: Mobile navigation menu accessibility
  test('Mobile navigation menu items have no automatically detected WCAG A/AA violations', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Open mobile burger menu
    const burgerButton = page.locator('button[aria-label="Toggle menu"], button[aria-label="Menu"], .burger-menu, .mobile-menu-toggle').first();
    await burgerButton.click();
    await page.waitForTimeout(500);
    
    // Navigate to Movies page via mobile menu
    const moviesLink = page.locator('a[href="/movies"], a:has-text("Movies"), a:has-text("Filme")').first();
    await moviesLink.click();
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('.media-card, [class*="card"]');
    
    await checkA11y(page);
  });

  // A11Y-008: Mobile-specific interactions accessibility
  test('Mobile search and language switcher have no automatically detected WCAG A/AA violations', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Open mobile burger menu
    const burgerButton = page.locator('button[aria-label="Toggle menu"], button[aria-label="Menu"], .burger-menu, .mobile-menu-toggle').first();
    await burgerButton.click();
    await page.waitForTimeout(500);
    
    // Test mobile search input
    const searchInput = page.locator('input[aria-label="Search"], input[placeholder*="Search"], input[type="search"]').first();
    await searchInput.fill('test');
    await page.waitForTimeout(500);
    
    // Test mobile language switcher (if available in mobile menu)
    const languageSwitcher = page.locator('select[aria-label="Language"], select[name="locale"], .language-switcher').first();
    if (await languageSwitcher.isVisible()) {
      await languageSwitcher.selectOption('de');
      await page.waitForTimeout(500);
    }
    
    await checkA11y(page);
  });
});
