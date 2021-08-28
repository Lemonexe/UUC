/*
	tests.js
	yes, UUC has tests now B-)
	I don't know how to use those big fancy libraries cause I'm just a simple peasant, so I've grown my own code!
*/

function tests(silent) {//optional argument to silence tests that have successfully passed
	let passed = 0;
	let total  = 0;
	//assertion of plain equivalence
	const eq = (arg1, arg2, text) => log(arg1 === arg2, arg1, arg2, text);
	//assertion of approximate number equivalence
	const eqApx = (arg1, arg2, tol, text) => log(Math.abs(arg1-arg2) < tol, arg1, arg2, text);
	//assertion of object equivalence
	const eqObj = (arg1, arg2, text) => log(angular.equals(arg1, arg2), JSON.stringify(arg1), JSON.stringify(arg2), text);
	//assertion of expected error number (but is not used for full conversion errors, because they are caught, see fullTestErr)
	function expectErr(f, errNumber, text) {
		let pass = false;
		try {f();}
		catch(err) {
			let match = err.match(/[^\d]*(\d+)/); //try to match number of thrown error
			if(match && match[1] === String(errNumber)) {pass = true;}
		}
		log(pass, '', 'error '+errNumber, text);
	}
	//assertion of expected full conversion result with 'input' & 'target' strings, expected status and optionally expected result number with tolerance
	function fullTest(input, target, expectStat, expectNum, tol) {
		let text = input + ' > ' + target + ': ';
		res = convert.fullConversion(input, target);
		eq(res.status, expectStat, text+'status'+expectStat);

		res.status < 2 && typeof expectNum === 'number' && typeof tol === 'number' &&
			eqApx(res.output.num, expectNum, tol, text+'eqApx');
	}
	//assertion of expected full conversion error with 'input' string, expected error number and description
	function fullTestErr(input, expectErr, text) {
		res = convert.fullConversion(input, '');
		let match = res.messages[0].match(/[^\d]*(\d+)/); //try to match number of thrown error
		log(match && match[1] === String(expectErr), '', 'error '+expectErr, text);
	}

	//log the result of an assertion
	function log(pass, arg1, arg2, text) {
		total++; pass && passed++;
		pass ? !silent && console.log(`PASSED: ${text}`) : console.error(`NOT PASSED: ${text}\nexpected: ${arg2}\nactual: ${arg1}`);
	}

/*HERE COME THE ACTUAL TESTS*/

//I'm so sophisticated that even tests are tested
	eqApx(4.789**0.4, 1.8711, 1e-2, 'test(): eqApx');
	eqObj({a: '1', b: [2]}, {a: '1', b: [2]}, 'test(): eqObj');

!silent && console.log('\nPartial functionality of convert.js');
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

!silent && console.log('\nFull conversions');
	fullTest('3*(7-3)*2', '', 0, 24, 1e-6);
	fullTest('(3*(7-3)*2)', '', 0, 24, 1e-6);
	fullTest('3*(4*(5*(2+1)-1))', '', 0, 168, 1e-6);
	fullTest('3*(4+5) / (2*2^3*2) * 7*(2+2*2+2)', '', 0, 47.25, 1e-6);
	fullTest('0.5 ((5(6+(8)3)) 2 3', '15', 0, 30, 1e-6);
	fullTest('3m2*(4*5m)*2kPa', 'J', 0, 120000, 1e-6);
	fullTest(' -3.23e+4m2 * (42,77e-2*5m)  *2kPa1.0 ', 'MJ', 0, -138.1471, 1e-2);
	fullTest('3*(4*(5+2', '', 0, 84, 1e-6);
	fullTest('l^(1/3)', 'dm', 0, 1, 1e-3);
	fullTest('_e^(30 kJ/mol / (_R * 298 K))', '', 0, 181309.23, 0.1);
	fullTest('8 Mt/yr / (900 kg/m3)', 'kbbl/d', 0, 153.07481, 1e-3);
	fullTest('Da', 'u', 0, 1, 1e-6);
	fullTest('Nm3', 'Ncm', 0, 1, 1e-6);
	fullTest('0°C+TC0', 'K', 0, csts.TC0, 1e-6);
	fullTest('57°F+TF0-TC0', '', 0, 13.8889, 1e-3);
	fullTest('Mpa*PPM', '', 0, 1, 1e-3); //case-sensitive leniency

!silent && console.log('\nFull conversion warnings');
	fullTest('m3', 'm2', 1);
	fullTest('mt/ks', 'kg/h', 1);

!silent && console.log('\nFull conversion errors');
	fullTestErr('7*', 107, '7*: detect misplaced operator');
	fullTestErr('3^m', 108, '3^m: detect non-dimensionless power');
	fullTestErr('7m + 4s', 109, '7m + 4s: detect dimension mismatch in addition');

!silent && console.log('\nConvert_parse errors');
	expectErr(() => Convert_parse(convert, '3*(4*5)*2)'), 101, '3*(4*5)*2): detect missing bracket');
	expectErr(() => Convert_parse(convert, '2 * / 3'), 102, '2 * / 3: detect operators next to each other');
	expectErr(() => Convert_parse(convert, '4*()*5'), 103, '4*()*5: detect empty brackets');
	expectErr(() => Convert_parse(convert, '1e999'), 104, '1e999: detect NaN');
	expectErr(() => Convert_parse(convert, 'm..'), 105, 'm..: detect unknown power');
	expectErr(() => Convert_parse(convert, 'kPaa'), 106, 'kPaa: detect unknown unit');
	expectErr(() => Convert_parse(convert, '3#4~5'), 110, '3#4~5: detect reserved chars');

//TEST SUMMARY
	const text = ` FINISHED with ${passed}/${total} passed `;
	const line = '\n' + '-'.repeat(text.length) + '\n';
	console.log(line + text + line);
}
