import { expect } from 'vitest';

/**
 * Prüft den fehlenden API-Key-Fall für Load-Routen mit gemeinsamer Assertion.
 *
 * @param {unknown} result Rückgabe der Load-Funktion.
 * @param {Record<string, unknown>} expected Erwartetes Ergebnis.
 */
export function expectMissingApiKeyLoadResult(result, expected) {
	expect(result).toEqual(expected);
}

/**
 * Prüft den fehlenden API-Key-Fall für GET-Routen mit gemeinsamer Assertion.
 *
 * @param {Response} response JSON-Response der GET-Route.
 * @param {number} expectedStatus Erwarteter HTTP-Status.
 * @param {Record<string, unknown>} expected Erwartetes JSON-Payload.
 * @returns {Promise<void>}
 */
export async function expectMissingApiKeyJsonResponse(response, expectedStatus, expected) {
	expect(response.status).toBe(expectedStatus);
	expect(await response.json()).toEqual(expected);
}
