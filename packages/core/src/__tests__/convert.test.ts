import { describe, it, expect } from 'vitest';
import { ErrorCode, UUCError } from '../errors.js';
import { Convert, Res } from '../convert.js';
import { Convert_parse } from '../convert_parse.js';
import { csts } from '../data.js';

// Create a new UUCError without regard to message (only to match instance and code in test)
const err = (code: ErrorCode) => new UUCError(code, 'Test error');

// Are numbers approximately equal within tolerance?
const isEqApx = (arg1: number, arg2: number, tol: number): boolean => Math.abs(arg1 - arg2) < tol;

const convert = new (Convert as any)(); // TODO types

// It expects a full conversion result with 'input' & 'target' strings, expected result number, numerical tolerance and optionally the expected warning.
const fullTest = (input: string, target: string, expectNum: number, tol: number, expectWarn?: ErrorCode) =>
	it(`${input} → ${target} ≅ ${String(expectNum)} ${expectWarn ? `(with ${expectWarn})` : ''}`, () => {
		const res: Res = convert.fullConversion(input, target);
		const { status } = res;
		// Is not expected to ever throw any UUCError
		if (status === 2) {
			throw res.messages[0];
		}

		if (expectWarn !== undefined) {
			expect(status).toBe(1);
			expect(res.messages.length).toBeGreaterThan(0);
			expect(res.messages[0].code).toBe(expectWarn);
		}

		expect(isEqApx(res.output.num, expectNum, tol)).toBe(true);
	});

// It expects a full conversion result with 'input' & 'target' strings and expected error.
const fullTestErr = (input: string, target: string, code: ErrorCode) =>
	it(`${input} → ${target} with ${code}`, () => {
		const res: Res = convert.fullConversion(input, target);
		const { status } = res;
		expect(status).toBe(2);
		expect(res.messages.length).toBeGreaterThan(0);
		expect(res.messages[0].code).toBe(code);
	});

// expect(() => fn('aaa')).toThrowError(err('ERR_brackets_missing'));

describe('Arithmetics', () => {
	const q1 = new convert.Q(4, [-1, 1, -2, 0, 0, 0, 0, 0]); // 4 N
	const q2 = new convert.Q(16, [-2, 2, -4, 0, 0, 0, 0, 0]); // (4 N)^2
	const q3 = new convert.Q(7, [-1, 1, -2, 0, 0, 0, 0, 0]);

	it('Q instance', () => {
		expect(q1).toEqual({ n: 4, v: [-1, 1, -2, 0, 0, 0, 0, 0] });
	});
	it('convert.power', () => {
		expect(convert.power(q1, new convert.Q(2))).toEqual(q2);
		// power must be dimensionless, but with tolerance
		expect(convert.power(q1, new convert.Q(2, [1e-10]))).toEqual(q2);
		expect(() => convert.power(q1, new convert.Q(2, [1]))).toThrowError(err('ERR_power_dim'));
	});
	it('convert.multiply', () => {
		const res = new convert.Q(64, [-3, 3, -6, 0, 0, 0, 0, 0]);
		expect(convert.multiply(q1, q2)).toEqual(res);
	});
	it('convert.divide', () => {
		const res = new convert.Q(0.25, [1, -1, 2, 0, 0, 0, 0, 0]);
		expect(convert.divide(q1, q2)).toEqual(res);
	});
	it('convert.add', () => {
		const res = new convert.Q(11, [-1, 1, -2, 0, 0, 0, 0, 0]);
		expect(convert.add(q1, q3)).toEqual(res);
		expect(() => convert.add(q1, q2)).toThrowError(err('ERR_dim_mismatch'));
	});
	it('convert.subtract', () => {
		const res = new convert.Q(-3, [-1, 1, -2, 0, 0, 0, 0, 0]);
		expect(convert.subtract(q1, q3)).toEqual(res);
		expect(() => convert.subtract(q1, q2)).toThrowError(err('ERR_dim_mismatch'));
	});
});

// TODO Convert_parse happy path tests with proper return value checks
describe('Convert_parse', () => {
	expect(Convert_parse(convert, '(2+(1+1))')).toBeTruthy();
});

