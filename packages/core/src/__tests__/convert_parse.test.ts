import { describe, expect, it } from 'vitest';
import { convert_parse } from '../convert_parse.js';
import { expectToBeErrorCode } from './test_utils.js';

// TODO convert_parse happy path tests with proper return value checks
describe(convert_parse.name, () => {
	it('simple cases', () => {
		expect(convert_parse('(2+(1+1))')).toBeTruthy();
	});

	it('errors', () => {
		expectToBeErrorCode(() => convert_parse('3*(4*5)*2)'), 'ERR_brackets_missing');
		expectToBeErrorCode(() => convert_parse('2 * / 3'), 'ERR_operators');
		expectToBeErrorCode(() => convert_parse('2//4'), 'ERR_operators');
		expectToBeErrorCode(() => convert_parse('4*()*5'), 'ERR_brackets_empty');
		expectToBeErrorCode(() => convert_parse('1e999'), 'ERR_NaN');
		expectToBeErrorCode(() => convert_parse('m..'), 'ERR_unitPower');
		expectToBeErrorCode(() => convert_parse('kPaa'), 'ERR_unknownUnit');
		expectToBeErrorCode(() => convert_parse('3#4~5'), 'ERR_special_chars');
		expectToBeErrorCode(() => convert_parse('{3°C'), 'ERR_cbrackets_missing');
		expectToBeErrorCode(() => convert_parse('(2+{1+1)}'), 'ERR_brackets_mismatch');
	});
});
