import { describe, expect, it } from 'vitest';
import { dimensionCorrection, format, vector2text } from '../utils.js';
import type { V } from '../types.js';

describe(vector2text.name, () => {
	it('converts a simple vector to text', () => {
		expect(vector2text([0, 1, 0, 0, 0, 0, 0, 0])).toBe('kg');
		expect(vector2text([0, 0, 0, 0, 0, 0, -1, 0])).toBe('1/cd');
	});

	it('handles powers and expandPowers', () => {
		expect(vector2text([2, 0, 0, 0, 0, 0, 0, 0])).toBe('m2');
		expect(vector2text([0, 0, 0.25, 0, 0, 0, 0, 0])).toBe('s0.25');
		expect(vector2text([-3, 0, 0, 0, 0, 0, 0, 0])).toBe('1/m3');
	});

	it('handles a complex unit', () => {
		const molarHeatCapacity: V = [2, 1, -2, 0, -1, -1, 0, 0];
		expect(vector2text(molarHeatCapacity)).toBe('m2*kg/s2/K/mol');
	});
});

describe(format.name, () => {
	const output = { num: 1234.567, dim: 'm' };

	it('formats with default spec', () => {
		expect(format(output, { spec: 'none' })).toEqual({ num: '1234.567', dim: 'm' });
		expect(format(output, { spec: 'none', exp: true })).toEqual({ num: '1.234567e+3', dim: 'm' });
	});

	it('formats with fixed spec', () => {
		expect(format(output, { spec: 'fixed', fixed: 2, exp: false })).toEqual({ num: '1234.57', dim: 'm' });
		expect(format(output, { spec: 'fixed', fixed: 2, exp: true })).toEqual({ num: '1.23e+3', dim: 'm' });
	});

	it('formats with digits spec', () => {
		expect(format(output, { spec: 'digits', digits: 3, exp: false })).toEqual({ num: '1230', dim: 'm' });
		expect(format(output, { spec: 'digits', digits: 5, exp: true })).toEqual({ num: '1.2346e+3', dim: 'm' });
	});

	it('returns null for null input', () => {
		expect(format(null, { spec: 'none' })).toBeNull();
	});

	it('adds asterisk if dim starts with number', () => {
		expect(format({ num: 1, dim: '2m' }, { spec: 'fixed', fixed: 0 })).toEqual({ num: '1', dim: ' * 2m' });
	});
});

describe('dimensionCorrection', () => {
	it('returns ok for identical vectors (with tolerance)', () => {
		// prettier-ignore
		const v1: V = [1,      1, -3-9e-9, 0, -1, 0, 0, 7e-7];
		// prettier-ignore
		const v2: V = [1+1e-7, 1, -3,      0, -1, 0, 0, 0];
		expect(dimensionCorrection(v1, v2)).toEqual({ ok: true, corr: [0, 0, 0, 0, 0, 0, 0, 0], faults: [] });
	});

	it('detects missing dimensions', () => {
		// prettier-ignore
		const v1: V = [2, 1,      -3, 0,  0,  0, 0, 6e-6];
		// prettier-ignore
		const v2: V = [2, 1+6e-6, -2, 0, -1, -1, 0, 0];
		const result = dimensionCorrection(v1, v2);
		expect(result.ok).toBe(false);
		expect(result.corr).toEqual([0, 0, -1, 0, 1, 1, 0, 0]);
		expect(result.faults).toEqual(['s', 'K', 'mol']);
	});
});
