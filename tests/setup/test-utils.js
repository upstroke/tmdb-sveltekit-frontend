import { cleanupAll as vitestCleanupAll, resetAll as vitestResetAll } from '$tests/setup/vitest.setup.js';

/**
 * Cleanup-Funktion fuer afterEach
 *
 * Fuehrt alle noetigen Cleanup-Operationen aus:
 * - vitest: cleanupAll()
 */
export const cleanupAll = () => {
	vitestCleanupAll();
};

/**
 * Reset-Funktion fuer beforeEach
 *
 * Fuehrt alle noetigen Reset-Operationen aus:
 * - vitest: resetAll()
 */
export const resetAll = () => {
	vitestResetAll();
};
