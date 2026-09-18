import { test, expect } from '@playwright/test';
import { getTestLocaleText } from '../../setup/test-utils.js';
import { checkA11y } from '$tests/setup/a11y.js';

/**
 * Typeahead Search Accessibility Tests
 *
 * Verifies semantic roles, ARIA relationships, keyboard interaction,
 * automatic initial-result selection, focus management, and accessible
 * status feedback for TypeHeadSearch.
 */

const enUS = getTestLocaleText('en-US');
const noResultsMessage = enUS.messages.searchNoResults;
const searchErrorMessage = enUS.messages.searchError;
const searchHintMessage = enUS.messages.searchHint;
const searchResultsLabel = enUS.messages.searchResults;


test.describe('Typeahead Search Accessibility', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/?locale=en-US', { waitUntil: 'networkidle' });
	});

	function getSearchInput(page) {
		return page.locator('#typeahead-search-input');
	}

	function getResults(page) {
		return page.locator('#typeahead-search-results');
	}

	function getStatusLayer(page) {
		return page.locator('#status-messages-layer');
	}

	async function searchForResults(page, query = 'Fight Club') {
		const input = getSearchInput(page);
		await input.click();
		await input.pressSequentially(query, { delay: 50 });
		await expect(getResults(page)).toBeVisible();
		return getResults(page).getByRole('option');
	}

	test(
		'Desktop initial load has no automatically detected WCAG A/AA violations',
		{
			tag: ['@accessibility', '@a11y', '@desktop']
		},
		async ({ page }) => {
			await checkA11y(page);
		}
	);

	// -------------------------------------------------------------------------
	// TC-TS-A11Y-001: Combobox attributes
	// -------------------------------------------------------------------------
	test('TC-TS-A11Y-001: search input has correct ARIA attributes', async ({ page }) => {
		const input = getSearchInput(page);

		await expect(input).toHaveAttribute('role', 'combobox');
		await expect(input).toHaveAttribute('aria-autocomplete', 'list');
		await expect(input).toHaveAttribute('aria-haspopup', 'listbox');
		await expect(input).toHaveAttribute('aria-controls', 'typeahead-search-results');
		await expect(input).toHaveAttribute('aria-expanded', 'false');
		await expect(input).toHaveAttribute('aria-describedby', 'typeahead-search-hint');
	});

	// -------------------------------------------------------------------------
	// TC-TS-A11Y-002: Listbox semantics
	// -------------------------------------------------------------------------
	test('TC-TS-A11Y-002: results list has correct ARIA attributes', async ({ page }) => {
		await searchForResults(page);

		const results = getResults(page);
		await expect(results).toHaveAttribute('role', 'listbox');
		await expect(results).toHaveAttribute('aria-label', searchResultsLabel);
		await expect(results).toHaveAttribute('aria-live', 'polite');
		await expect(results).toHaveAttribute('aria-atomic', 'false');
	});

	// -------------------------------------------------------------------------
	// TC-TS-A11Y-003: Result option semantics and initial selection
	// -------------------------------------------------------------------------
	test('TC-TS-A11Y-003: result items have correct ARIA attributes', async ({ page }) => {
		const resultItems = await searchForResults(page);
		const firstResult = resultItems.first();

		await expect(firstResult).toHaveAttribute('role', 'option');
		await expect(firstResult).toHaveAttribute('aria-selected', 'true');
		await expect(firstResult).toHaveAttribute('tabindex', '0');
		await expect(firstResult).toHaveAttribute('aria-labelledby', /typeahead-result-type-/);

		if ((await resultItems.count()) > 1) {
			const secondResult = resultItems.nth(1);
			await expect(secondResult).toHaveAttribute('aria-selected', 'false');
			await expect(secondResult).toHaveAttribute('tabindex', '-1');
		}
	});

	// -------------------------------------------------------------------------
	// TC-TS-A11Y-004: ArrowDown selects next result
	// -------------------------------------------------------------------------
	test('TC-TS-A11Y-004: ArrowDown selects the next result', async ({ page }) => {
		const resultItems = await searchForResults(page);
		expect(await resultItems.count()).toBeGreaterThanOrEqual(2);

		const firstResult = resultItems.first();
		const secondResult = resultItems.nth(1);

		await expect(firstResult).toHaveAttribute('aria-selected', 'true');

		await page.keyboard.press('ArrowDown');

		await expect(secondResult).toHaveAttribute('aria-selected', 'true');
		await expect(secondResult).toHaveAttribute('tabindex', '0');
		await expect(firstResult).toHaveAttribute('aria-selected', 'false');
		await expect(firstResult).toHaveAttribute('tabindex', '-1');
	});

	// -------------------------------------------------------------------------
	// TC-TS-A11Y-005: ArrowUp selects previous result
	// -------------------------------------------------------------------------
	test('TC-TS-A11Y-005: ArrowUp selects the previous result', async ({ page }) => {
		const resultItems = await searchForResults(page);
		expect(await resultItems.count()).toBeGreaterThanOrEqual(2);

		const firstResult = resultItems.first();
		const secondResult = resultItems.nth(1);

		await page.keyboard.press('ArrowDown');
		await expect(secondResult).toHaveAttribute('aria-selected', 'true');

		await page.keyboard.press('ArrowUp');
		await expect(firstResult).toHaveAttribute('aria-selected', 'true');
		await expect(firstResult).toHaveAttribute('tabindex', '0');
	});

	// -------------------------------------------------------------------------
	// TC-TS-A11Y-006: Home selects first result
	// -------------------------------------------------------------------------
	test('TC-TS-A11Y-006: Home selects the first result', async ({ page }) => {
		const resultItems = await searchForResults(page);
		expect(await resultItems.count()).toBeGreaterThanOrEqual(2);

		await page.keyboard.press('End');
		await expect(resultItems.last()).toHaveAttribute('aria-selected', 'true');

		await page.keyboard.press('Home');
		await expect(resultItems.first()).toHaveAttribute('aria-selected', 'true');
		await expect(resultItems.first()).toHaveAttribute('tabindex', '0');
	});

	// -------------------------------------------------------------------------
	// TC-TS-A11Y-007: End selects last result
	// -------------------------------------------------------------------------
	test('TC-TS-A11Y-007: End selects the last result', async ({ page }) => {
		const resultItems = await searchForResults(page);
		expect(await resultItems.count()).toBeGreaterThanOrEqual(2);

		await page.keyboard.press('End');

		const lastResult = resultItems.last();
		await expect(lastResult).toHaveAttribute('aria-selected', 'true');
		await expect(lastResult).toHaveAttribute('tabindex', '0');
	});

	// -------------------------------------------------------------------------
	// TC-TS-A11Y-008: Enter activates selected result
	// -------------------------------------------------------------------------
	test('TC-TS-A11Y-008: Enter activates the selected result', async ({ page }) => {
		const resultItems = await searchForResults(page);
		const firstResult = resultItems.first();
		const expectedHref = await firstResult.getAttribute('href');

		expect(expectedHref).not.toBeNull();

		await page.keyboard.press('Enter');

		await expect(page).toHaveURL(expectedHref);
	});

	// -------------------------------------------------------------------------
	// TC-TS-A11Y-009: Escape closes list and returns focus
	// -------------------------------------------------------------------------
	test('TC-TS-A11Y-009: Escape closes results and returns focus to input', async ({ page }) => {
		await searchForResults(page);
		const input = getSearchInput(page);

		await page.keyboard.press('Escape');

		await expect(getResults(page)).not.toBeVisible();
		await expect(input).toBeFocused();
		await expect(input).toHaveAttribute('aria-expanded', 'false');
	});

	// -------------------------------------------------------------------------
	// TC-TS-A11Y-010: No-results status semantics
	// -------------------------------------------------------------------------
	test('TC-TS-A11Y-010: no-results status has correct ARIA attributes', async ({ page }) => {
		const input = getSearchInput(page);
		await input.click();
		await input.pressSequentially('XYZNOTFOUND123', { delay: 50 });

		await expect(getStatusLayer(page)).toBeVisible();

		const status = getStatusLayer(page).locator('#status-messages');
		await expect(status).toHaveAttribute('role', 'status');
		await expect(status).toHaveAttribute('aria-live', 'polite');
		await expect(status).toHaveAttribute('aria-atomic', 'true');
		await expect(status).toContainText(noResultsMessage);
		await expect(getResults(page)).not.toBeVisible();
	});

	// -------------------------------------------------------------------------
	// TC-TS-A11Y-011: Error status semantics
	// -------------------------------------------------------------------------
	test('TC-TS-A11Y-011: error state has alert semantics', async ({ page }) => {
		await page.route('**/search**', async (route) => {
			await route.abort('failed');
		});

		const input = getSearchInput(page);
		await input.click();
		await input.pressSequentially('Hero', { delay: 50 });

		await expect(getStatusLayer(page)).toBeVisible();

		const status = getStatusLayer(page).locator('#status-messages');
		await expect(status).toHaveAttribute('role', 'alert');
		await expect(status).toHaveAttribute('aria-live', 'assertive');
		await expect(status).toHaveAttribute('aria-atomic', 'true');
		await expect(status).toContainText(searchErrorMessage);
		await expect(getResults(page)).not.toBeVisible();
	});

	// -------------------------------------------------------------------------
	// TC-TS-A11Y-012: Search hint relationship
	// -------------------------------------------------------------------------
	test('TC-TS-A11Y-012: search hint is associated with input', async ({ page }) => {
		const input = getSearchInput(page);
		await expect(input).toHaveAttribute('aria-describedby', 'typeahead-search-hint');

		const hint = page.locator('#typeahead-search-hint');
		await expect(hint).toBeAttached();
		await expect(hint).toContainText(searchHintMessage);
	});

	// -------------------------------------------------------------------------
	// TC-TS-A11Y-013: Tab follows roving-tabindex
	// -------------------------------------------------------------------------
	test('TC-TS-A11Y-013: selected result is reachable with Tab', async ({ page }) => {
		const resultItems = await searchForResults(page);
		const input = getSearchInput(page);
		const firstResult = resultItems.first();

		await expect(firstResult).toHaveAttribute('tabindex', '0');
		await input.focus();
		await page.keyboard.press('Tab');

		await expect(firstResult).toBeFocused();
	});

	// -------------------------------------------------------------------------
	// TC-TS-A11Y-014: aria-activedescendant synchronization
	// -------------------------------------------------------------------------
	test('TC-TS-A11Y-014: aria-activedescendant tracks selected result', async ({ page }) => {
		const resultItems = await searchForResults(page);
		const input = getSearchInput(page);
		const firstResult = resultItems.first();

		const firstResultId = await firstResult.getAttribute('id');
		await expect(input).toHaveAttribute('aria-activedescendant', firstResultId);

		if ((await resultItems.count()) > 1) {
			const secondResult = resultItems.nth(1);
			const secondResultId = await secondResult.getAttribute('id');

			await page.keyboard.press('ArrowDown');
			await expect(input).toHaveAttribute('aria-activedescendant', secondResultId);
		}
	});
});
