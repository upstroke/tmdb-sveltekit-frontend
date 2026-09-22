import { test, expect } from '@playwright/test';
import { checkA11y } from '$tests/setup/a11y.js';

test.describe('TabGroupe Accessibility', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/tv-shows/108978?locale=en-US', { waitUntil: 'networkidle' });
		await page.waitForSelector('[role="tablist"]');
	});

	test(
		'TV detail page initial load has no automatically detected WCAG A/AA violations',
		{
			tag: ['@accessibility', '@a11y', '@desktop', '@tv-details', '@tabgroupe']
		},
		async ({ page }) => {
			await expect(page.getByRole('tablist')).toBeVisible();
			await expect(page.getByRole('tabpanel').first()).toBeVisible();

			await checkA11y(page);
		}
	);

	test('ArrowRight moves focus to next tab', async ({ page }) => {
		const tabs = page.getByRole('tab');

		await expect(tabs.first()).toBeVisible();
		await tabs.first().focus();
		await expect(tabs.first()).toBeFocused();

		await page.keyboard.press('ArrowRight');

		await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true');
		await expect(tabs.nth(1)).toBeFocused();
	});

	test('ArrowDown moves focus to next episode', async ({ page }) => {
		const tabpanel = page.getByRole('tabpanel').first();
		const episodes = tabpanel.getByRole('listitem');

		await expect(episodes.first()).toBeVisible();
		await episodes.first().focus();
		await expect(episodes.first()).toBeFocused();

		await page.keyboard.press('ArrowDown');
		await expect(episodes.nth(1)).toBeFocused();
	});

	test('ArrowUp moves focus to previous episode', async ({ page }) => {
		const tabpanel = page.getByRole('tabpanel').first();
		const episodes = tabpanel.getByRole('listitem');

		await expect(episodes.nth(1)).toBeVisible();
		await episodes.nth(1).focus();
		await expect(episodes.nth(1)).toBeFocused();

		await page.keyboard.press('ArrowUp');
		await expect(episodes.first()).toBeFocused();
	});

	test('Home moves focus to first episode', async ({ page }) => {
		const tabpanel = page.getByRole('tabpanel').first();
		const episodes = tabpanel.getByRole('listitem');

		await episodes.last().focus();
		await expect(episodes.last()).toBeFocused();

		await page.keyboard.press('Home');
		await expect(episodes.first()).toBeFocused();
	});

	test('End moves focus to last episode', async ({ page }) => {
		const tabpanel = page.getByRole('tabpanel').first();
		const episodes = tabpanel.getByRole('listitem');

		await episodes.first().focus();
		await expect(episodes.first()).toBeFocused();

		await page.keyboard.press('End');
		await expect(episodes.last()).toBeFocused();
	});

	test(
		'Switching to another season tab has no automatically detected WCAG A/AA violations',
		{
			tag: ['@accessibility', '@a11y', '@desktop', '@tabgroupe', '@season-tab']
		},
		async ({ page }) => {
			const tabs = page.getByRole('tab');
			await expect(tabs.first()).toBeVisible();

			const tabCount = await tabs.count();
			test.skip(
				tabCount < 2,
				'The page needs at least two season tabs for this accessibility check.'
			);

			await tabs.nth(1).click();
			await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true');
			await expect(page.getByRole('tabpanel').first()).toBeVisible();

			await checkA11y(page);
		}
	);
});
