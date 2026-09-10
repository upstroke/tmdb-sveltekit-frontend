// @ts-check
import { test, expect, devices } from '@playwright/test';
import { checkA11y } from '../../setup/a11y.js';

const mobileIOS = devices['iPhone 13'];
const mobileAndroid = devices['Pixel 5'];

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
    await page.goto('/?locale=en-US');
    await page.waitForLoadState('networkidle');
    await checkA11y(page);
  });

  // A11Y-002: Desktop homepage after load more accessibility
  test('Desktop homepage after load more has no automatically detected WCAG A/AA violations', async ({ page }) => {
    await page.goto('/?locale=en-US');
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

// iOS Mobile Tests (iPhone 13)
test.describe('Accessibility - Mobile iOS Navigation', () => {
  test.use({
    viewport: mobileIOS.viewport,
    deviceScaleFactor: mobileIOS.deviceScaleFactor,
    isMobile: mobileIOS.isMobile,
    hasTouch: mobileIOS.hasTouch,
    userAgent: mobileIOS.userAgent,
  });

  // A11Y-003: Mobile homepage with closed burger menu accessibility
  test('Mobile iOS homepage with closed burger menu has no automatically detected WCAG A/AA violations', async ({ page }) => {
    await page.goto('/?locale=en-US');
    await page.waitForLoadState('networkidle');
    
    // Verify burger menu is closed
    const burgerButton = page.getByRole('button', { name: 'Open or close navigation' });
    await expect(burgerButton).toBeVisible();
    await expect(burgerButton).toHaveAttribute('aria-expanded', 'false');
    
    await checkA11y(page);
  });

  // A11Y-004: Mobile homepage with open burger menu accessibility
  test('Mobile iOS homepage with open burger menu has no automatically detected WCAG A/AA violations', async ({ page }) => {
    await page.goto('/?locale=en-US');
    await page.waitForLoadState('networkidle');
    
    // Open mobile burger menu
    const burgerButton = page.getByRole('button', { name: 'Open or close navigation' });
    await burgerButton.click();
    await page.waitForTimeout(500); // Wait for menu animation
    
    // Verify menu is open
    await expect(burgerButton).toHaveAttribute('aria-expanded', 'true');
    
    await checkA11y(page);
  });

  // A11Y-005: Mobile navigation to movies page accessibility
  test('Mobile iOS navigation to movies page has no automatically detected WCAG A/AA violations', async ({ page }) => {
    await page.goto('/?locale=en-US');
    await page.waitForLoadState('networkidle');
    
    // Open mobile burger menu
    const burgerButton = page.getByRole('button', { name: 'Open or close navigation' });
    await burgerButton.click();
    await page.waitForTimeout(500);
    
    // Navigate to Movies page via mobile menu
    const moviesLink = page.getByRole('link', { name: 'Movies' });
    await moviesLink.click();
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('.media-card, [class*="card"]');
    
    await checkA11y(page);
  });
});

// Android Mobile Tests (Pixel 5)
test.describe('Accessibility - Mobile Android Navigation', () => {
  test.use({
    viewport: mobileAndroid.viewport,
    deviceScaleFactor: mobileAndroid.deviceScaleFactor,
    isMobile: mobileAndroid.isMobile,
    hasTouch: mobileAndroid.hasTouch,
    userAgent: mobileAndroid.userAgent,
  });

  // A11Y-006: Mobile homepage with closed burger menu accessibility
  test('Mobile Android homepage with closed burger menu has no automatically detected WCAG A/AA violations', async ({ page }) => {
    await page.goto('/?locale=en-US');
    await page.waitForLoadState('networkidle');
    
    // Verify burger menu is closed
    const burgerButton = page.getByRole('button', { name: 'Open or close navigation' });
    await expect(burgerButton).toBeVisible();
    await expect(burgerButton).toHaveAttribute('aria-expanded', 'false');
    
    await checkA11y(page);
  });

  // A11Y-007: Mobile homepage with open burger menu accessibility
  test('Mobile Android homepage with open burger menu has no automatically detected WCAG A/AA violations', async ({ page }) => {
    await page.goto('/?locale=en-US');
    await page.waitForLoadState('networkidle');
    
    // Open mobile burger menu
    const burgerButton = page.getByRole('button', { name: 'Open or close navigation' });
    await burgerButton.click();
    await page.waitForTimeout(500); // Wait for menu animation
    
    // Verify menu is open
    await expect(burgerButton).toHaveAttribute('aria-expanded', 'true');
    
    await checkA11y(page);
  });

  // A11Y-008: Mobile navigation to movies page accessibility
  test('Mobile Android navigation to movies page has no automatically detected WCAG A/AA violations', async ({ page }) => {
    await page.goto('/?locale=en-US');
    await page.waitForLoadState('networkidle');
    
    // Open mobile burger menu
    const burgerButton = page.getByRole('button', { name: 'Open or close navigation' });
    await burgerButton.click();
    await page.waitForTimeout(500);
    
    // Navigate to Movies page via mobile menu
    const moviesLink = page.getByRole('link', { name: 'Movies' });
    await moviesLink.click();
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('.media-card, [class*="card"]');
    
    await checkA11y(page);
  });
});
