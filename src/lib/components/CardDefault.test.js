import { describe, it, expect } from 'vitest';

function sum(a, b) {
	return a + b;
}

describe('sum', () => {
	it('adds 1 + 2 = 3', () => {
		expect(sum(1, 2)).toBe(3);
	});
});
