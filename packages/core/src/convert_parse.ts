import { cfg } from './config.js';
import { prefixes, units } from './data.js';

/*
	convert_parse.js
	contains the convert parse function
	which will parse an input string into a detailed nested structure with numbers, units and operators (always returns array)
*/


// enter the Convert object as reference
export function Convert_parse(convert, text) {
	const lang = cfg.lang
	// create auxiliary database that maps each id and alias to the original unit object
	const UnitIdMap = units.map((item) => ({ id: item.id, ref: item })); // first just map the main ids
	units.forEach((o) => o.alias && o.alias.forEach((a) => UnitIdMap.push({ id: a, ref: o }))); // and push all aliases
	if (lang !== undefined) {
		units.forEach((o) => UnitIdMap.push({ id: o.name[lang], ref: o })); // and push all names in given language
	}

	const idsOC = UnitIdMap.map((item) => item.id); // map of unit ids in original case
	const idsLC = idsOC.map((item) => item.toLowerCase()); // in lowercase
	const prefs = prefixes.map((item) => item.id); // map of prefixes
	text = syntaxCheck(text);
	return crawl(text);

	// rationalize the input string
	function syntaxCheck(text) {
		text === '' && (text = '1');
		text = text
			.replace('·', '*') // process cdots
			.replace(/,/g, '.') // decimal commas to points
			.replace(/²/g, '^2') // hardcoded support for unicode superscript 2 and 3, because they are commonly used
			.replace(/³/g, '^3');

		// check bracket balance and add missing closing ) brackets
		const count = (char) => text.split(char).length - 1;
		const opening = count('('),
			closing = count(')'),
			copening = count('{'),
			cclosing = count('}'); // c for curly
		if (closing > opening) {
			throw convert.msgDB['ERR_brackets_missing'](closing - opening);
		}
		if (cclosing !== copening) {
			throw convert.msgDB['ERR_cbrackets_missing'];
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
			throw convert.msgDB['ERR_operators'](m[0]);
		}

		if (text.search(/[#~]/) > -1) {
			throw convert.msgDB['ERR_special_chars'];
		}

		return text;
	}

	// recursively crawl to divide current text into a field of members, including subsections for bracket expressions ()
	function crawl(text) {
		let field = [];
		// all brackets ( and )
		let c = 0; // cursor
		let c0 = 0; // cursor bookmark
		let lvl = 0; // current bracket lvl
		let IACB = false; // Is After a Closing Bracket (a simple, dirty bugfix)

		// only the highest bracket will be processed in this run. That's why we only check for lvl 1
		for (c = 0; c < text.length; c++) {
			// opening bracket
			if (text[c] === '(' || text[c] === '{') {
				lvl++;
				// the preceeding text will be further processed by split and added as section
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
						throw convert.msgDB['ERR_brackets_empty'];
					}
					if ((text[c] === ')' && text[c0] === '{') || (text[c] === '}' && text[c0] === '(')) {
						throw convert.msgDB['ERR_brackets_mismatch'](text[c0], text[c]);
					}

					const res = crawl(text.slice(c0 + 1, c)); // recursively crawl again to gain another [] array
					if (text[c] === '}') {
						res.unshift('{}');
					} // mark crawled array with '{}' marker
					field.push(res);

					c0 = c + 1;
					IACB = true;
				}
			}
		}
		// the rest of the text
		c > c0 && (field = field.concat(split(text.slice(c0, c), IACB)));
		return field;
	}

	// split section text sections by * / ^ + -, but include those operators
	// while doing that, also process numbers, units and operators
	function split(text, IACB) {
		// IACB see crawl function definition
		const arr = protectNumbers(text, IACB)
			.split(/([\^*/+\-])/)
			.filter((o) => o.length > 0)
			.map((o) => unprotectNumbers(o));

		// text is now split into array of strings, iterate through it and parse them
		const arr2 = [];
		arr.forEach(function (o) {
			// try if it's a number
			let num = Number(o);
			if (!isNaN(num) && isFinite(num)) {
				arr2.push(num);
				return;
			}

			// if it's an operator, let it be
			if (o.match(/^[\^*/+\-]$/)) {
				arr2.push(o);
				return;
			}

			// else we'll assume it's a unit
			else {
				// identify number that is right before the unit (without space or *)
				let firstNum = o.match(/^[+\-]?[\d\.]+(?:e[+\-]?\d+)?/);
				if (firstNum) {
					firstNum = firstNum[0];
					o = o.slice(firstNum.length); // strip number from the unit
					num = Number(firstNum);
					if (isNaN(num) || !isFinite(num)) {
						throw convert.msgDB['ERR_NaN'](firstNum);
					} // this could occur with extremely large numbers (1e309)
					// if you have number and unit tightly together, they should have the same power; we achieve that by wrapping them in brackets array
					arr2.push([Number(num), '*', parsePrefixUnitPower(o)]);
					return;
				}
				// identification of the unit itself and its power
				arr2.push(parsePrefixUnitPower(o));
			}
		});
		return arr2;
	}

	// because + - are operators, first find all numbers and replace their + - with provisional # ~ to protect them from splitting
	function protectNumbers(text, IACB) {
		// IACB see crawl function definition
		// first number in text section (beginning of whole input or beginning of brackets) can also have + - before it
		// but NOT in a text section after closing brackets!
		let firstNum = text.match(/^[+\-]?[\d\.]+(?:e[+\-]?\d+)?/);
		if (firstNum && !IACB) {
			firstNum = firstNum[0];
			text = text.replace(firstNum, firstNum.replace(/\-/g, '~').replace(/\+/g, '#'));
		}
		// match + - in all number exponents
		const m = text.match(/[\d\.]+(?:e[+\-]?\d+)?/g);
		m && m.forEach((m) => (text = text.replace(m, m.replace(/\-/g, '~').replace(/\+/g, '#'))));
		return text;
	}
	function unprotectNumbers(text) {
		return text.replace(/\~/g, '-').replace(/\#/g, '+');
	}

	// parse a unit string or throw an error. It may have a prefix at beginning, and a power number at the end (without ^, otherwise it would have been split away already)
	function parsePrefixUnitPower(text) {
		let pow = 1,
			u = null; // unit power, the unit object

		// try to find simply as {prefix + unit}
		u = parsePrefixUnit(text, pow);
		if (u) {
			return u;
		}

		// not found - try to find as {prefix + unit + power}
		const powIndex = text.search(/[\.\d]+$/);
		if (powIndex > -1) {
			pow = Number(text.slice(powIndex));
			if (isNaN(pow) || !isFinite(pow)) {
				throw convert.msgDB['ERR_unitPower'](text);
			}
			text = text.slice(0, powIndex); // strip number from the unit
		}

		u = parsePrefixUnit(text, pow);

		// not found either, now try something else: case insensitive
		if (!u) {
			u = parsePrefixUnit(text, pow, true);
		} // note: at this point, pow could have been found, or it has defaulted to 1
		if (!u) {
			throw convert.msgDB['ERR_unknownUnit'](text);
		} // the unit is unknown
		return u;
	}

	// parse a unit string. It may have a prefix it the beginning
	function parsePrefixUnit(text, pow, insensitive) {
		// first we try to find the unit in ids
		let text2 = insensitive ? text.toLowerCase() : text;
		let ids = insensitive ? idsLC : idsOC;
		let i = ids.indexOf(text2);
		let j = -1;
		// not found? There might be a prefix. First letter is stripped and we search for units without it. We also search the prefixes for the first letter
		if (i === -1) {
			i = ids.indexOf(text2.slice(1));
			j = prefs.indexOf(text[0]); // even if in insensitive mode, look for prefix in original string (mili vs Mega)

			// if we find both, we add the unit with its prefix and check whether it is appropriately used. If we didn't find i or j, return nothing
			if (i === -1 || j === -1) {
				return null;
			}
			convert.checkPrefix(prefixes[j], UnitIdMap[i].ref);
			return new convert.Unit(prefixes[j], UnitIdMap[i].ref, pow);
		}
		// unit was identified as is, and will be added with prefix equal to 1
		return new convert.Unit(1, UnitIdMap[i].ref, pow);
	}
}
