import { describe, expect, it } from 'vitest';
import { setUUCLang } from '../config.js';
import { convert } from '../convert.js';
import { csts } from '../data.js';
import { populateCurrencies } from '../utils.js';
import { isEqApx } from './test_utils.js';
import type { ErrorCode } from '../errors.js';
import type { Result } from '../types.js';

setUUCLang('en');

// It expects a full conversion result with 'input' & 'target' strings, expected result number, numerical tolerance and optionally the expected warning.
const fullTest = (input: string, target: string, expectNum: number, tol: number, expectWarn?: ErrorCode) =>
	it(`'${input}' → '${target}' ≅ ${String(expectNum)} ${expectWarn ? `(with ${expectWarn})` : ''}`, () => {
		const res: Result = convert(input, target);
		const { status } = res;
		// fullTest means it should pass without any UUCError, so rethrow
		if (status === 2) {
			throw res.messages[0];
		}

		if (expectWarn !== undefined) {
			expect(status).toBe(1);
			expect(res.messages.length).toBeGreaterThan(0);
			expect(res.messages[0].code).toBe(expectWarn);
		} else {
			expect(status).toBe(0);
			expect(res.messages).toEqual([]);
		}

		expect(isEqApx(Number(res.output.num), expectNum, tol)).toBe(true);
	});

// It expects a full conversion result with 'input' & 'target' strings and expected error.
const fullTestErr = (input: string, target: string, code: ErrorCode) =>
	it(`'${input}' → '${target}' with ${code}`, () => {
		const res: Result = convert(input, target);
		const { status } = res;
		expect(status).toBe(2);
		expect(res.messages.length).toBeGreaterThan(0);
		expect(res.messages[0].code).toBe(code);
	});

describe('Full conversion', () => {
	fullTest('min', '', 60, 1e-6);
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
	fullTest('Nm3', 'Ncm', 1, 1e-6); // aliases
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

describe('Full conversion with currencies', () => {
	const apiResponse = { USD: 1.5, EUR: 1, CZK: 26, BTC: 21e-6 };
	populateCurrencies(apiResponse);
	fullTest('bitcoin', 'sat', 1e8, 1e-6); // with display names
	fullTest('$', '€', 1 / 1.5, 1e-6);
	fullTest('Kč/kg', '$/t', (1.5 / 26) * 1000, 1e-3);
	fullTest('btc', 'eur', 1e6 / 21, 1e-3);
});
