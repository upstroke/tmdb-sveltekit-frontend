// @ts-check
import { test, expect } from '@playwright/test';
import { checkA11y } from '../../setup/a11y.js';

const RESULT_LINK_SELECTOR = 'a.result[data-result-link="true"]';
const SEARCH_INPUT_SELECTOR = '#typeahead-search-input';
const RESULTS_CONTAINER_SELECTOR = '#typeahead-search-results';

async function openResults(page, term = 'Hero') {
	const searchInput = page.locator(SEARCH_INPUT_SELECTOR);
	const resultsContainer = page.locator(RESULTS_CONTAINER_SELECTOR);
	const resultLinks = resultsContainer.locator(RESULT_LINK_SELECTOR);

	await expect(searchInput).toHaveAttribute('type', 'search');
	await searchInput.fill(term);

	await expect(searchInput).toBeFocused();
	await expect(searchInput).toHaveAttribute('aria-expanded', 'true', { timeout: 10000 });
	await expect(resultsContainer).toBeVisible({ timeout: 10000 });
	await expect(resultLinks.first()).toBeVisible({ timeout: 10000 });
	await expect.poll(async () => resultLinks.count(), { timeout: 10000 }).toBeGreaterThan(0);

	return {
		searchInput,
		resultsContainer,
		resultLinks
	};
}

async function openStableResults(page, term) {
	const { searchInput, resultsContainer, resultLinks } = await openResults(page, term);

	await expect(searchInput).toBeFocused();
	await expect(searchInput).toHaveAttribute('aria-expanded', 'true', {
		timeout: 10000
	});
	await expect(resultsContainer).toBeVisible({ timeout: 10000 });
	await expect(resultLinks.first()).toBeVisible({ timeout: 10000 });
	await expect.poll(async () => resultLinks.count(), { timeout: 10000 }).toBeGreaterThan(0);

	return {
		searchInput,
		resultsContainer,
		resultLinks
	};
}

async function getFocusedResult(searchInput, resultsContainer) {
	await expect(searchInput).toHaveAttribute('aria-activedescendant', /.+/, {
		timeout: 5000
	});

	const focusedId = await searchInput.getAttribute('aria-activedescendant');

	expect(focusedId).toBeTruthy();

	const focusedResult = resultsContainer.locator(
		`a.result[data-result-link="true"][id="${focusedId}"]`
	);

	await expect(focusedResult).toBeVisible({ timeout: 5000 });
	await expect(focusedResult).toHaveAttribute('aria-selected', 'true', {
		timeout: 5000
	});

	return {
		focusedId,
		focusedResult
	};
}

async function getChangedFocusedResult(searchInput, resultsContainer, previousId) {
	await expect
		.poll(async () => searchInput.getAttribute('aria-activedescendant'), {
			timeout: 5000
		})
		.not.toBe(previousId);

	return getFocusedResult(searchInput, resultsContainer);
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
			const { searchInput, resultLinks } = await openStableResults(page);

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
			const { searchInput, resultsContainer, resultLinks } = await openStableResults(page);

			await expect
				.poll(async () => resultLinks.count(), { timeout: 5000 })
				.toBeGreaterThanOrEqual(2);

			const firstResultId = await resultLinks.first().getAttribute('id');
			const lastResultId = await resultLinks.last().getAttribute('id');
			const initialFocusedId = await searchInput.getAttribute('aria-activedescendant');

			await searchInput.press('ArrowDown');

			const { focusedId: firstFocusedId } = initialFocusedId
				? await getChangedFocusedResult(searchInput, resultsContainer, initialFocusedId)
				: await getFocusedResult(searchInput, resultsContainer);

			expect(firstFocusedId).toBeTruthy();

			await searchInput.press('ArrowDown');

			const { focusedId: secondFocusedId } = await getChangedFocusedResult(
				searchInput,
				resultsContainer,
				firstFocusedId
			);

			expect(secondFocusedId).not.toBe(firstFocusedId);

			await searchInput.press('ArrowUp');

			const { focusedId: previousFocusedId } = await getChangedFocusedResult(
				searchInput,
				resultsContainer,
				secondFocusedId
			);

			expect(previousFocusedId).toBe(firstFocusedId);

			await searchInput.press('Home');

			await expect(searchInput).toHaveAttribute('aria-activedescendant', firstResultId, {
				timeout: 5000
			});

			const { focusedId: homeFocusedId } = await getFocusedResult(searchInput, resultsContainer);
			expect(homeFocusedId).toBe(firstResultId);

			await searchInput.press('End');

			await expect(searchInput).toHaveAttribute('aria-activedescendant', lastResultId, {
				timeout: 5000
			});

			const { focusedId: endFocusedId } = await getFocusedResult(searchInput, resultsContainer);
			expect(endFocusedId).toBe(lastResultId);

			await searchInput.press('Escape');

			await expect(searchInput).toHaveAttribute('aria-expanded', 'false', {
				timeout: 5000
			});
			await expect(resultsContainer).toBeHidden({ timeout: 5000 });
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
			const { searchInput, resultsContainer, resultLinks } = await openStableResults(page);

			await searchInput.press('ArrowDown');
			const { focusedId, focusedResult } = await getFocusedResult(searchInput, resultsContainer);

			await expect(focusedResult).toHaveAttribute('aria-selected', 'true');

			const resultCount = await resultLinks.count();
			for (let index = 0; index < resultCount; index += 1) {
				const result = resultLinks.nth(index);
				const id = await result.getAttribute('id');

				if (id !== focusedId) {
					await expect(result).toHaveAttribute('aria-selected', 'false');
				}
			}

			await checkA11y(page);
		}
	);

	// A11Y-TS-006: Enter key activates focused result
	test(
		'[A11Y-TS-006] Desktop typeahead search Enter key activates focused result',
		{
			tag: ['@accessibility', '@a11y', '@desktop', '@typeahead-search', '@keyboard']
		},
		async ({ page }) => {
			const { searchInput, resultsContainer } = await openStableResults(page);
			await searchInput.press('ArrowDown');

			const { focusedResult } = await getFocusedResult(searchInput, resultsContainer);
			const expectedHref = await focusedResult.getAttribute('href');

			expect(expectedHref).toBeTruthy();

			const expectedUrl = new URL(expectedHref, page.url());

			await Promise.all([
				page.waitForURL(expectedUrl.toString(), {
					waitUntil: 'commit',
					timeout: 10000
				}),
				searchInput.press('Enter')
			]);

			await expect(page).toHaveURL(expectedUrl.toString());
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
			await openStableResults(page, 'Hero');
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
			await openStableResults(page, 'Breaking');
			await checkA11y(page);
		}
	);
});
