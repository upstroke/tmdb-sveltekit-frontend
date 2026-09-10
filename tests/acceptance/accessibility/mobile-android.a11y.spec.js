// @ts-check
import { test, expect, devices } from '@playwright/test';
import { checkA11y } from '../../setup/a11y.js';

const android = devices['Pixel 5'];

/**
 * Accessibility tests for mobile navigation flows on Android.
 * 
 * Test plan: tests/acceptance/accessibility/accessibility-testplan.md
 * 
 * Test cases:
 * - A11Y-009: Android burger menu closed state accessibility
 * - A11Y-010: Android burger menu open state accessibility
 * - A11Y-011: Android navigation menu accessibility
 * - A11Y-012: Android-specific interactions accessibility
 */

test.describe('Accessibility - Android Mobile Navigation', () => {
  test.use({
    viewport: android.viewport,
    deviceScaleFactor: android.deviceScaleFactor,
    isMobile: android.isMobile,
    hasTouch: android.hasTouch,
    userAgent: android.userAgent,
  });

  // A11Y-009: Android burger menu closed state accessibility
  test('Android homepage with closed burger menu has no automatically detected WCAG A/AA violations', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Ensure burger menu is closed
    const burgerButton = page.locator('button[aria-label="Toggle menu"], button[aria-label="Menu"], .burger-menu, .mobile-menu-toggle').first();
    await expect(burgerButton).toBeVisible();
    
    await checkA11y(page);
  });

  // A11Y-010: Android burger menu open state accessibility
  test('Android homepage with open burger menu has no automatically detected WCAG A/AA violations', async ({ page }) => {
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

  // A11Y-011: Android navigation menu accessibility
  test('Android navigation menu items have no automatically detected WCAG A/AA violations', async ({ page }) => {
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

  // A11Y-012: Android-specific interactions accessibility
  test('Android search and language switcher have no automatically detected WCAG A/AA violations', async ({ page }) => {
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