describe('Convert_parse errors', () => {
	expect(() => Convert_parse(convert, '3*(4*5)*2)')).toThrowError(err('ERR_brackets_missing'));
	expect(() => Convert_parse(convert, '2 * / 3')).toThrowError(err('ERR_operators'));
	expect(() => Convert_parse(convert, '2//4')).toThrowError(err('ERR_operators'));
	expect(() => Convert_parse(convert, '4*()*5')).toThrowError(err('ERR_brackets_empty'));
	expect(() => Convert_parse(convert, '1e999')).toThrowError(err('ERR_NaN'));
	expect(() => Convert_parse(convert, 'm..')).toThrowError(err('ERR_unitPower'));
	expect(() => Convert_parse(convert, 'kPaa')).toThrowError(err('ERR_unknownUnit'));
	expect(() => Convert_parse(convert, '3#4~5')).toThrowError(err('ERR_special_chars'));
	expect(() => Convert_parse(convert, '{3°C')).toThrowError(err('ERR_cbrackets_missing'));
	expect(() => Convert_parse(convert, '(2+{1+1)}')).toThrowError(err('ERR_brackets_mismatch'));
});

describe('Full conversion', () => {
	fullTest('3*(7-3)*2', '', 24, 1e-6);
	fullTest('(3*(7-3)*2)', '', 24, 1e-6);
	fullTest('3*(4*(5*(2+1)-1)', '', 168, 1e-6); // tolerance for missing closing brackets )
	fullTest('0.5 ((5(6+(8)3)) 2·3', '15', 30, 1e-6); // spaces and cdots instead of *
	fullTest('2²³', '', 64, 1e-6); // Unicode support
	fullTest('3(4+5)2 / (2*2^3*2) * 7*(2+2*2+2)', '', 94.5, 1e-6); // not even spaces, numbers right on brackets
	fullTest('km / 5min', 'km/h', 12, 1e-6); // number tightly with unit shall be interpreted as (5min)
	fullTest('3m2*(4*5m)*2kPa', 'kg*m2 * s^(-2)', 120000, 1e-6);
	fullTest(' -3.23e+4m2 * (42,77e-2*5m)  *2kPa1.0 ', 'MJ', -138.1471, 1e-2);
	fullTest('3*(4*(5+2', '', 84, 1e-6);
	fullTest('l^(1/3)', 'dm', 1, 1e-3);
	fullTest('_e^(30 kJ/mol / (_R * 298 K))', '', 181309.23, 0.1);
	fullTest('8 Mt/yr / (900 kg/m3)', 'kbbl/d', 153.07481, 1e-3);
	fullTest('Da', 'u', 1, 1e-6); // aliases
	fullTest('watt', 'kg*m2/s3', 1, 1e-6); // display names
	fullTest('bitcoin', 'sat', 1e8, 1e-6); // display names
	fullTest('Nm3', 'Ncm', 1, 1e-6);
	fullTest('Mpa*PPM', '', 1, 1e-3); // case-sensitive leniency
	fullTest('{5°C}', 'K', csts.TC0 + 5, 1e-6);
	fullTest('{5 °C}', 'K', csts.TC0 + 5, 1e-6);
	fullTest('{°C*25}', 'K', csts.TC0 + 25, 1e-6); // this isn't even needed, but it works too, lol
	fullTest('{35 °API}', 'kg/l', 0.8498, 1e-3);
	fullTest('1000 kg/m3', '{°API}', 10, 1e-3);
	fullTest('atm * 28 g/mol / _R / {25°C}', '', 1.14447, 1e-4);
	fullTest('{57°F}', '{°C}', 13.8889, 1e-3);
	fullTest('{ln 1000}/{ln 10}', '1', 3, 1e-3);
	fullTest('(27K - 32K) / ( {ln (27K/(32K)) } )', '°C', 29.4292, 1e-3);
});

describe('Full conversion warnings', () => {
	fullTest('mt/ks', '', 1e-3, 1e-6, 'WARN_prefixes');
	fullTest('m3', 'm2', 1, 1e-6, 'WARN_target_dim_mismatch');
	fullTest('6 km', '500 m', 12, 1e-6, 'WARN_targetNumber');
});

describe('Full conversion error', () => {
	fullTestErr('7*', '', 'ERR_operator_misplaced');
	fullTestErr('3^m', '', 'ERR_power_dim');
	fullTestErr('7m + 4s', '', 'ERR_dim_mismatch');
	fullTestErr('{7*3°C}', '', 'ERR_cbrackets_illegal');
	fullTestErr('{25°C * _R}', '', 'ERR_cbrackets_illegal');
	fullTestErr('{3+°C}', 'K', 'ERR_cbrackets_illegal');
	fullTestErr('{3°C}', '{3°C}', 'ERR_cbrackets_illegal');
	fullTestErr('{3C}', '', 'ERR_unknown_unitfun');
	fullTestErr('kJ', '{°C}', 'ERR_cbrackets_dim_mismatch');
	fullTestErr('(-1)^(.5)', '', 'ERR_NaN_result');
	fullTestErr('{ln (-1)}', '', 'ERR_NaN_result');
});
