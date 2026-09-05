import { cleanup } from '@testing-library/svelte';

/**
 * Cleanup function for afterEach
 *
 * Executes all necessary cleanup operations:
 * - @testing-library/svelte: cleanup()
 */
export const cleanupAll = () => {
	cleanup();
};

/**
 * Reset function for beforeEach
 *
 * Executes all necessary reset operations:
 * - vitest: clearAllMocks()
 */
export const resetAll = () => {
	vi.clearAllMocks();
};
