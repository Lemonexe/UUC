export type Lang = 'en' | 'cz';

// Translated strings where `key` is language code ('en, 'cz') and value is the translated string
export type Translation = Record<Lang, string>;

// V represents the vector of powers of basic units to form a particular dimension of physical quantity.
// For example Newton unit in SI is kg*m/s^2, therefore v = [1,1,-2,0,0,0,0]
// [m, kg, s, A, K, mol, cd, $]
// prettier-ignore
export type V = [number,number,number,number,number,number,number,number];

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
	SI: boolean;
	// Whether it's basic SI unit or derived SI. Basic SI units are of utmost importance to the code, don't ever change them!
	basic: boolean;
	// A note that conveys anything important beyond description - what is noteworthy or weird about this unit or its usage.
	note: Translation;
	// For a unit, it means: all prefixes allowed / only bigger than one allowed / lesser than one / prefixes disallowed. It's not really a restriction, just a recommendation.
	prefix?: 'all' | '+' | '-' | 'none';
	// Whether it is a universal/conventional constant rather than a unit. If true, then attributes SI, basic and prefix are ignored. Prefix is disallowed.
	constant?: true;
};

// Template for currency units, where `k` and `v` will be filled later.
// `v` is always the same = [0,0,0,0,0,0,0,1]
// `k` the currency conversion ratio to dollar, it is initially unknown and will be obtained by currencies.php from API.
export type CurrencyTemplate = Pick<Unit, 'id' | 'name' | 'alias' | 'prefix'>;

// Irregular units that have a conversion function instead of mere ratio.
// ID must link to an existing unit
export type Unitfun = Pick<Unit, 'id' | 'v'> & {
	// conversion from the unit to its SI counterpart (with the `v` dimension)
	f: (UF: number) => number;
	// inverse function, i.e. conversion from SI (with the `v` dimension) to the unit
	fi: (SI: number) => number;
};

// SI prefixes, e.g. kilo, milli etc.
export type Prefix = {
	id: string;
	e: number; // power of ten
};

export type Config = {
	lang: Lang; // language code setting for messages and unit names
};
