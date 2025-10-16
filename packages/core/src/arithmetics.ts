import { cfg } from './config.js';
import { err } from './errors.js';
import { Q, type V } from './types.js';

export { Q } from './types.js';

// Check if vector 'v' is all zeroes (with tolerance for floating point error)
export const checkZeros = (v: V) => v.every((o) => Math.abs(o) < cfg.dimTolerance);

// Raise quantity object 'q1' to the power of 'q2'
export const power = (q1: Q, q2: Q) => {
	// q2 has to be dimensionless
	if (!checkZeros(q2.v)) {
		throw err('ERR_power_dim');
	}

	return new Q(q1.n ** q2.n, q1.v.map((o) => o * q2.n) as V);
};

// Multiply a physical quantity 'q1' with 'q2'
export const multiply = (q1: Q, q2: Q) => new Q(q1.n * q2.n, q1.v.map((o, i) => o + q2.v[i]) as V);

// Divide a physical quantity 'q1' with 'q2'
export const divide = (q1: Q, q2: Q) => multiply(q1, power(q2, new Q(-1)));

export const add = (q1: Q, q2: Q) => {
	// check dimension
	const diff = q1.v.map((o, i) => o - q2.v[i]) as V;
	if (!checkZeros(diff)) {
		throw err('ERR_dim_mismatch');
	}

	return new Q(q1.n + q2.n, q1.v);
};

// Subtract a physical quantity 'q2' from 'q1'
export const subtract = (q1: Q, q2: Q) => add(q1, multiply(q2, new Q(-1)));
