import { Q, add, checkZeros, divide, multiply, power, subtract } from './arithmetics.js';
import { unitfuns } from './data.js';
import { err } from './errors.js';
import { ExtUnit, type NestedQArray, type NestedSequenceArray, type Operator, type Unitfun } from './types.js';

/**
 * Generic function to process array with curly {}, returns [numerical input, Unitfun object]
 */
export const processCurly = (arr: NestedSequenceArray, isCurlyAllowed = false): [number, Unitfun] => {
	const idsUF = unitfuns.map((uf) => uf.id); // map of Unitfuns id

	// fallback for the case when number is written tightly with unit, such as {3°C} instead of {3 °C}
	// see convert_parse > split (such expressions are artificially wrapped by brackets)
	if (!arr.find((o) => o instanceof ExtUnit && idsUF.includes(o.unit.id))) {
		arr = arr.flat();
	}

	const units = arr.filter((o) => o instanceof ExtUnit); // all Unit objects within {expression}
	const nums = arr.filter((o) => typeof o === 'number'); // all numbers within {expression}
	const arrs = arr.filter((o) => Array.isArray(o)); // all (arrays) within {expression}

	// check appropriate use of {}
	if (!isCurlyAllowed || units.length !== 1 || units[0].power !== 1 || arrs.length > 1) {
		throw err('ERR_cbrackets_illegal');
	}
	const ops = ['+', '-', '/', '^'] as const;
	ops.forEach((op) => {
		if (arr.includes(op)) {
			throw err('ERR_cbrackets_illegal');
		}
	});
	if (units[0].pref !== 1) {
		throw err('ERR_curly_prefix');
	}

	// parse array if necessary, only single dimensionless array is allowed
	if (arrs.length > 0) {
		const res = reduceQ(recursivelyQ(arrs[0]));
		if (!checkZeros(res.v)) {
			throw err('ERR_cbrackets_dim_mismatch', units[0].unit.id);
		}
		nums.push(res.n);
	}
	if (nums.length > 1) {
		throw err('ERR_cbrackets_illegal');
	}

	// numerical x within {}, defaults to 0 if none provided
	// for input there should be 1 num, but 0 is allowed, while for target it must be strictly 0
	const x = nums[0] ?? 0; // note: it even works to use {°C*3} lol

	// find the unitfun and return it
	const i = idsUF.indexOf(units[0].unit.id);
	if (i === -1) {
		throw err('ERR_unknown_unitfun', units[0].unit.id);
	}
	return [x, unitfuns[i]];
};

/**
 * Recursively crawl through detailed nested object: transform units and numbers into Q instances (physical quantity)
 */
export const recursivelyQ = (obj: NestedSequenceArray, isCurlyAllowed = false): NestedQArray => {
	return crawl(obj);

	// crawl converts numbers & [pref, unit, power] objects into new Q() instances
	function crawl(arr: NestedSequenceArray): NestedQArray {
		// in case the array is a {expression}
		if (arr[0] === '{}') {
			const [x, unitfun] = processCurly(arr, isCurlyAllowed);
			const y = unitfun.f(x); // from numerical input within {} to unitfun result
			return [new Q(y, unitfun.v)];
		}

		const arr2: NestedQArray = [];

		// normal array: crawl through it
		for (let i = 0; i < arr.length; i++) {
			const o = arr[i];
			// is a number: make it a simple new Q
			if (typeof o === 'number') {
				arr2.push(new Q(o));
			}
			// is a unit: turn unit into a Q
			else if (o instanceof ExtUnit) {
				const prefNum = typeof o.pref === 'object' ? 10 ** o.pref.e : 1;
				const newQ = new Q(prefNum * o.unit.k, o.unit.v);
				arr2.push(power(newQ, new Q(o.power)));
			}
			// is an array: recursion further
			else if (Array.isArray(o)) {
				arr2.push(crawl(o));
			}
			// else operator ^ * / + - so just add it as it is
			else {
				arr2.push(o);
			}
		}
		return arr2;
	}
};

type SubcrawlCallback = (res: Q, sign: Operator, q: Q) => Q;
type QArray = Array<Q | Operator>;

/**
 * Recursively reduce nested object of Q sequences into the one final Q.
 * Starting from the deepest brackets, it solves them and gradually gets higher.
 */
export const reduceQ = (obj: NestedQArray): Q => {
	return crawl(obj);

	// crawl operates on an array and calculates it into a single Q
	// operator precedence: first get () result, then do ^, then * /, then + - into the final Q
	function crawl(arrNested: NestedQArray): Q {
		// first element of section has to be either Q, or bracket expression array
		if (!(arrNested[0] instanceof Q) && !Array.isArray(arrNested[0])) {
			throw err('ERR_operator_misplaced', arrNested[0]);
		}

		// first enter all bracket expression arrays and get result (recursion) before continuing
		for (let i = 0; i < arrNested.length; i++) {
			const o = arrNested[i];
			if (Array.isArray(o)) {
				arrNested[i] = crawl(o);
			}
		}
		// after this, arrNested is now a flat array of Q and operators
		let arr = arrNested as QArray;

		// then do all powers
		arr = subcrawl(arr, ['^'], (res, _sign, q) => power(res, q));
		// then do all multiplications and divisions
		arr = subcrawl(arr, ['*', '/'], (res, sign, q) => (sign === '*' ? multiply(res, q) : divide(res, q)));

		// finally add and subtract everything into the final Q
		// unlike subcrawl, there is no need for auxiliary array, this for creates the single Q object right away
		if (!(arr[0] instanceof Q)) {
			throw err('ERR_operator_misplaced', arr[0] as string);
		}
		let res: Q = arr[0];
		for (let i = 0; i < arr.length; i += 2) {
			if (arr.hasOwnProperty(i + 1)) {
				const nextQ = arr[i + 2];
				if (arr[i + 1] === '+' && nextQ instanceof Q) {
					res = add(res, nextQ);
				} else if (arr[i + 1] === '-' && nextQ instanceof Q) {
					res = subtract(res, nextQ);
				} else {
					throw err('ERR_operator_misplaced', arr[i + 1] as string);
				}
			}
		}
		return res;
	}

	// subcrawling ^ has similar code as * /, so this "subcrawl" function can do them all with callback
	function subcrawl(arr: QArray, signs: Operator[], callback: SubcrawlCallback): QArray {
		// current result, new reduced array of Q
		let i: number;
		let res: Q | null = null;
		const arr2: QArray = [];
		for (i = 0; i < arr.length; i += 2) {
			if (!arr.hasOwnProperty(i + 1)) {
				break;
			}
			// is it the sign that we'd like to process right now?
			const curr = arr[i];
			const next = arr[i + 1];
			const nnext = arr[i + 2];
			if (typeof next === 'string' && signs.indexOf(next) > -1) {
				if (!(nnext instanceof Q) || !(curr instanceof Q)) {
					throw err('ERR_operator_misplaced', next);
				}
				// initialize res with first number
				if (!res) {
					res = curr;
				}
				// take current res and perform operation (i+1) with number (i+2)
				res = callback(res, next, nnext);
			}
			// else we will stop accumulating res, and push it to arr2 (or the single Q if it was alone)
			else {
				if (res) {
					arr2.push(res);
					arr2.push(next);
					res = null;
				} else {
					arr2.push(curr);
					arr2.push(next);
				}
			}
		}
		// finish up: after second subcrawl, return array of Q + Q - Q
		if (res) {
			arr2.push(res);
		} else {
			arr2.push(arr[i]);
		}
		return arr2;
	}
};
