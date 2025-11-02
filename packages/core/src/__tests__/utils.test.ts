import { describe, expect, it } from 'vitest';
import { basicUnits, prefixes } from '../data.js';
import { balanceBrackets, checkPrefixWarning, dimensionCorrection, format, vector2text } from '../utils.js';
import type { V } from '../types.js';

describe(balanceBrackets.name, () => {
	it('returns the same string if brackets are balanced or cannot be balanced', () => {
		expect(balanceBrackets(' m/ s )')).toBe('m/ s )');
		expect(balanceBrackets('((kg*m)/(s^2))')).toBe('((kg*m)/(s^2))');
	});
	it('balances unbalanced opening brackets', () => {
		expect(balanceBrackets('( m / s ')).toBe('( m / s)');
		expect(balanceBrackets('((kg*m)/(s^2)')).toBe('((kg*m)/(s^2))');
	});
});

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
	const out = { num: 1234.567, dim: 'm' };

	it('formats with default spec', () => {
		expect(format(out, { spec: 'none' })).toEqual({ ...out, formattedNum: '1234.567' });
		expect(format(out, { spec: 'none', exp: true })).toEqual({ ...out, formattedNum: '1.234567e+3' });
	});

	it('formats with fixed spec', () => {
		expect(format(out, { spec: 'fixed', fixed: 2, exp: false })).toEqual({ ...out, formattedNum: '1234.57' });
		expect(format(out, { spec: 'fixed', fixed: 2, exp: true })).toEqual({ ...out, formattedNum: '1.23e+3' });
	});

	it('formats with digits spec', () => {
		expect(format(out, { spec: 'digits', digits: 3, exp: false })).toEqual({ ...out, formattedNum: '1230' });
		expect(format(out, { spec: 'digits', digits: 5, exp: true })).toEqual({ ...out, formattedNum: '1.2346e+3' });
	});

	it('throws for falsy input', () => {
		// @ts-expect-error non-allowed interface
		expect(() => format(null, { spec: 'none' })).toThrow();
		// @ts-expect-error non-allowed interface
		expect(() => format(undefined, { spec: 'none' })).toThrow();
	});

	it('adds asterisk if dim starts with number', () => {
		expect(format({ num: 1, dim: '2m' }, { spec: 'fixed', fixed: 0 })).toEqual({
			num: 1,
			formattedNum: '1',
			dim: ' * 2m',
		});
	});
});

describe(dimensionCorrection.name, () => {
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

describe(checkPrefixWarning.name, () => {
	const mega = prefixes.find(({ id }) => id === 'M')!;
	const nano = prefixes.find(({ id }) => id === 'n')!;
	const m_all = basicUnits.find(({ id }) => id === 'm')!;
	const USD_plus = basicUnits.find(({ id }) => id === 'USD')!;
	const s_minus = basicUnits.find(({ id }) => id === 's')!;
	const kg_none = basicUnits.find(({ id }) => id === 'kg')!;

	it('returns undefined for allowed combinations', () => {
		expect(checkPrefixWarning(mega, m_all)).toBeUndefined();
		expect(checkPrefixWarning(nano, m_all)).toBeUndefined();
		expect(checkPrefixWarning(mega, USD_plus)).toBeUndefined();
		expect(checkPrefixWarning(nano, s_minus)).toBeUndefined();
	});

	it('returns UUC_Error 201 for disallowed combinations', () => {
		const expect201 = (e: ReturnType<typeof checkPrefixWarning>) => {
			expect(e).toBeDefined();
			expect(e!.code).toBe('WARN_prefixes');
		};
		expect201(checkPrefixWarning(mega, kg_none));
		expect201(checkPrefixWarning(nano, kg_none));
		expect201(checkPrefixWarning(mega, s_minus));
		expect201(checkPrefixWarning(nano, USD_plus));
	});
});
