import { describe, expect, it } from 'vitest';
import { add, checkZeros, divide, multiply, power, Q, subtract } from '../arithmetics.js';
import type { V } from '../types.js';
import { expectToBeErrorCode } from './test_utils.js';

describe('Q arithmetics', () => {
	const q1 = new Q(4, [-1, 1, -2, 0, 0, 0, 0, 0]); // 4 N
	const q2 = new Q(16, [-2, 2, -4, 0, 0, 0, 0, 0]); // (4 N)^2
	const q3 = new Q(7, [-1, 1, -2, 0, 0, 0, 0, 0]); // 7/N

	it('Q instance identity', () => {
		expect(q1).toEqual({ n: 4, v: [-1, 1, -2, 0, 0, 0, 0, 0] });
	});

	it(power.name, () => {
		const powDimless = new Q(2);
		expect(power(q1, powDimless)).toEqual(q2);

		const powDimlessWithinTolerance = new Q(2, [1e-10, 0, 0, 0, 0, 0, 0, 0]);
		expect(power(q1, powDimlessWithinTolerance)).toEqual(q2);

		const powNotDimless = new Q(2, [1, 0, 0, 0, 0, 0, 0, 0]);
		expectToBeErrorCode(() => power(q1, powNotDimless), 'ERR_power_dim');
	});

	it(multiply.name, () => {
		const res = new Q(64, [-3, 3, -6, 0, 0, 0, 0, 0]);
		expect(multiply(q1, q2)).toEqual(res);
	});

	it(divide.name, () => {
		const res = new Q(0.25, [1, -1, 2, 0, 0, 0, 0, 0]);
		expect(divide(q1, q2)).toEqual(res);
	});

	it(add.name, () => {
		const res = new Q(11, [-1, 1, -2, 0, 0, 0, 0, 0]);
		expect(add(q1, q3)).toEqual(res);

		expectToBeErrorCode(() => add(q1, q2), 'ERR_dim_mismatch');
	});

	it(subtract.name, () => {
		const res = new Q(-3, [-1, 1, -2, 0, 0, 0, 0, 0]);
		expect(subtract(q1, q3)).toEqual(res);

		expectToBeErrorCode(() => subtract(q1, q2), 'ERR_dim_mismatch');
	});

	it(checkZeros.name, () => {
		expect(checkZeros(new Array(8).fill(0) as V)).toBe(true);
		expect(checkZeros([1e-11, 0, 0, 0, 0, 0, 0, 0])).toBe(true);
		expect(checkZeros([0.1, 0, 0, 0, 0, 0, 0, 0])).toBe(false);
	});
});
