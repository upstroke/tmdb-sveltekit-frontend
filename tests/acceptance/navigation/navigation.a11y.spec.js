import { test } from '@playwright/test';
import { checkA11y } from '../../setup/a11y.js';

test.describe('Accessibility', () => {
  test('Homepage hat keine automatisiert erkannten WCAG A/AA Verstö§§§', async ({ page }) => {
    await page.goto('/');
    await checkA11y(page);
  });

  test('Search-Seite hat keine automatisiert erkannten WCAG A/AA Verstö§§§', async ({ page }) => {
    await page.goto('/search');
    await checkA11y(page);
  });

  test('Movie-Detailseite hat keine automatisiert erkannten WCAG A/AA Verstö§§§', async ({ page }) => {
    await page.goto('/movies/278'); // Beispiel: The Shawshank Redemption
    await checkA11y(page);
  });
});
