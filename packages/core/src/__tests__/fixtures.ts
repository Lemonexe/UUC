// FIXTURES for atomic function tests (covert_parse, recursivelyQ, reduceQ)
import { prefixes, units } from '../data.js';
import { ExtUnit, type NestedQArray, type NestedRichArray, Q } from '../types.js';

export type Fixture = {
	it: string;
	inputs: string[]; // all raw inputs that should be equivalent to the processed results
	arrRich: NestedRichArray;
	arrQ: NestedQArray;
	Q: Q;
};

const kilo = prefixes.find(({ id }) => id === 'k')!;
const milli = prefixes.find(({ id }) => id === 'm')!;
const degC = units.find(({ id }) => id === '°C')!;
const liter = units.find(({ id }) => id === 'l')!;
const meter = units.find(({ id }) => id === 'm')!;
const hr = units.find(({ id }) => id === 'h')!;
const day = units.find(({ id }) => id === 'd')!;
const e = units.find(({ id }) => id === '_e')!;

export const fixtures: Fixture[] = [
	{ it: 'empty string fallback', inputs: ['', '1'], arrRich: [1], arrQ: [new Q(1)], Q: new Q(1) },
	{
		it: 'a single unit, aliases, display names. case-insensitive',
		inputs: ['ml', 'mlitER', 'mLitRE'],
		arrRich: [new ExtUnit(milli, liter, 1)],
		arrQ: [new Q(1e-6, liter.v)],
		Q: new Q(1e-6, liter.v),
	},
	{
		it: 'a unit with number',
		inputs: ['7 ml', '7 * mliter'],
		arrRich: [7, '*', new ExtUnit(milli, liter, 1)],
		arrQ: [new Q(7), '*', new Q(1e-6, liter.v)],
		Q: new Q(7e-6, liter.v),
	},
	{
		it: 'tolerance for missing closing brackets )',
		inputs: ['3*(4*(5*(2+1)-1)'],
		arrRich: [3, '*', [4, '*', [5, '*', [2, '+', 1], '-', 1]]],
		arrQ: [new Q(3), '*', [new Q(4), '*', [new Q(5), '*', [new Q(2), '+', new Q(1)], '-', new Q(1)]]],
		Q: new Q(168),
	},
	{
		it: 'Unicode power support',
		inputs: ['2²³', '2^2^3'],
		arrRich: [2, '^', 2, '^', 3],
		arrQ: [new Q(2), '^', new Q(2), '^', new Q(3)],
		Q: new Q(64),
	},
	{
		it: 'number tightly with unit shall be wrapped with ()',
		inputs: ['7km / 5m3', '(7 * km) / (5 * m3)'],
		arrRich: [[7, '*', new ExtUnit(kilo, meter, 1)], '/', [5, '*', new ExtUnit(1, meter, 3)]],
		arrQ: [[new Q(7), '*', new Q(1e3, meter.v)], '/', [new Q(5), '*', new Q(1, liter.v)]],
		Q: new Q(1400, [-2, 0, 0, 0, 0, 0, 0, 0]),
	},
	{
		it: 'parsing numerical power',
		inputs: ['_e^(7 d / 72h)'],
		arrRich: [new ExtUnit(1, e, 1), '^', [7, '*', new ExtUnit(1, day, 1), '/', [72, '*', new ExtUnit(1, hr, 1)]]],
		arrQ: [new Q(e.k, e.v), '^', [new Q(7), '*', new Q(86400, day.v), '/', [new Q(72), '*', new Q(3600, hr.v)]]],
		Q: new Q(Math.exp(7 / 3)),
	},
	{
		it: '{}',
		inputs: ['{25 °C}', '{25*°C}'],
		arrRich: [['{}', 25, '*', new ExtUnit(1, degC, 1)]],
		arrQ: [[new Q(298.15, degC.v)]],
		Q: new Q(298.15, degC.v),
	},
];
