import { cleanup } from '@testing-library/svelte';

/**
 * Cleanup-Funktion fuer afterEach
 *
 * Fuehrt alle noetigen Cleanup-Operationen aus:
 * - @testing-library/svelte: cleanup()
 */
export const cleanupAll = () => {
	cleanup();
};

/**
 * Reset-Funktion fuer beforeEach
 *
 * Fuehrt alle noetigen Reset-Operationen aus:
 * - vitest: clearAllMocks()
 */
export const resetAll = () => {
	vi.clearAllMocks();
};
