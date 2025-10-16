import { Q, checkZeros, divide } from './arithmetics.js';
import { convert_parse } from './convert_parse.js';
import { UUCError, err } from './errors.js';
import { processCurly, recursivelyQ, reduceQ } from './reduceQ.js';
import { ExtUnit, type NestedRichArray, type OutputOK, type Result, type Status } from './types.js';
import { balanceBrackets, checkPrefixWarning, dimensionCorrection, vector2text } from './utils.js';

/*
	convert.js
	contains the convert object constructor
	which does all of the heavy lifting except for parsing input strings (see convert_parse.js)

	an expression can be represented by four kinds of data type:
		1. text representation that is parsed from input and then recreated in the end
		2. detailed nested object - an array with numbers, operators, Unit() instances and arrays for bracket expressions
		3. nested Q object - where all numbers and units were converted into Q() instances
		4. single Q() instance - enumerated expression with numeric value and dimension
*/

/**
 * THE MAIN FUNCTION - does a full conversion between input string and target string and return an output object.
 */
export function convert(input: string, target: string): Result {
	let status: Status = 0;
	let messages: UUCError[] = [];
	// warn downgrades status to 1 and adds a message
	const warn = (e: UUCError) => {
		status = status < 1 ? 1 : status;
		messages.push(e);
	};

	try {
		const output = convertInner(input, target);
		return { status, messages, output };
	} catch (e: unknown) {
		// downgrade status to 2 and only this one error message will be shown
		status = 2;
		messages = [e instanceof UUCError ? e : new UUCError('ERR_unexpected', String(e))];
		return { status, messages, output: null };
	}

	// Inner function that does most of the work, and may throw exceptions.
	function convertInner(inputInner: string, targetInner: string = ''): OutputOK {
		const isTarget = targetInner.length > 0;
		const inputClean = balanceBrackets(inputInner);
		const targetClean = balanceBrackets(targetInner);

		// parse input & target strings into detailed nested objects, see convert_parse.js
		const iNestedRich = convert_parse(inputClean);
		const tNestedRich = convert_parse(targetClean);

		recursivelyCheckPrefixes(iNestedRich);

		const iNestedQ = recursivelyQ(iNestedRich, true); // transform detailed nested object to nested Q object
		const iQ = reduceQ(iNestedQ); // reduce nested Q object to single Q

		// Check whether curly is used in target (appropriately!)
		const isTargetCurly = isTarget && Array.isArray(tNestedRich[0]) && tNestedRich[0][0] === '{}';
		// Then proces {target} and bypass everything else; the functionality is very specific and intentionally limited
		if (isTargetCurly) {
			return processTargetCurly(iQ, tNestedRich);
		}

		checkTargetNumbers(tNestedRich);
		const tNestedQ = recursivelyQ(tNestedRich);
		const tQ = reduceQ(tNestedQ);

		// then the conversion itself is pretty simple!
		const num = iQ.n / tQ.n;
		if (isNaN(num)) {
			throw err('ERR_NaN_result');
		}
		let dim = isTarget ? targetClean : vector2text(iQ.v); // if no target, then SI representation

		const dimCheck = dimensionCorrection(iQ.v, tQ.v);
		if (!dimCheck.ok) {
			warn(err('WARN_target_dim_mismatch', dimCheck.faults));
			dim += '*' + vector2text(dimCheck.corr);
		}

		return { num, dim };
	}

	// process {target} detailed object - bypasses the rest of convert, because the functionality is very specific and intentionally limited
	function processTargetCurly(iQ: Q, arr: NestedRichArray) {
		const [x, unitfun] = processCurly(arr[0] as NestedRichArray, true);
		if (x !== 0) {
			// no number in {target}
			throw err('ERR_cbrackets_illegal');
		}

		// dimension mismatch is error, unlike regular conversion where it is just a warning
		if (!checkZeros(divide(new Q(1, unitfun.v), new Q(1, iQ.v)).v)) {
			throw err('ERR_cbrackets_dim_mismatch', unitfun.id);
		}

		const y = unitfun.fi(iQ.n); // from SI (rationalized reduced input) to inverse unitfun result
		return { num: y, dim: unitfun.id };
	}

	function recursivelyCheckPrefixes(arr: NestedRichArray) {
		for (const o of arr) {
			if (o instanceof ExtUnit && typeof o.pref === 'object') {
				const warning = checkPrefixWarning(o.pref, o.unit);
				if (warning) warn(warning);
			} else if (Array.isArray(o)) {
				recursivelyCheckPrefixes(o);
			}
		}
	}

	// Check a detailed nested object for numbers (only shallow crawl), give a warning if number
	function checkTargetNumbers(arr: NestedRichArray) {
		// a single number is probably intentional, so don't emit warning
		if (arr.length <= 1) return;
		for (const o of arr) {
			if (typeof o === 'number' && o !== 1) {
				return warn(err('WARN_targetNumber'));
			}
		}
	}
}

// Parse one string to a Q instance, and if it was a single unit, its id (useful for filtering units in reference)
export const parseQ = (text: string): { q: Q | null; id?: string } => {
	try {
		let id: string | undefined;
		const nestedRich = convert_parse(text);
		// expression consists of single unit - save the id!
		if (nestedRich.length === 1 && nestedRich[0] instanceof ExtUnit) {
			id = nestedRich[0].unit.id;
		}
		const nestedQ = recursivelyQ(nestedRich, true);
		const q = reduceQ(nestedQ);

		return { q, id };
	} catch {
		return { q: null };
	}
};
