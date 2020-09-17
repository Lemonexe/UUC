/*
	convert.js
	contains the convert object constructor
	which does all of the heavy lifting except for parsing input strings (see convert_parse.js)

	an expression can be represented by four kinds of data type:
		1. text representation that is parsed from input and then recreated in the end
		2. detailed nested object - an array with numbers, operators, Unit() instances and arrays for bracket expressions
		3. nested object where all numbers and units were converted into Q() instances
		4. single Q() instance - enumerated expression with numeric value and dimension
*/

function Convert() {
	//database of messages (strings or functions)
	const msgDB = {};
	//these messages must be supplied before using convert. Some of these are just strings, some are functions with specific arguments. See lang.js
	['ERR_brackets_missing', 'ERR_operators', 'ERR_brackets_empty', 'ERR_NaN', 'ERR_unitPower', 'ERR_unknownUnit', 'ERR_operator_misplaced', 'ERR_power_dim', 'ERR_dim_mismatch', 'ERR_special_chars', 'WARN_prefixes', 'WARN_prefixes_word0', 'WARN_prefixes_word+', 'WARN_prefixes_word-', 'WARN_targetNumber', 'WARN_target_dim_mismatch']
		.forEach(o => msgDB[o] = null);
	this.msgDB = msgDB;

	//status means 0 = OK, 1 = warnings, 2 = fatal error. Status text will contain error or warning messages.
	this.clearStatus = function() {
		this.status = 0;
		this.messages = [];
	}
	this.clearStatus();

	//err and warn functions fill messages. Err() will display only the first error, warn() will concatenate all warnings.
	//That's because when an error occurs, it might trigger another, and it would be useless to display the whole cascade of errors
	this.err = function(text) {
		this.status = 2;
		this.messages = [text];
	};
	this.warn = function(text) {
		this.status = (this.status < 1) ? 1 : this.status;
		this.messages.push(text);
	};

	const dimTolerance = 1e-3; //tolerance of dimension mismatch

	//object representing physical quantity as numerical value 'n' and dimension vector 'v'
	function Q(n, v) {
		this.n = typeof n === 'number' ? n : 1;
		this.v = v || new Array(8).fill(0);
	}
	this.Q = Q;

	//object representing a disassembled unit - its prefix, the unit itself and its power
	function Unit(pref, unit, power) {this.pref = pref; this.unit = unit; this.power = power;}
	this.Unit = Unit;

	//MAIN FUNCTION - do a full conversion between input string and target string, and return an output object
	this.fullConversion = function(input, target) {
		input = this.beautify(input); target = this.beautify(target);
		const isTarget = target.length > 0;
		this.clearStatus();

		let iObj, tObj; //input & target object
		const res = {}; //output object
		try {
			//parse input & target strings into detailed nested objects
			iObj = Convert_parse(this, input);
			tObj = Convert_parse(this, target);

			//perform the calculation
			iObj = this.reduceField(iObj);
			tObj = this.reduceField(tObj);

			//then the conversion itself is pretty simple!
			const num = iObj.n / tObj.n;
			let dim = isTarget ? target : this.vector2text(iObj.v); //if no target, then SI representation

			//correct dimension mismatch
			const corr = !isTarget || this.checkDimension(iObj.v, tObj.v);
			if(corr !== true) {dim += '*' + this.vector2text(corr);}
			res.output = {num: num, dim: dim};
		}
		catch(err) {this.err(err);}

		//return the results
		if(this.status === 0) {this.messages = ['OK'];}
		res.status = this.status; res.messages = this.messages; this.clearStatus();
		return res;
	};

	//perform calculation of each field - reduce nested object (expression) into one physical quantity
	this.reduceField = function(obj) {
		const that = this;
		//recursively crawl to simplify units into physical quantity objects (we could do it during crawl2, but crawl2 is already quite complicated as it is)
		obj = crawl1(obj);
		//recursively crawl to calculate everything into the final physical quantity
		return crawl2(obj);

		//first crawl converts numbers & [pref, unit, power] objects into Q() instances
		function crawl1(arr) {
			for(let i = 0; i < arr.length; i++) {
				const o = arr[i];
				//is a number: make it a simple new Q
				if(typeof o === 'number') {arr[i] = new Q(o);}
				//is a unit: turn unit into a Q
				else if(o instanceof that.Unit) {
					const pref = typeof o.pref === 'object' ? 10**o.pref.v : 1;
					let obj = {n: pref * o.unit.k, v: o.unit.v};
					arr[i] = that.power(obj, new Q(o.power));
				}
				//is an array: recursion further
				else if(Array.isArray(o)) {crawl1(o);}
				//else operator ^ * / + -
			}
			return arr;
		}

		//second crawl is quite complicated - it calculates the whole nested object into a single Q
		//it starts from deepest brackets, solves them and gradually gets higher. That's achieved via recursion
		//due to operator precedence, first do all power expressions - reduce each into Q
		//then do the same with multiplication/divison and finally, we can add and subtract everything into the final Q
		function crawl2(arr) {
			//first element of section has to be either Q, or bracket expression array
			if(!(arr[0] instanceof Q) && !Array.isArray(arr[0])) {throw that.msgDB['ERR_operator_misplaced'](arr[0]);}
			let i, res, arr2;

			//first enter all bracket expression arrays and get result (recursion) before continuing
			for(i = 0; i < arr.length; i++) {
				if(Array.isArray(arr[i])) {arr[i] = crawl2(arr[i]);}
			}

			//then do all powers
			arr = subcrawl(arr, ['^'], (res, sign, q) => that.power(res, q));
			//then do all multiplications and divisions
			arr = subcrawl(arr, ['*', '/'], (res, sign, q) => sign === '*' ? that.multiply(res, q) : that.divide(res, q));

			//finally add and subtract everything into the final Q
			if(!(arr[0] instanceof Q)) {throw that.msgDB['ERR_operator_misplaced'](arr[0]);}
			res = arr[0];
			for(i = 0; i < arr.length; i += 2) {
				if(arr.hasOwnProperty(i+1)) {
					if     (arr[i+1] === '+' && arr[i+2] instanceof Q) {res = that.add     (res, arr[i+2]);}
					else if(arr[i+1] === '-' && arr[i+2] instanceof Q) {res = that.subtract(res, arr[i+2]);}
					else {throw that.msgDB['ERR_operator_misplaced'](arr[i+1]);}
				}
			}
			return res;
		}

		//similar code structire for ^ as well as * /, so here's another function
		function subcrawl(arr, signs, callback) {
			let res = null; let arr2 = [];
			for(i = 0; i < arr.length; i += 2) {
				if(!arr.hasOwnProperty(i+1)) {break;}
				if(signs.indexOf(arr[i+1]) > -1) {
					if(!res) {res = arr[i];}
					if(!(arr[i+2] instanceof Q)) {throw that.msgDB['ERR_operator_misplaced'](arr[i+1]);}
					res = callback(res, arr[i+1], arr[i+2]);
				}
				else {
					if(res) {arr2.push(res); arr2.push(arr[i+1]); res = null;}
					else {arr2.push(arr[i]); arr2.push(arr[i+1]);}
				}
			}
			if(res) {arr2.push(res);}
			else {arr2.push(arr[i]);}
			return arr2;
		}
	};

	//raise quantity object 'q1' to the power of 'q2'
	this.power = function(q1, q2) {
		//q2 has to be dimensionless
		const v = this.almostZero(q2.v);
		for(let o of v) {if(o !== 0) {throw this.msgDB['ERR_power_dim'];}}

		return new Q(q1.n**q2.n, q1.v.map(o => o * q2.n));
	};

	//multiply, divide, add and subtract a physical quantity 'q1' with 'q2'
	this.multiply = (q1, q2) => new Q(q1.n * q2.n, q1.v.map((o,i) => o + q2.v[i]));
	this.divide = (q1, q2) => this.multiply(q1, this.power(q2, new Q(-1)));

	this.add = function(q1, q2) {
		//check dimension
		const v = this.almostZero(q1.v.map((o,i) => o - q2.v[i]));
		for(let o of v) {if(o !== 0) {throw this.msgDB['ERR_dim_mismatch'];}}

		return new Q(q1.n + q2.n, q1.v);
	};
	this.subtract = (q1, q2) => this.add(q1, this.multiply(q2, new Q(-1)));

	//checkPrefix accepts pair [prefix object, unit object] and gives warnings if they are not appropriately used
	this.checkPrefix = function(pref, unit) {
		//find all possible mismatch situations and fill the appropriate word for warning
		let word = false;
		(!unit.prefix || unit.prefix === '0') && (word = this.msgDB['WARN_prefixes_word0']);
		(unit.prefix === '+' && pref.v < 0)   && (word = this.msgDB['WARN_prefixes_word+']);
		(unit.prefix === '-' && pref.v > 0)   && (word = this.msgDB['WARN_prefixes_word-']);

		if(word !== false) {
			this.warn(this.msgDB['WARN_prefixes'](unit, word, pref));
		}
	};

	//checkDimension will take vector of input and target. Returns true if ok, or the correction vector - power of basic units that have to be added to source in order to match target
	this.checkDimension = function(source, target) {
		let OK = true;
		const corr = new Array(8).fill(0);
		const basic = Units.filter(item => item.basic);
		const faults = []; //array of ids of dimensions that don't fit

		//foreach dimension check if it is equal. If it isn't, it's not OK, so enumerate correction and add a fault
		for(let i = 0; i < corr.length; i++) {
			if(Math.abs(source[i] - target[i]) > dimTolerance) {
				corr[i] = source[i] - target[i];
				faults.push(basic.find(item => item.v[i] === 1).id);
				OK = false;
			}
		}
		(faults.length > 0) && this.warn(this.msgDB['WARN_target_dim_mismatch'](faults)); //nicely written warning

		return OK || corr;
	};

	//check a detailed nested object for numbers. If there is a number, give a warning
	//CURRENTLY NOT USED, because it gives warning for ^power, and it shouldn't
	this.checkTargetNumbers = function(obj) {
		let isNum = false;
		crawl(obj);
		isNum && this.warn(this.msgDB['WARN_targetNumber']);

		function crawl(arr) {
			if(isNum) {return;}
			for(let o of arr) {
				if(typeof o === 'number' && o !== 1) {isNum = true; return;}
				else if(Array.isArray(o)) {crawl(o);}
			}
		};
	};

	//vector2text will convert unit vector 'v' into text representation
	this.vector2text = function(v) {
		let text = '';
		const basic = Units.filter(item => item.basic); //first filter all basic units

		//foreach dimension of the vector check if its nonzero. If it is, find the corresponding basic unit and add its id. Add power if it isn't 1 and stick an asterisk at the end
		for(let i = 0; i < v.length; i++) {
			if(v[i] !== 0){
				text += basic.find(item => item.v[i] === 1).id;
				(v[i] !== 1) && (text += v[i]);
				text += '*';
			}
		}
		return text.replace(/\*$/, ''); //the last asterisk gets removed
	};

	//almost-zero numbers (floating point error) in vector 'v' will be zero (arbitrary threshold), that's necessary in order to use ^ + -
	this.almostZero = v => v.map(n => Math.abs(n) > dimTolerance ? n : 0);

	//finish conversion by assigning & formatting the result & status
	this.format = function(result, params) {
		//TODO if dim begins with number, add an '* '
		/*//format of output number
		if($scope.result.output && CS.parameters) {
			//number of digits
			let d = CS.digits ? CS.digits : 2;
			$scope.result.output.num = CS.expForm ? $scope.result.output.num.toExponential(d-1) : $scope.result.output.num.toPrecision(d);
		}*/
		return result;
	};

	//beautify the input string by balancing brackets. This is not as thorough as Convert_parse > syntaxCheck
	this.beautify = function(text) {
		text = text.trim();
		const opening = text.split('(').length - 1;
		const closing = text.split(')').length - 1;
		return opening > closing ? text + ')'.repeat(opening-closing) : text;
	};
}
