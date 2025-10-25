import { describe, expect, it } from 'vitest';
import { setUUCLang } from '../config.js';
import { convert_parse } from '../convert_parse.js';
import { fixtures } from './fixtures.js';
import { expectToBeErrorCode } from './test_utils.js';

setUUCLang('en');

describe(convert_parse.name, () => {
	fixtures.forEach((f) => {
		it(f.it, () => {
			f.inputs.forEach((i) => {
				expect(convert_parse(i)).toEqual(f.arrRich);
			});
		});
	});

	it('error cases', () => {
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
