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
 * - A11Y-002: Desktop homepage after load more accessibility
 * - A11Y-003: Mobile homepage with closed burger menu accessibility
 * - A11Y-004: Mobile homepage with open burger menu accessibility
 * - A11Y-005: Mobile navigation to movies page accessibility
 */

test.describe('Accessibility - Desktop Homepage', () => {
  // A11Y-001: Desktop homepage initial load accessibility
  test('Desktop homepage initial load has no automatically detected WCAG A/AA violations', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await checkA11y(page);
  });

  // A11Y-002: Desktop homepage after load more accessibility
  test('Desktop homepage after load more has no automatically detected WCAG A/AA violations', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Click Load More button if available
    const loadMoreButton = page.locator('button:has-text("More results"), button:has-text("Load more"), .load-more button').first();
    if (await loadMoreButton.isVisible()) {
      await loadMoreButton.click();
      await page.waitForTimeout(1000); // Wait for new content to load
    }
    
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

  // A11Y-003: Mobile homepage with closed burger menu accessibility
  test('Mobile homepage with closed burger menu has no automatically detected WCAG A/AA violations', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Ensure burger menu is closed
    const burgerButton = page.locator('button[aria-label="Toggle menu"], button[aria-label="Menu"], .burger-menu, .mobile-menu-toggle').first();
    await expect(burgerButton).toBeVisible();
    
    await checkA11y(page);
  });

  // A11Y-004: Mobile homepage with open burger menu accessibility
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

  // A11Y-005: Mobile navigation to movies page accessibility
  test('Mobile navigation to movies page has no automatically detected WCAG A/AA violations', async ({ page }) => {
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
});
