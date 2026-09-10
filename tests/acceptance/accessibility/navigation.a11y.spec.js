// @ts-check
import { test, expect } from '@playwright/test';
import { checkA11y } from '../../setup/a11y.js';

/**
 * Accessibility tests for navigation flows.
 * 
 * Test plan: tests/acceptance/accessibility/accessibility-testplan.md
 * 
 * Test cases:
 * - A11Y-NAV-01: Homepage initial load accessibility
 * - A11Y-NAV-02: Homepage after search interaction accessibility
 * - A11Y-NAV-03: Search results page accessibility
 * - A11Y-NAV-04: Details page accessibility
 */

test.describe('Accessibility - Homepage', () => {
  // A11Y-NAV-01: Homepage initial load accessibility
  test('Homepage initial load has no automatically detected WCAG A/AA violations', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await checkA11y(page);
  });

  // A11Y-NAV-02: Homepage after search interaction accessibility
  test('Homepage after search interaction has no automatically detected WCAG A/AA violations', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Perform search interaction
    const searchInput = page.locator('input[aria-label="Search"], input[placeholder*="Search"], input[type="search"]');
    await searchInput.fill('dune');
    await page.waitForTimeout(1000); // Wait for search results
    
    await checkA11y(page);
  });
});

test.describe('Accessibility - Search Results', () => {
  // A11Y-NAV-03: Search results page accessibility
  test('Search results page has no automatically detected WCAG A/AA violations', async ({ page }) => {
    await page.goto('/search?q=dune');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('.media-card, [class*="card"], [data-testid*="card"]');
    
    await checkA11y(page);
  });
});

test.describe('Accessibility - Details Page', () => {
  // A11Y-NAV-04: Details page accessibility
  test('Movie details page has no automatically detected WCAG A/AA violations', async ({ page }) => {
    // Navigate to a movie details page (using a known movie ID)
    await page.goto('/movie/438631'); // Dune
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('.details-hero, [class*="hero"], [data-testid*="details"]');
    
    await checkA11y(page);
  });
});
