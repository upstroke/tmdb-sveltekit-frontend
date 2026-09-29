import { test, expect } from '@playwright/test';

/**
 * Security header acceptance tests.
 * These tests verify that src/hooks.server.js sets the required HTTP security headers
 * on every response. Run against the dev server or production preview.
 *
 * Tags: @security
 */

test.describe('HTTP Security Headers @security', () => {
	let headers;

	test.beforeAll(async ({ browser }) => {
		const page = await browser.newPage();
		const response = await page.goto('/');
		headers = response.headers();
		await page.close();
	});

	test('TC-SEC-001: Content-Security-Policy header is present', async () => {
		expect(headers['content-security-policy']).toBeDefined();
	});

	test('TC-SEC-002: CSP restricts scripts to same-origin', async () => {
		const csp = headers['content-security-policy'] ?? '';
		expect(csp).toContain("script-src 'self'");
	});

	test('TC-SEC-003: CSP allows TMDB images', async () => {
		const csp = headers['content-security-policy'] ?? '';
		expect(csp).toContain('image.tmdb.org');
	});

	test('TC-SEC-004: CSP allows TMDB API connections', async () => {
		const csp = headers['content-security-policy'] ?? '';
		expect(csp).toContain('api.themoviedb.org');
	});

	test('TC-SEC-005: CSP blocks iframe embedding via frame-ancestors', async () => {
		const csp = headers['content-security-policy'] ?? '';
		expect(csp).toContain("frame-ancestors 'none'");
	});

	test('TC-SEC-006: X-Content-Type-Options is set to nosniff', async () => {
		expect(headers['x-content-type-options']).toBe('nosniff');
	});

	test('TC-SEC-007: Referrer-Policy header is present', async () => {
		expect(headers['referrer-policy']).toBeDefined();
		expect(headers['referrer-policy']).not.toBe('');
	});

	test('TC-SEC-008: API key is not exposed in the rendered HTML @security', async ({ page }) => {
		await page.goto('/');
		const content = await page.content();
		expect(content).not.toContain('api_key=');
	});
});
