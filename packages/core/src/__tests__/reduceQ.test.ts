import { describe, expect, it } from 'vitest';
import { setUUCLang } from '../config.js';
import { prefixes, units } from '../data.js';
import { recursivelyQ, reduceQ } from '../reduceQ.js';
import { ExtUnit, Q } from '../types.js';
import { fixtures } from './fixtures.js';
import { expectToBeErrorCode, isEqApx } from './test_utils.js';

setUUCLang('en');

const degC = units.find(({ id }) => id === '°C')!;
const milli = prefixes.find(({ id }) => id === 'm')!;

describe(recursivelyQ.name, () => {
	fixtures.forEach((f) => {
		it(f.it, () => {
			expect(recursivelyQ(f.arrRich, true)).toEqual(f.arrQ);
		});
	});

	// prettier-ignore
	it('error cases', () => {
		expectToBeErrorCode(() => recursivelyQ([['{}',25,'*',new ExtUnit(1,degC,1)]]), 'ERR_cbrackets_illegal');
		expectToBeErrorCode(() => recursivelyQ([['{}',new ExtUnit(1,degC,9.99)]], true), 'ERR_cbrackets_illegal');
		expectToBeErrorCode(() => recursivelyQ([['{}',new ExtUnit(1,degC,1),'*',new ExtUnit(1,degC,1)]], true), 'ERR_cbrackets_illegal');
		expectToBeErrorCode(() => recursivelyQ([['{}',[1],'*',[1],'*',new ExtUnit(1,degC,1)]], true), 'ERR_cbrackets_illegal');
		expectToBeErrorCode(() => recursivelyQ([['{}',25,'+',new ExtUnit(1,degC,1)]]), 'ERR_cbrackets_illegal');
		expectToBeErrorCode(() => recursivelyQ([['{}',25,'-',new ExtUnit(1,degC,1)]]), 'ERR_cbrackets_illegal');
		expectToBeErrorCode(() => recursivelyQ([['{}',25,'/',new ExtUnit(1,degC,1)]]), 'ERR_cbrackets_illegal');
		expectToBeErrorCode(() => recursivelyQ([['{}',25,'^',new ExtUnit(1,degC,1)]]), 'ERR_cbrackets_illegal');

		expectToBeErrorCode(() => recursivelyQ([['{}',25,'*',new ExtUnit(milli,degC,1)]], true), 'ERR_curly_prefix');
		expectToBeErrorCode(() => recursivelyQ([['{}',[new ExtUnit(1,degC,1)],new ExtUnit(1,degC,1)]], true), 'ERR_cbrackets_dim_mismatch');
	});
});

describe(reduceQ.name, () => {
	fixtures.forEach((f) => {
		it(f.it, () => {
			const q = reduceQ(f.arrQ);
			expect(isEqApx(q.n, f.Q.n, 1e-6)).toBe(true);
			expect(q.v).toEqual(f.Q.v);
		});
	});

	it('error cases', () => {
		expectToBeErrorCode(() => reduceQ(['+', new Q(3)]), 'ERR_operator_misplaced');
		expectToBeErrorCode(() => reduceQ([new Q(3), new Q(3)]), 'ERR_operator_misplaced');
	});
});
