import { cfg } from './config.js';
import { prefixes, units } from './data.js';
import { err } from './errors.js';
import { ExtUnit, type NestedSequenceArray, type Operator, type Unit } from './types.js';

/**
 * This module concerns mainly with the convert_parse function,
 * which parses an input string into a detailed nested structure of bracket sections, where each section is represented
 * by a sequence of numbers, extended unit objects and operators.
 */

// Create a simple junction table that maps all possible matchable strings with the origin Unit reference.
type UnitIdMapItem = { id: string; ref: Unit };
export const getUnitIdMap = (): UnitIdMapItem[] => {
	// Start with the main ids,
	const unitIdMap = units.map((u: Unit) => ({ id: u.id, ref: u }));
	// then push all aliases,
	units.forEach((u) => u.alias && u.alias.forEach((a) => unitIdMap.push({ id: a, ref: u })));
	// and push all names in the given language.
	// This is why it has to be generated on the fly, because language can change during runtime...
	if (cfg.lang !== undefined) {
		units.forEach((u) => unitIdMap.push({ id: u.name[cfg.lang], ref: u }));
	}
	return unitIdMap;
};

export const convert_parse = (text: string) => {
	const unitIdMap = getUnitIdMap();
	const idsOC = unitIdMap.map(({ id }) => id); // map of unit ids in original case
	const idsLC = idsOC.map((id) => id.toLowerCase()); //  map of unit ids in lowercase
	const prefs = prefixes.map(({ id }) => id); // map of prefixes
	text = syntaxCheck(text);
	return crawl(text);

	// rationalize the input string
	function syntaxCheck(text: string): string {
		text === '' && (text = '1');
		text = text
			.replace('·', '*') // process cdots
			.replace(/,/g, '.') // decimal commas to points
			.replace(/²/g, '^2') // hardcoded support for Unicode superscript 2 and 3, because they are commonly used
			.replace(/³/g, '^3');

		// check bracket balance and add missing closing ) brackets
		const count = (char: string) => text.split(char).length - 1;
		const opening = count('(');
		const closing = count(')');
		const openingCurlies = count('{');
		const closingCurlies = count('}');
		if (closing > opening) {
			throw err('ERR_brackets_missing', closing - opening);
		}
		if (closingCurlies !== openingCurlies) {
			throw err('ERR_cbrackets_missing');
		} // unbalanced } are not forgiven!
		text += ')'.repeat(opening - closing);

		// clean up spaces in order to properly parse
		text = text
			.replace(/([(){}])/g, ' $1 ') // pad () and {} to allow expression right next to it
			.trim()
			.replace(/ +/g, ' ') // reduce cumulated spaces
			.replace(/ ?([\^*/+\-]+) ?/g, '$1') // trim operators
			.replace(/([({]+) ?/g, '$1') // right trim (
			.replace(/ ?([)}]+)/g, '$1') // left trim )
			.replace(/ /g, '*'); // the leftover spaces are truly multiplying signs

		// check validity
		const m = text.match(/[\^*/+\-]{2,}/);
		if (m) {
			throw err('ERR_operators', m[0]);
		}

		if (text.search(/[#~]/) > -1) {
			throw err('ERR_special_chars');
		}

		return text;
	}

	// Recursively crawl current text to organize into a nested array of text sections around brackets, and a deeper array of the same kind within the brackets.
	// The text sections around brackets are split right away, see split() function (of course, the text within brackets will be split in the deeper run).
	function crawl(text: string): NestedSequenceArray {
		let field: NestedSequenceArray[] = [];
		let c = 0; // cursor
		let c0 = 0; // cursor bookmark
		let lvl = 0; // current bracket lvl
		let IACB = false; // Is After a Closing Bracket (a simple, dirty bugfix)

		// Only the highest bracket will be processed in this run. That's why we only check for lvl 1. Deeper levels are processed recursively.
		for (c = 0; c < text.length; c++) {
			// opening bracket
			if (text[c] === '(' || text[c] === '{') {
				lvl++;
				// the preceding text will be further processed by split and added as section
				if (lvl === 1) {
					c > c0 && (field = field.concat(split(text.slice(c0, c), IACB)));
					c0 = c;
					IACB = false;
				}
			}
			// closing bracket
			else if (text[c] === ')' || text[c] === '}') {
				lvl--;
				// the text between the highest brackets will be crawled again
				if (lvl === 0) {
					if (c - c0 - 1 === 0) {
						throw err('ERR_brackets_empty');
					}
					if ((text[c] === ')' && text[c0] === '{') || (text[c] === '}' && text[c0] === '(')) {
						throw err('ERR_brackets_mismatch', text[c0], text[c]);
					}

					// recursively crawl again to turn (the inner text section) into another sequence array
					const res = crawl(text.slice(c0 + 1, c));
					// because parentheses get lost in crawl(), mark crawled curly brackets string with a '{}' marker
					if (text[c] === '}') {
						res.unshift('{}');
					}
					field.push(res);

					c0 = c + 1;
					IACB = true;
				}
			}
		}
		// The rest of the text. If no parentheses were found in current text, this is the whole current text input.
		c > c0 && (field = field.concat(split(text.slice(c0, c), IACB)));
		return field;
	}

	// Split a text section by * / ^ + -, and those operators will be included in the split array as well.
	// While doing that, also process numbers, units and operators.
	function split(text: string, IACB: boolean): NestedSequenceArray {
		// Split into array of strings delimited by operators
		const splitArray: string[] = protectNumbers(text, IACB)
			.split(/([\^*/+\-])/) // regex has parentheses to keep the delimiters (operators).
			.filter((o) => o.length > 0)
			.map(unprotectNumbers);

		const arr2: NestedSequenceArray = [];
		// Iterate through each operator-delimited section and parse them
		splitArray.forEach((section) => {
			// try if it's a number
			let num = Number(section);
			if (!isNaN(num) && isFinite(num)) {
				arr2.push(num);
				return;
			}

			// if it's an operator, let it be
			if (section.match(/^[\^*/+\-]$/)) {
				arr2.push(section as Operator);
				return;
			}

			// else we'll assume it's a unit, so let's parse it or throw
			else {
				// identify number that is right before the unit (without space or *)
				const firstNumMatch = section.match(/^[+\-]?[\d\.]+(?:e[+\-]?\d+)?/);
				if (firstNumMatch) {
					const firstNum = firstNumMatch[0];
					section = section.slice(firstNum.length); // strip number from the unit
					num = Number(firstNum);
					if (isNaN(num) || !isFinite(num)) {
						// this could occur with extremely large numbers (1e309)
						throw err('ERR_NaN', num);
					}
					// If we encounter a number and unit tightly together, we should consider them to have the same power (e.g. 3m/2s equivalent to 3*m/2/s).
					// This is achieved simply by artificially wrapping them in a new brackets array.
					arr2.push([Number(num), '*', parsePrefixUnitPower(section)]);
					return;
				}
				// identification of the unit itself and its power
				arr2.push(parsePrefixUnitPower(section));
			}
		});

		return arr2;
	}

	// Because + - are operators, first find all numbers and replace their + - with provisional # ~ to protect them from splitting
	function protectNumbers(text: string, IACB: boolean): string {
		// first number in text section (beginning of whole input or beginning of brackets) can also have + - before it
		// but NOT in a text section after closing brackets!
		const firstNumMatch = text.match(/^[+\-]?[\d\.]+(?:e[+\-]?\d+)?/);
		if (firstNumMatch && !IACB) {
			const firstNum = firstNumMatch[0];
			text = text.replace(firstNum, firstNum.replace(/\-/g, '~').replace(/\+/g, '#'));
		}
		// match + - in all number exponents
		const m = text.match(/[\d\.]+(?:e[+\-]?\d+)?/g);
		m && m.forEach((m) => (text = text.replace(m, m.replace(/\-/g, '~').replace(/\+/g, '#'))));
		return text;
	}
	function unprotectNumbers(text: string): string {
		return text.replace(/\~/g, '-').replace(/\#/g, '+');
	}

	// Parse an extended unit string or throw an error. It may have a prefix at beginning, and a power number at the end (without ^, otherwise it would have been split away already)
	function parsePrefixUnitPower(text: string) {
		let pow = 1; // unit power
		let u = null; // unit object

		// try to find simply as [prefix + unit]
		u = parsePrefixUnit(text, pow, false);
		if (u) return u;

		// not found - try to find as [prefix + unit + power]
		const powIndex = text.search(/[\.\d]+$/);
		if (powIndex > -1) {
			pow = Number(text.slice(powIndex));
			if (isNaN(pow) || !isFinite(pow)) {
				throw err('ERR_unitPower', text);
			}
			text = text.slice(0, powIndex); // strip number from the unit
		}

		u = parsePrefixUnit(text, pow, false);
		if (u) return u;
		// Note that at this point, pow might have been found, but the unit was not matched case-sensitively. Otherwise, pow is still default = 1

		// Not found either, now try something else: case-insensitive
		u = parsePrefixUnit(text, pow, true);
		if (u) return u;

		throw err('ERR_unknownUnit', text);
	}

	// Parse an extended unit string, but without any power (it may only have a prefix it the beginning)
	function parsePrefixUnit(text: string, pow: number, insensitive: boolean) {
		// first we try to find the unit in ids
		let text2 = insensitive ? text.toLowerCase() : text;
		let ids = insensitive ? idsLC : idsOC;
		let i = ids.indexOf(text2);
		// not found? There might be a prefix. First letter is stripped and we search for units without it. We also search the prefixes for the first letter
		if (i === -1) {
			i = ids.indexOf(text2.slice(1));
			const j = prefs.indexOf(text[0]); // even if in insensitive mode, prefix must be always case-sensitive to discriminate milli vs Mega, so use original text

			// if we find both, we add the unit with its prefix and check whether it is appropriately used. If we didn't find i or j, return nothing
			if (i === -1 || j === -1) return null;
			return new ExtUnit(prefixes[j], unitIdMap[i].ref, pow);
		}
		// unit was identified as is, and will be added with prefix equal to 1
		return new ExtUnit(1, unitIdMap[i].ref, pow);
	}
};
