import { expect } from 'vitest';

/**
 * Checks the missing API key case for load routes with a shared assertion.
 *
 * @param {unknown} result Return value of the load function.
 * @param {Record<string, unknown>} expected Expected result.
 */
export function expectMissingApiKeyLoadResult(result, expected) {
	expect(result).toEqual(expected);
}

/**
 * Checks the missing API key case for GET routes with a shared assertion.
 *
 * @param {Response} response JSON response of the GET route.
 * @param {number} expectedStatus Expected HTTP status.
 * @param {Record<string, unknown>} expected Expected JSON payload.
 * @returns {Promise<void>}
 */
export async function expectMissingApiKeyJsonResponse(response, expectedStatus, expected) {
	expect(response.status).toBe(expectedStatus);
	expect(await response.json()).toEqual(expected);
}
