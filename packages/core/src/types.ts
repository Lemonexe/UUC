import { langs } from './config.js';
import type { UUCError } from './errors.js';

export type Lang = (typeof langs)[number];

// Translated strings where `key` is language code ('en, 'cz') and value is the translated string
export type Translation = Record<Lang, string>;

// V represents the vector of powers of basic units to form a particular dimension of physical quantity.
// For example Newton unit in SI is kg*m/s^2, therefore v = [1,1,-2,0,0,0,0]
// [m, kg, s, A, K, mol, cd, $]
// prettier-ignore
export type V = [number, number, number, number, number, number, number, number];

// A database entry for one unit of measurement, or a constant.
export type Unit = {
	v: V;
	// A unique id and also the standard notation to write this unit (can be matched).
	id: string;
	// Other ids that reference the unit (can be matched as such)
	alias?: string[];
	// Display names, possibly short descriptions of the unit (can be matched in the specified or default language)
	name: Translation;
	// This coefficient equates value of the unit in basic units. For example minute = 60 seconds, therefore minute has k = 60
	k: number;
	// Merely informational value whether this unit is a part of SI system (either basic or derived)
	SI?: boolean;
	// Whether it's basic SI unit or derived SI. Basic SI units are of utmost importance to the code, don't ever change them!
	basic?: boolean;
	// A note that conveys anything important beyond description - what is noteworthy or weird about this unit or its usage.
	note?: Translation;
	// For a unit, it means: all prefixes allowed / only bigger than one allowed / lesser than one / prefixes disallowed. It's not really a restriction, just a recommendation.
	prefix?: 'all' | '+' | '-' | 'none';
	// Whether it is a universal/conventional constant rather than a unit. If true, then attributes SI, basic and prefix are ignored. Prefix is disallowed.
	constant?: boolean;
	// Whether this unit is only available as unitfun (via {curly braces}) and not as a standalone unit.
	onlyUnitfuns?: boolean;
};

// Template for currency units, where `k` and `v` will be filled later.
// `v` is always the same = [0,0,0,0,0,0,0,1]
// `k` the currency conversion ratio to dollar, it is initially unknown and will be obtained from API.
export type CurrencyTemplate = Pick<Unit, 'id' | 'name' | 'alias' | 'prefix'>;

// Irregular units that have a conversion function instead of mere ratio.
// id must link to an existing unit
export type Unitfun = Pick<Unit, 'id' | 'v'> & {
	// conversion from the unit to its SI counterpart (with the `v` dimension)
	f: (UF: number) => number;
	// inverse function, i.e. conversion from SI (with the `v` dimension) to the unit
	fi: (SI: number) => number;
};

// SI prefixes, e.g. kilo, milli etc.
export type Prefix = {
	id: string;
	// power of ten
	e: number;
};

// Unit possibly extended with an SI prefix and a power
export class ExtUnit {
	constructor(
		public pref: Prefix | 1,
		public unit: Unit,
		public power: number
	) {}
}

export type Operator = '+' | '-' | '*' | '/' | '^' | '{}'; // '{}' is a pseudo-operator marking that the following sequence {was in curly brackets}.

// A physical quantity represented as numerical value 'n' and dimension vector 'v'
export class Q {
	constructor(
		public n: number = 1,
		public v: V = new Array(8).fill(0) as V
	) {}
}

/*
An expression with physical quantities can be represented by four kinds of data type:
1. `string`: raw input/target text that is parsed, as well as final output stringified & formatted
2. `NestedRichArray`: a deep nested array with numbers, operators, `ExtUnit` instances and arrays for bracket expressions
3. `NestedQArray`: a NestedRichArray where all numbers and units were converted into `Q` instances
4. `Q`: the whole expression is reduced into a single `Q` instance (enumerated and with final dimension)
*/

// Nested structure of sequence of numbers, units and operators, where a deeper level means a bracketed section.
export type NestedRichArray = Array<number | ExtUnit | Operator | NestedRichArray>;

// Nested structure of sequence of Q instances and operators, where a deeper level means a bracketed section.
export type NestedQArray = Array<Q | Operator | NestedQArray>;

// Final conversion result
type ResultBase = { messages: UUCError[] };
export type ResultOK = ResultBase & {
	status: 0 | 1; // 0 = OK, 1 = WARNING, 2 = ERROR
	output: {
		// original number with no precision loss
		num: number;
		// formatted number as per formatParams, may be absent if there was no formatting applied
		formattedNum?: string;
		// final printed dimensions as specified from target, or derived from input if no target specified
		dim: string;
	};
};
export type ResultError = ResultBase & {
	status: 2;
	output: null;
};
export type Result = ResultOK | ResultError;
export type Status = Result['status'];
export type OutputOK = ResultOK['output'];

export type FormatParams = {
	exp?: boolean; // whether to use exponential notation
} & (
	| { spec: 'none' } // pass through
	| { spec: 'fixed'; fixed: number } // fixed number of decimal digits
	| { spec: 'digits'; digits: number } // number of significant digits
);
