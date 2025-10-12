import type { Lang, Prefix, Unit } from './types.js';
import { cfg } from './config.js';

export const errorMessages = {
	// ERRORS 100
	ERR_unexpected: {
		cz: (str: string) => `NEČEKANÁ CHYBA 100: ${str}`,
		en: (str: string) => `UNEXPECTED ERROR 100: ${str}`,
	},
	ERR_brackets_missing: {
		cz: (n: string | number) => `CHYBA 101: Nevyrovnané závorky, ${n} ( chybí`,
		en: (n: string | number) => `ERROR 101: Unbalanced brackets, ${n} ( missing`,
	},
	ERR_operators: {
		cz: (str: string) => `CHYBA 102: Více operátorů vedle sebe "${str}"`,
		en: (str: string) => `ERROR 102: Several operators next to each other "${str}"`,
	},
	ERR_brackets_empty: {
		cz: 'CHYBA 103: Prázdné závorky ()',
		en: 'ERROR 103: Empty brackets ()',
	},
	ERR_NaN: {
		cz: (str: string | number) => `CHYBA 104: Nelze zpracovat číslo "${str}"`,
		en: (str: string | number) => `ERROR 104: Cannot parse number "${str}"`,
	},
	ERR_unitPower: {
		cz: (str: string) => `CHYBA 105: Nelze zpracovat mocninu jednotky "${str}"`,
		en: (str: string) => `ERROR 105: Cannot parse unit power "${str}"`,
	},
	ERR_unknownUnit: {
		cz: (str: string) => `CHYBA 106: Neznámá jednotka "${str}"`,
		en: (str: string) => `ERROR 106: Unknown unit "${str}"`,
	},
	ERR_operator_misplaced: {
		cz: (str: string) => `CHYBA 107: Operátor "${str}" špatně umístěn`,
		en: (str: string) => `ERROR 107: Operator "${str}" misplaced`,
	},
	ERR_power_dim: {
		cz: 'CHYBA 108: Mocninou může být pouze bezrozměrné číslo',
		en: 'ERROR 108: Power has to be a dimensionless number',
	},
	ERR_dim_mismatch: {
		cz: 'CHYBA 109: Nesouhlasí rozměry při sčítání či odčítání',
		en: 'ERROR 109: Dimension mistmatch while addition or subtraction',
	},
	ERR_special_chars: {
		cz: 'CHYBA 110: Speciální rezervované znaky # ~ nelze používat',
		en: 'ERROR 110: Special reserved characters # ~ not allowed',
	},
	ERR_cbrackets_missing: {
		cz: 'CHYBA 111: Nevyrovnané složené závorky',
		en: 'ERROR 111: Unbalanced curly brackets',
	},
	ERR_brackets_mismatch: {
		cz: (open: string, close: string) => `CHYBA 112: Nesouhlasí závorky ${open} a ${close}`,
		en: (open: string, close: string) => `ERROR 112: Mismatched brackets ${open} and ${close}`,
	},
	ERR_cbrackets_illegal: {
		cz: 'CHYBA 113: Nesprávné použití složených závorek {}, viz tutoriál',
		en: 'ERROR 113: Incorrect use of curly brackets {}, see tutorial',
	},
	ERR_unknown_unitfun: {
		cz: (str: string) => `CHYBA 114: Jednotka ${str} nemá k dispozici {} funkci`,
		en: (str: string) => `ERROR 114: Unit ${str} does not have a {} function`,
	},
	ERR_cbrackets_dim_mismatch: {
		cz: (str: string) => `CHYBA 115: Nesouhlasí rozměry vstupu s cílovou jednotkou ${str}`,
		en: (str: string) => `ERROR 115: Dimension mismatch of input with target unit ${str}`,
	},
	ERR_NaN_result: {
		cz: 'CHYBA 116: Zakázaná matematická operace',
		en: 'ERROR 116: Illegal math operation',
	},
	ERR_curly_prefix: {
		cz: 'CHYBA 117: Předpona složených závorkách {}',
		en: 'ERROR 117: Prefix in curly braces {}',
	},

	// WARNINGS 200
	WARN_prefixes: {
		cz: (unit: Unit, kind: '+' | '-' | 'none', pref: Prefix) => {
			const map = { '+': 'zmenšující', '-': 'zvětšující', none: 'žádné' };
			return `VAROVÁNÍ 201: Jednotka ${unit.id} (${unit.name[cfg.lang]}) většinou nemívá ${map[kind]} předpony, avšak nalezeno ${pref.id}`;
		},
		en: (unit: Unit, kind: '+' | '-' | 'none', pref: Prefix) => {
			const map = { '+': 'decreasing', '-': 'increasing', none: 'any' };
			return `WARNING 201: Unit ${unit.id} (${unit.name[cfg.lang]}) doesn\'t usually have ${map[kind]} prefixes, yet ${pref.id} identified`;
		},
	},
	WARN_target_dim_mismatch: {
		cz: (faults: string[]) =>
			`VAROVÁNÍ 202: Rozměry jednotek ze vstupu a cíle nesouhlasí. Tyto základní jednotky byly přidány: ${faults.join(', ')}`,
		en: (faults: string[]) =>
			`WARNING 202: Dimensions of units from input and target don't match. These basic units have been added: ${faults.join(', ')}`,
	},
	WARN_targetNumber: {
		cz: 'VAROVÁNÍ 203: Neočekávané číslo v cílovém poli, ale bude s ním tedy počítáno',
		en: 'WARNING 203: Unexpected number in the target field, but it will included in calculation',
	},
	WARN_separators: {
		cz: 'VAROVÁNÍ 204: Nalezeno příliš mnoho oddělovačů cílových jednotek (>, to nebo into). Pouze první definice cílových jednotek byla akceptována.',
		en: 'WARNING 204: Too many target unit separators have been found (>, to or into). Only the first definiton of target units was accepted.',
	},
	WARN_format_params: {
		cz: 'VAROVÁNÍ 206: Formátovací parametry z adresy nebylo možné přečíst',
		en: 'WARNING 206: Format params from address could not be parsed',
	},

	// What kind of project would it be without an Easter egg?
	ERR_Secret: {
		cz: '🏆 Tajný Error, gratuluju! Čeho tímto vůbec chcete dosáhnout? Inverzní funkce k logaritmu je _e^(číslo)',
		en: '🏆 Secret Error, congratz! What are you even trying to do? Inverse function of logarithm is _e^(number)',
	},
} as const;

export type ErrorCode = keyof typeof errorMessages;

export class UUCError extends Error {
	code: ErrorCode;
	message: string;
	constructor(code: ErrorCode, message: string) {
		super(message);
		this.code = code;
		this.message = message;
		Object.setPrototypeOf(this, UUCError.prototype);
		this.name = this.constructor.name;
	}
}

// Helper to lookup message (string or fn) using ErrorCode and create a new UUCError instance with it.
// TypeScript magic will enforce extra parameters, if the message is a fn.
export const err = <C extends ErrorCode, M extends (typeof errorMessages)[C][Lang]>(
	code: C,
	...args: M extends string ? [] : M extends (...args: any) => any ? Parameters<M> : never
): UUCError => {
	const { lang } = cfg;
	const msg = errorMessages[code][lang];
	if (typeof msg === 'string') {
		return new UUCError(code, msg);
	}

	// @ts-expect-error This is correct, but TS cannot infer it properly
	return new UUCError(code, msg(...args));
};
