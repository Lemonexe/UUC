/*
	tests.js
	yes, UUC has tests now B-)
	I don't know how to use those big fancy libraries cause I'm just a simple peasant, so I've grown my own code!
*/

function tests(silent) {//optional argument to silence tests that have successfully passed
	let passed = 0; //number of successful tests
	let total  = 0; //number of performed tests

	//assertion of plain equivalence
	const eq = (arg1, arg2, text) => log(arg1 === arg2, arg1, arg2, text);

	//assertion of approximate number equivalence
	const eqApx = (arg1, arg2, tol, text) => log(Math.abs(arg1-arg2) < tol, arg1, arg2, text);

	//assertion of object equivalence
	const eqObj = (arg1, arg2, text) => log(angular.equals(arg1, arg2), JSON.stringify(arg1), JSON.stringify(arg2), text);

	//assertion of expected error number for a callback function f (but is not used for full conversion errors, because they are caught, see fullTestErr)
	function expectErr(f, errNumber, text) {
		text = 'Err'+errNumber+' '+text;
		let pass = false;
		try {f();}
		catch(err) {
			let match = err.match(/[^\d]*(\d+)/); //try to match number of thrown error
			if(match && match[1] === String(errNumber)) {pass = true;}
		}
		log(pass, '', 'error '+errNumber, text);
	}

	//assertion of expected full conversion result with 'input' & 'target' strings, expected result number, numerical tolerance, OPTIONAL expected warn number
	//there are six possible outcomes: we expectWarn or we don't, AND we get ok, warn or err
	//normally only one test is logged. If we expectWarn and we get ok or warn, two tests are logged (eqApx, expectWarn)
	function fullTest(input, target, expectNum, tol, expectWarn) {
		const label = input+' > '+target+': ';
		res = convert.fullConversion(input, target);

		(res.status === 0 || (expectWarn && res.status < 2)) ? eqApx(res.output.num, expectNum, tol, label+'eqApx') : log(false, res.messages[0], expectWarn || 'OK', label+'eqApx');

		if(expectWarn && res.status < 2) {
			const match = res.messages[0].match(/[^\d]*(\d+)/); //try to match number of thrown warning
			const correctWarn = res.status === 1 && match && match[1] === String(expectWarn); //is the correct warning
			const text = 'warn'+expectWarn;
			log(correctWarn, res.messages[0], text, label+text);
		}
	}

	//assertion of expected full conversion error with 'input' string, expected error number and description
	function fullTestErr(input, target, expectErr, text) {
		const label =`Err${expectErr} ${input} > ${target}: `;
		res = convert.fullConversion(input, target);
		const match = res.messages[0].match(/[^\d]*(\d+)/); //try to match number of thrown error
		log(res.status === 2 && match && match[1] === String(expectErr), res.messages[0], 'error '+expectErr, label+text);
	}

	//log the result of an assertion
	function log(pass, actual, expected, text) {
		total++; pass && passed++;
		pass ? !silent && console.log(`PASSED: ${text}`) : console.error(`NOT PASSED: ${text}\nexpected: ${expected}\nactual: ${actual}`);
	}

	//just a pretty console headline
	function headline(str) {!silent && console.log('%c\n'+str, 'font-size: 16px;');}


/*
	HERE COME THE ACTUAL TESTS
*/

headline('Testing tests');
//I'm so sophisticated that even tests are tested
	eqApx(4.789**0.4, 1.8711, 1e-2, 'test(): eqApx');
	eqObj({a: '1', b: [2]}, {a: '1', b: [2]}, 'test(): eqObj');

headline('Arithmetics');
	let q1 = new convert.Q(4,[-1,1,-2,0,0,0,0,0]);
	let q2 = new convert.Q(16,[-2,2,-4,0,0,0,0,0]);
	eqObj(q1, {n: 4, v: [-1,1,-2,0,0,0,0,0]}, 'convert.Q');

	let pow = new convert.Q(2);
	eqObj(convert.power(q1, pow), q2, 'convert.power');

	pow = new convert.Q(2, [1e-10]);
	eqObj(convert.power(q1, pow), q2, 'convert.power: with tolerance');

	pow = new convert.Q(2, [1]);
	expectErr(() => convert.power(q1, pow), 108, 'convert.power: detect dimension error');

	let res = new convert.Q(64,[-3,3,-6,0,0,0,0,0]);
	eqObj(convert.multiply(q1, q2), res, 'convert.multiply');

	res = new convert.Q(0.25,[1,-1,2,0,0,0,0,0]);
	eqObj(convert.divide(q1, q2), res, 'convert.divide');

	q2 = new convert.Q(7,[-1,1,-2,0,0,0,0,0]);

	res = new convert.Q(11,[-1,1,-2,0,0,0,0,0]);
	eqObj(convert.add(q1, q2), res, 'convert.add');

	res = new convert.Q(-3,[-1,1,-2,0,0,0,0,0]);
	eqObj(convert.subtract(q1, q2), res, 'convert.subtract');

	q2 = new convert.Q(7,[1,1,-2,0,0,0,0,0]);
	expectErr(() => convert.subtract(q1, q2), 109, 'convert.add: detect dimension mismatch');

headline('Full conversions');
	fullTest('3*(7-3)*2', '', 24, 1e-6);
	fullTest('(3*(7-3)*2)', '', 24, 1e-6);
	fullTest('3*(4*(5*(2+1)-1)', '', 168, 1e-6); //tolerance for missing closing brackets )
	fullTest('0.5 ((5(6+(8)3)) 2 3', '15', 30, 1e-6); //spaces instead of *
	fullTest('3(4+5)2 / (2*2^3*2) * 7*(2+2*2+2)', '', 94.5, 1e-6); //not even spaces, numbers right on brackets
	fullTest('3m2*(4*5m)*2kPa', 'J', 120000, 1e-6);
	fullTest(' -3.23e+4m2 * (42,77e-2*5m)  *2kPa1.0 ', 'MJ', -138.1471, 1e-2);
	fullTest('3*(4*(5+2', '', 84, 1e-6);
	fullTest('l^(1/3)', 'dm', 1, 1e-3);
	fullTest('_e^(30 kJ/mol / (_R * 298 K))', '', 181309.23, 0.1);
	fullTest('8 Mt/yr / (900 kg/m3)', 'kbbl/d', 153.07481, 1e-3);
	fullTest('Da', 'u', 1, 1e-6);
	fullTest('Nm3', 'Ncm', 1, 1e-6);
	fullTest('Mpa*PPM', '', 1, 1e-3); //case-sensitive leniency
	fullTest('{0°C}', 'K', csts.TC0, 1e-6);
	fullTest('{°C 25}', 'K', 298.15, 1e-6); //this isn't even needed but it works too, lol
	fullTest('{35 °API}', 'kg/l', 0.8498, 1e-3);
	fullTest('1000 kg/m3', '{°API}', 10, 1e-3);
	fullTest('atm * 28 g/mol / _R / {25°C}', '', 1.14447, 1e-4);
	fullTest('{57°F}', '{°C}', 13.8889, 1e-3);
	fullTest('{ln 1000}/{ln 10}', '1', 3, 1e-3);

headline('Full conversion warnings');
	fullTest('mt/ks', '', 1e-3, 1e-6, 201);
	fullTest('m3', 'm2', 1, 1e-6, 202);

headline('Full conversion errors');
	fullTestErr('7*', '', 107, 'misplaced operator');
	fullTestErr('3^m', '', 108, 'non-dimensionless power');
	fullTestErr('7m + 4s', '', 109, 'addition dim mismatch');
	fullTestErr('{7*3°C}', '', 113, 'more numbers in {}');
	fullTestErr('{25°C * _R}', '', 113, 'more units in {}');
	fullTestErr('{3+°C}', 'K', 113, 'forbidden operator {}');
	fullTestErr('{3°C}', '{3°C}', 113, 'number in target {}');
	fullTestErr('{3C}', '', 114, 'unsupported Unitfun');
	fullTestErr('kJ', '{°C}', 115, 'target {} dim mismatch');

headline('Convert_parse errors');
	expectErr(() => Convert_parse(convert, '3*(4*5)*2)'), 101, '3*(4*5)*2): missing bracket');
	expectErr(() => Convert_parse(convert, '2 * / 3'), 102, '2 * / 3: illegal operator use');
	expectErr(() => Convert_parse(convert, '4*()*5'), 103, '4*()*5: empty brackets');
	expectErr(() => Convert_parse(convert, '1e999'), 104, '1e999: NaN');
	expectErr(() => Convert_parse(convert, 'm..'), 105, 'm..: unknown power');
	expectErr(() => Convert_parse(convert, 'kPaa'), 106, 'kPaa: unknown unit');
	expectErr(() => Convert_parse(convert, '3#4~5'), 110, '3#4~5: reserved chars');
	expectErr(() => Convert_parse(convert, '{3°C'), 111, '{3°C: unbalanced {}');
	expectErr(() => Convert_parse(convert, '(2+{1+1)}'), 112, '(2+{1+1)}: {}() mismatch');

//TEST SUMMARY
	const color = passed === total ? 'green' : 'red';
	const text = ` FINISHED with ${passed}/${total} passed `;
	const line = '-'.repeat(text.length);
	console.log('%c' + line+'\n'+text+'\n'+line, 'color: '+color+'; font-size: 16px; font-weight: bold');
}

/*
"Unpublished" tests that should fail:
fullTest('2//4', '', 0.5, 1e-6); //expect OK, got 102 → 1/1 failed
fullTest('mt/ks', '', 1e-3, 1e-4); //expect OK, got 201 → 1/1 failed
fullTest('7', '', 7, 1e-4, 200); //expect 200, got OK → 1/2 failed
fullTest('2//4', '', 2e-3, 1e-6, 202); //expect 202, got error → 1/2 failed
fullTest('mt/ks', '', 2e-3, 1e-6, 202); //expect 202, got wrong number + wrong warning → 2/2 failed
fullTestErr('7*3', '', 107, 'misplaced operator'); //expect 107, got OK
expectErr(() => Convert_parse(convert, '(2+(1+1))'), 112, '(2+{1+1)}: {}() mismatch'); //expect 112, got OK
*/
