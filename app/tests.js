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
	//assertion of expected error number
	const expectErr = function(f, errNumber, text) {
		let pass = false;
		try {f();}
		catch(err) {
			let match = err.match(/[^\d]*(\d+)/); //try to match number of thrown error
			if(match && match[1] === String(errNumber)) {pass = true;}
		}
		log(pass, '', 'error '+errNumber, text)
	};

	//log the result of an assertion
	function log(pass, arg1, arg2, text) {
		total++; pass && passed++;
		pass ? !silent && console.log(`PASSED: ${text}`) : console.error(`NOT PASSED: ${text}\nexpected: ${arg2}\nactual: ${arg1}`);
	}

/*HERE COME THE ACTUAL TESTS*/

//I'm so sophisticated that even tests are tested
	eqApx(4.789**0.4, 1.8711, 1e-2, 'test(): eqApx');
	eqObj({a: '1', b: [2]}, {a: '1', b: [2]}, 'test(): eqObj');

//convert.js
	let q1 = new convert.Q(4,[-1,1,-2,0,0,0,0,0]);
	let q2 = new convert.Q(16,[-2,2,-4,0,0,0,0,0]);
	eqObj(q1, {n: 4, v: [-1,1,-2,0,0,0,0,0]}, 'convert.Q');

	let pow = new convert.Q(2)
	eqObj(convert.power(q1, pow), q2, 'convert.power');

	pow = new convert.Q(2, [1e-10])
	eqObj(convert.power(q1, pow), q2, 'convert.power: with tolerance');

	pow = new convert.Q(2, [1])
	expectErr(() => convert.power(q1, pow), 108, 'convert.power: detect dimension error');

	let res = new convert.Q(64,[-3,3,-6,0,0,0,0,0]);
	eqObj(convert.multiply(q1, q2), res, 'convert.multiply');

	res = new convert.Q(0.25,[1,-1,2,0,0,0,0,0]);
	eqObj(convert.divide(q1, q2), res, 'convert.divide');

	q2 = new convert.Q(7,[-1,1,-2,0,0,0,0,0]);

	res = new convert.Q(11,[-1,1,-2,0,0,0,0,0])
	eqObj(convert.add(q1, q2), res, 'convert.add');

	res = new convert.Q(-3,[-1,1,-2,0,0,0,0,0])
	eqObj(convert.subtract(q1, q2), res, 'convert.subtract');

	q2 = new convert.Q(7,[1,1,-2,0,0,0,0,0]);
	expectErr(() => convert.subtract(q1, q2), 109, 'convert.add: detect dimension mismatch');

//convert_parse.js
	const text = ` FINISHED with ${passed}/${total} passed `;
	const line = '\n' + '-'.repeat(text.length) + '\n';
	console.log(line + text + line);
}
