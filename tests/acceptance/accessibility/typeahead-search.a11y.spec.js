// @ts-check
import { test, expect } from '@playwright/test';
import { checkA11y } from '../../setup/a11y.js';

const RESULT_LINK_SELECTOR = 'a.result[data-result-link="true"]';
const SEARCH_INPUT_SELECTOR = '#typeahead-search-input';

async function openResults(page, term = 'Hero') {
	const searchInput = page.locator(SEARCH_INPUT_SELECTOR);

	await expect(searchInput).toHaveAttribute('type', 'search');
	await searchInput.fill(term);

	const resultsContainer = page.locator('#typeahead-search-results');
	await expect(resultsContainer).toBeVisible();

	return {
		searchInput,
		resultsContainer,
		resultLinks: resultsContainer.locator(RESULT_LINK_SELECTOR)
	};
}

test.describe('Accessibility - Typeahead Search', () => {
	test.beforeEach(async ({ page }) => {
		await page.setViewportSize({ width: 1920, height: 1080 });
		await page.goto('?locale=en-US');
		await page.waitForLoadState('networkidle');
	});

	// A11Y-TS-001
	test(
		'[A11Y-TS-001] Desktop typeahead search results has no automatically detected WCAG A/AA violations',
		{
			tag: ['@accessibility', '@a11y', '@desktop', '@typeahead-search']
		},
		async ({ page }) => {
			const { searchInput, resultLinks } = await openResults(page);

			await expect(searchInput).toBeFocused();
			await expect(resultLinks.first()).toBeVisible();
			await checkA11y(page);
		}
	);

	// A11Y-TS-002: Keyboard navigation with arrow keys
	test(
		'[A11Y-TS-002] Desktop typeahead search keyboard navigation has no automatically detected WCAG A/AA violations',
		{
			tag: ['@accessibility', '@a11y', '@desktop', '@typeahead-search', '@keyboard']
		},
		async ({ page }) => {
			const { searchInput, resultsContainer, resultLinks } = await openResults(page);

			const resultCount = await resultLinks.count();
			expect(resultCount).toBeGreaterThanOrEqual(2);

			// Navigate with ArrowDown
			await searchInput.press('ArrowDown');
			await page.waitForTimeout(300);
			await expect(resultLinks.first()).toHaveAttribute('aria-selected', 'true');

			// Navigate to second result with ArrowDown
			await searchInput.press('ArrowDown');
			await page.waitForTimeout(300);
			await expect(resultLinks.nth(1)).toHaveAttribute('aria-selected', 'true');

			// Navigate back with ArrowUp
			await searchInput.press('ArrowUp');
			await page.waitForTimeout(300);
			await expect(resultLinks.first()).toHaveAttribute('aria-selected', 'true');

			// Press Home to go to first result
			await searchInput.press('Home');
			await page.waitForTimeout(300);
			await expect(resultLinks.first()).toHaveAttribute('aria-selected', 'true');

			// Press End to go to last result
			await searchInput.press('End');
			await page.waitForTimeout(300);
			await expect(resultLinks.last()).toHaveAttribute('aria-selected', 'true');

			// Close with Escape
			await searchInput.press('Escape');
			await page.waitForTimeout(500);
			await expect(resultsContainer).toBeHidden();
			await expect(searchInput).toBeFocused();

			await checkA11y(page);
		}
	);

	// A11Y-TS-005: Keyboard selection sets aria-selected
	test(
		'[A11Y-TS-005] Keyboard navigation sets aria-selected on typeahead search result',
		{
			tag: ['@accessibility', '@a11y', '@desktop', '@typeahead-search', '@keyboard']
		},
		async ({ page }) => {
			const { searchInput, resultLinks } = await openResults(page);

			// Navigate with ArrowDown to first result
			await searchInput.press('ArrowDown');
			await page.waitForTimeout(300);
			
			// First result should have aria-selected="true"
			await expect(resultLinks.first()).toHaveAttribute('aria-selected', 'true');
			
			// Other results should have aria-selected="false"
			await expect(resultLinks.nth(1)).toHaveAttribute('aria-selected', 'false');
			
			await checkA11y(page);
		}
	);

	// A11Y-TS-006: Enter key closes dropdown
	test(
		'[A11Y-TS-006] Desktop typeahead search Enter key closes dropdown',
		{
			tag: ['@accessibility', '@a11y', '@desktop', '@typeahead-search', '@keyboard']
		},
		async ({ page }) => {
			const { searchInput, resultsContainer } = await openResults(page);

			// Navigate to first result
			await searchInput.press('ArrowDown');
			await page.waitForTimeout(300);

			// Press Enter to select (closes dropdown)
			await searchInput.press('Enter');
			await page.waitForTimeout(500);

			// Dropdown should be closed
			await expect(resultsContainer).toBeHidden();
			await expect(searchInput).toBeFocused();
			
			await checkA11y(page);
		}
	);
});

test.describe('Accessibility - Typeahead Search Mobile', () => {
	const mobile = {
		viewport: { width: 390, height: 844 },
		deviceScaleFactor: 3,
		isMobile: true,
		hasTouch: true,
		userAgent:
			'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1'
	};

	test.use({
		viewport: mobile.viewport,
		deviceScaleFactor: mobile.deviceScaleFactor,
		isMobile: mobile.isMobile,
		hasTouch: mobile.hasTouch,
		userAgent: mobile.userAgent
	});

	test.beforeEach(async ({ page }) => {
		await page.goto('?locale=en-US');
		await page.waitForLoadState('networkidle');
	});

	// A11Y-TS-003
	test(
		'[A11Y-TS-003] Mobile iOS typeahead search results has no automatically detected WCAG A/AA violations',
		{
			tag: ['@accessibility', '@a11y', '@mobile', '@ios', '@typeahead-search']
		},
		async ({ page }) => {
			await openResults(page, 'Hero');
			await checkA11y(page);
		}
	);

	// A11Y-TS-004
	test(
		'[A11Y-TS-004] Mobile Android typeahead search results has no automatically detected WCAG A/AA violations',
		{
			tag: ['@accessibility', '@a11y', '@mobile', '@android', '@typeahead-search']
		},
		async ({ page }) => {
			await openResults(page, 'Breaking');
			await checkA11y(page);
		}
	);
});
