/*
	convert_parse.js
	contains the convert parse function
	which will parse an input string into a detailed nested structure with numbers, units and operators
*/

//enter the Convert object as reference
function Convert_parse(convert, text) {
	const ids = Units.map(item => item.id);
	const prefs = Prefixes.map(item => item.id);
	text = syntaxCheck(text);
	return crawl(text);

	//rationalize the input string
	function syntaxCheck(text) {
		(text === '') && (text = '1');
		text = text.replace(/,/g , '.');

		//check bracket balance and add missing ones
		const opening = text.split('(').length - 1;
		const closing = text.split(')').length - 1;
		if(closing > opening) {throw convert.msgDB['ERR_brackets_missing'](closing-opening);}
		text += ')'.repeat(opening-closing);

		//check validity of operators and clean up
		text = text.replace(/ +/g, ' ') //reduce cumulated spaces
			.replace(/ ?([\^*/+\-()]+) ?/g, '$1') //trim operators
			.replace(/ /g, '*'); //the leftover spaces are truly multiplying signs

		const m = text.match(/[\^*/+\-]{2,}/);
		if(m) {throw convert.msgDB['ERR_operators'](m[0]);}

		if(text.search(/[#~]/) > -1) {throw convert.msgDB['ERR_special_chars'];}

		return text;
	}

	//recursively crawl to divide current text into a field of members, including subsections for bracket expressions ()
	function crawl(text) {
		let field = [];
		//all brackets ( and )
		let c = 0; //cursor
		let c0 = 0; //cursor bookmark
		let lvl = 0; //current bracket lvl
		let IACB = false; //Is After a Closing Bracket (a simple, dirty bugfix)

		//only the highest bracket will be processed in this run. That's why we only check for lvl 1
		for(c = 0; c < text.length; c++) {
			//opening bracket
			if(text[c] === '(') {
				lvl++;
				//the preceeding text will be further processed by split and added as section
				if(lvl === 1) {
					c > c0 && (field = field.concat(split(text.slice(c0, c), IACB)));
					c0 = c;
					IACB = false;
				}
			}
			//closing bracket
			else if(text[c] === ')') {
				lvl--;
				//the text between the highest brackets will be crawled again
				if(lvl === 0) {
					if(c-c0-1 === 0) {throw convert.msgDB['ERR_brackets_empty'];}
					field.push(crawl(text.slice(c0+1, c)));
					c0 = c+1;
					IACB = true;
				}
			}
		}
		//the rest of the text
		c > c0 && (field = field.concat(split(text.slice(c0, c), IACB)));
		return field;
	}

	//split section text sections by * / ^ + -, but include those operators, and process operators
	//IACB = whether text section Is After a Closing Bracket
	function split(text, IACB) {
		const arr = protectNumbers(text, IACB)
			.split(/([\^*/+\-])/)
			.filter(o => o.length > 0)
			.map(o => unprotectNumbers(o));

		const arr2 = [];
		arr.forEach(function(o) {
			//try if it's a number
			let num = Number(o);
			if(!isNaN(num) && isFinite(num)) {arr2.push(num); return;}

			//if it's an operator, let it be
			if(o.match(/^[\^*/+\-]$/)) {arr2.push(o); return;}

			//else we'll assume it's a unit
			else {
				//identify number that is right before the unit (without space or *)
				let firstNum = o.match(/^[+\-]?[\d\.]+(?:e[+\-]?\d+)?/);
				if(firstNum) {
					firstNum = firstNum[0];
					o = o.slice(firstNum.length); //strip number from the unit
					num = Number(firstNum);
					if(isNaN(num) || !isFinite(num)) {throw convert.msgDB['ERR_NaN'](firstNum);} //this could occur with extremely large numbers (1e309)
					arr2.push(Number(num)); arr2.push('*');
				}
				//identification of the unit itself and its power
				arr2.push(parseUnit(o));
			}
		});
		return arr2;
	}

	//because + - are operators, first find all numbers and replace their + - with provisional # ~ to protect them from splitting
	//IACB = whether text section Is After a Closing Bracket
	function protectNumbers(text, IACB) {
		//first number in text section (beginning of whole input or beginning of brackets) can also have + - before it
		//but NOT in a text section after closing brackets!
		let firstNum = text.match(/^[+\-]?[\d\.]+(?:e[+\-]?\d+)?/);
		if(firstNum && !IACB) {
			firstNum = firstNum[0];
			text = text.replace(firstNum, firstNum.replace(/\-/g, '~').replace(/\+/g, '#'));
		}
		//match + - in all number exponents
		const m = text.match(/[\d\.]+(?:e[+\-]?\d+)?/g);
		m && m.forEach(m => text = text.replace(m, m.replace(/\-/g, '~').replace(/\+/g, '#')))
		return text;
	}
	function unprotectNumbers(text) {return text.replace(/\~/g, '-').replace(/\#/g, '+');}

	//parse a unit
	function parseUnit(text) {
		let pow = 1; //unit power

		//number after the unit as a power without ^
		const powIndex = text.search(/[\.\d]+$/);
		if(powIndex > -1) {
			pow = Number(text.slice(powIndex));
			if(isNaN(pow) || !isFinite(pow)) {throw convert.msgDB['ERR_unitPower'](text);}
			text = text.slice(0, powIndex); //strip number from the unit
		}

		//first we try to find the unit in ids
		let i = ids.indexOf(text);
		let j = -1;
		//not found? There might be a prefix. First letter is stripped and we search for units without it. We also search the prefixes for the first letter
		if(i === -1) {
			i = ids.indexOf(text.slice(1))
			j = prefs.indexOf(text[0]);

			//if we find both, we add the unit with its prefix and check whether it is appropriately used. If we didn't find i or j, the unit is unknown.
			if(i === -1 || j === -1) {throw convert.msgDB['ERR_unknownUnit'](text);}
			convert.checkPrefix(Prefixes[j], Units[i]);
			return new convert.Unit(Prefixes[j], Units[i], pow);
		}
		//unit was identified as is, and will be added with prefix equal to 1
		return new convert.Unit(1, Units[i], pow);
	}
}
