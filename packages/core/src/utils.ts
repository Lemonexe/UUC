import { cfg } from './config.js';
import { basicUnits, csts, currencies, units } from './data.js';
import { type UUCError, err } from './errors.js';
import type { FormatParams, OutputOK, Prefix, Unit, V } from './types.js';

export const populateCurrencies = (currenciesResponse: Record<string, number>) => {
	if (!currenciesResponse.hasOwnProperty('USD')) throw new Error('No USD in currency response');
	// because default base may be other currency, e.g. EUR, while UUC is USD-centric, so normalize all to USD
	const USDk = currenciesResponse['USD'];

	for (const c of currencies) {
		if (!currenciesResponse.hasOwnProperty(c.id)) continue;
		const k = USDk / currenciesResponse[c.id];
		const v: V = [0, 0, 0, 0, 0, 0, 0, 1];
		const newCurrUnit = { prefix: '+' as const, ...c, k, v };
		units.push(newCurrUnit);
	}

	// special value for sat
	const bitcoinUnit = units.find((item) => item.id === 'BTC');
	const satoshiUnit = currencies.find((item) => item.id === 'SAT');
	bitcoinUnit && units.push({ ...bitcoinUnit, ...satoshiUnit, k: bitcoinUnit.k * csts.sat2btc });
};

// Beautify the input string by balancing brackets.
// Not as thorough as syntaxCheck in convert_parse.
export const balanceBrackets = (text: string): string => {
	text = text.trim();
	const opening = text.split('(').length - 1;
	const closing = text.split(')').length - 1;
	return opening > closing ? text + ')'.repeat(opening - closing) : text;
};

// format 'output' object as {num: number, dim: string} into the same object but with properly formatted number string 'num2'
export const format = (output: OutputOK | null, params: FormatParams): OutputOK | null => {
	if (output === null) return null;

	// When dim starts with a number, insert an asterisk, otherwise the numbers would be printed side by side
	const dim = output.dim.search(/^\d/) > -1 ? ' * ' + output.dim : output.dim;
	const rawNum = Number(output.num); // if formatted already, reparse to number

	if (params.exp) {
		let d: number | undefined;
		params.spec === 'fixed' && (d = params.fixed || 0);
		params.spec === 'digits' && (d = params.digits - 1);
		const num = rawNum.toExponential(d);
		return { num, dim };
	}
	if (params.spec === 'fixed') {
		const df = params.fixed;
		const num = rawNum.toFixed(df || 0);
		return { num, dim };
	}
	if (params.spec === 'digits') {
		const dp = params.digits;
		const dn = Math.floor(Math.log10(rawNum)) + 1; // natural digits of the number. If greater than params.digits, don't use toPrecision, but round up manually to avoid exponential
		const num =
			dn > dp ? (Math.round(rawNum / 10 ** (dn - dp)) * 10 ** (dn - dp)).toFixed(0) : rawNum.toPrecision(dp);
		return { num, dim };
	}
	const num = String(rawNum);
	return { num, dim };
};

/**
 * Converts unit vector 'v' into its text representation, which is parsable again as an input expression.
 * @param v vector to convert
 */
export const vector2text = (v: V): string => {
	let text = '1'; // expression will start 1*m or 1/m

	// Foreach dimension of the vector, check if it's represented at all (nonzero).
	// If it is, find the corresponding basic unit and add its id.
	// Add power if it isn't 1, and precede it by * or /
	for (let i = 0; i < v.length; i++) {
		if (v[i] === 0) continue;
		const basic = basicUnits.find((item) => item.v[i] === 1)!; // guaranteed to be found, only 8 dimensions

		text += v[i] > 0 ? '*' : '/';
		text += basic.id;
		if (Math.abs(v[i]) === 1) continue;
		if (v[i] > 0) text += v[i];
		else if (v[i] < 0) text += -v[i];
	}
	return text.replace(/^1\*/, ''); // remove leading 1*, we need only leading 1/
};

type GetDimensionCorrectionResult = {
	ok: boolean;
	// Correction vector - power of basic units that have to be added to source in order to match target
	corr: V;
	// Ids of basic units for the dimensions that don't fit.
	faults: string[];
};

// Compare the vector of input and target. If not same, returns the missing basic units ids and the correction vector.
export const dimensionCorrection = (source: V, target: V): GetDimensionCorrectionResult => {
	let ok = true;
	const corr = new Array(8).fill(0) as V;
	const faults: string[] = [];

	// foreach dimension check if it is equal. If it isn't, it's not OK, so enumerate correction and add a fault
	for (let i = 0; i < corr.length; i++) {
		if (Math.abs(source[i] - target[i]) > cfg.dimTolerance) {
			corr[i] = source[i] - target[i];
			const basic = basicUnits.find((item) => item.v[i] === 1)!; // guaranteed to be found, only 8 dimensions
			faults.push(basic.id);
			ok = false;
		}
	}
	return { ok, corr, faults };
};

// Create error object if prefix and unit are not appropriately used, returns undefined if OK
export const checkPrefixWarning = (pref: Prefix, unit: Unit): UUCError | undefined => {
	// find all possible mismatch situations and fill the appropriate word for warning
	let kind: '+' | '-' | 'none' | undefined;
	(!unit.prefix || unit.prefix === 'none') && (kind = 'none');
	unit.prefix === '+' && pref.e < 0 && (kind = '+');
	unit.prefix === '-' && pref.e > 0 && (kind = '-');

	if (kind === undefined) return;
	return err('WARN_prefixes', unit, kind, pref);
};
