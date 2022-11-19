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

function Convert() {
	//database of messages (strings or functions)
	const msgDB = {};
	//these messages must be supplied before using convert. Some of these are just strings, some are functions with specific arguments. See lang.js
	//controller populates it with language-specific strings
	['ERR_brackets_missing', 'ERR_operators', 'ERR_brackets_empty', 'ERR_NaN', 'ERR_unitPower', 'ERR_unknownUnit', 'ERR_operator_misplaced', 'ERR_power_dim', 'ERR_dim_mismatch', 'ERR_special_chars',
		'ERR_cbrackets_missing', 'ERR_brackets_mismatch', 'ERR_cbrackets_illegal', 'ERR_unknown_unitfun', 'ERR_cbrackets_dim_mismatch', 'ERR_NaN_result',
		'WARN_prefixes', 'WARN_prefixes_word0', 'WARN_prefixes_word+', 'WARN_prefixes_word-', 'WARN_target_dim_mismatch', 'WARN_targetNumber', 'WARN_separators', 'WARN_curly_prefix', 'WARN_format_params',
		'ERRC_equalSigns', 'ERRC_varName', 'ERRC_argCount', 'ERRC_unreadableLine'
	].forEach(o => msgDB[o] = null);
	this.msgDB = msgDB;

	//status means 0 = OK, 1 = WARNING, 2 = ERROR. Status text will contain error or warning messages.
	this.clearStatus = function() {
		this.status = 0;
		this.messages = [];
	}
	this.clearStatus();

	//warn downgrades status to 1 and adds a message
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



	/*
		MAIN CONVERSION FUNCTIONS
	*/
	//the most important function - do a full conversion between input string and target string, and return an output object
		//called from: fullConversion, Convert_macro
	this.convert = function(input, target) {
		if(typeof target !== 'string') {target = '';}
		input = this.beautify(input); target = this.beautify(target);
		const isTarget = target.length > 0;

		let iObj, tObj; //input & target object

		//parse input & target strings into detailed nested objects, see convert_parse.js
		iObj = Convert_parse(this, input);
		tObj = Convert_parse(this, target);

		const isTargetCurly = isTarget && Array.isArray(tObj[0]) && tObj[0][0] === '{}'; //whether curly is used in target (appropriately!)

		iObj = this.rationalizeField(iObj, true); //transform detailed nested object to nested Q object
		iObj = this.reduceField(iObj); //reduce nested Q object to single Q

		//processing {target} bypasses everything else, because the functionality is very specific and intentionally limited
		if(isTargetCurly) {return this.processTargetCurly(iObj, tObj);}

		this.checkTargetNumbers(tObj);
		tObj = this.rationalizeField(tObj);
		tObj = this.reduceField(tObj);

		//then the conversion itself is pretty simple!
		const num = iObj.n / tObj.n;
		if(isNaN(num)){throw this.msgDB['ERR_NaN_result'];}
		let dim = isTarget ? target : this.vector2text(iObj.v, true); //if no target, then SI representation

		//correct dimension mismatch
		const corr = !isTarget || this.checkDimension(iObj.v, tObj.v);
		if(corr !== true) {dim += '*' + this.vector2text(corr, true);}

		return {num: num, dim: dim};
	};

	//execute a conversion from input & target. It simply operates on this.convert() with the added value of exception handling and message system
		//called from: controller, tests
	this.fullConversion = function(input, target) {
		const res = {}; //output object

		try {res.output = this.convert(input, target);}
		catch(err) {this.status = 2; this.messages = [err];} //downgrade status to 2 and only the error message will be shown

		//return the results
		if(this.status === 0) {this.messages = ['OK'];}
		res.status = this.status; res.messages = this.messages; this.clearStatus();
		return res;
	};

	//execute code input, the so called macro, see convert_macro.js
	this.runCode = Convert_macro;

	//recursively crawl through detailed nested object: transform units and numbers into Q instances (physical quantity)
		//called from: parseQ, convert, convert_macro
	this.rationalizeField = function(obj, curly) { //optional curly = if curly brackets are legal in their normal sense
		const that = this;
		return crawl(obj);

		//crawl converts numbers & [pref, unit, power] objects into new Q() instances
		function crawl(arr) {
			//in case the array is a {expression}
			if(arr[0] === '{}') {
				const [x, unitfun] = that.processCurly(arr, curly);
				const y = unitfun.f(x); //from numerical input within {} to unitfun result
				return arr = [new Q(y, unitfun.v)];
			}

			//normal array: crawl through it
			for(let i = 0; i < arr.length; i++) {
				const o = arr[i];
				//is a number: make it a simple new Q
				if(typeof o === 'number') {arr[i] = new Q(o);}
				//is a unit: turn unit into a Q
				else if(o instanceof that.Unit) {
					const pref = typeof o.pref === 'object' ? 10**o.pref.v : 1;
					const obj = new Q(pref * o.unit.k, o.unit.v);
					arr[i] = that.power(obj, new Q(o.power));
				}
				//is an array: recursion further
				else if(Array.isArray(o)) {arr[i] = crawl(o);}
				//else operator ^ * / + -
			}
			return arr;
		}
	};

	//recursively reduce nested object (expression) into the one final Q
	//it starts from deepest brackets, solves them and gradually gets higher (that's achieved via recursion)
		//called from: same as rationalizeField
	this.reduceField = function(obj) {
		const that = this;
		return crawl(obj);

		//crawl operates on an array and calculates it into a single Q
		//operator precedence: first get () result, then do ^, then * /, then + - into the final Q
		function crawl(arr) {
			//first element of section has to be either Q, or bracket expression array
			if(!(arr[0] instanceof Q) && !Array.isArray(arr[0])) {throw that.msgDB['ERR_operator_misplaced'](arr[0]);}
			let i, res;

			//first enter all bracket expression arrays and get result (recursion) before continuing
			for(i = 0; i < arr.length; i++) {
				if(Array.isArray(arr[i])) {arr[i] = crawl(arr[i]);}
			}

			//then do all powers
			arr = subcrawl(arr, ['^'], (res, sign, q) => that.power(res, q));
			//then do all multiplications and divisions
			arr = subcrawl(arr, ['*', '/'], (res, sign, q) => sign === '*' ? that.multiply(res, q) : that.divide(res, q));

			//finally add and subtract everything into the final Q
			//unlike subcrawl, there is no need for auxiliary array, this for creates the single Q object right away
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

		//subcrawling ^ has similar code as * /, so this "subcrawl" function can do them all with callback
		function subcrawl(arr, signs, callback) {
			let res = null; let arr2 = []; //current result, new reduced array of Q
			for(i = 0; i < arr.length; i += 2) {
				if(!arr.hasOwnProperty(i+1)) {break;}
				//is it the sign that we'd like to process right now?
				if(signs.indexOf(arr[i+1]) > -1) {
					if(!res) {res = arr[i];} //initialize res with first number
					if(!(arr[i+2] instanceof Q)) {throw that.msgDB['ERR_operator_misplaced'](arr[i+1]);}
					//take current res and peform operation (i+1) with number (i+2)
					res = callback(res, arr[i+1], arr[i+2]);
				}
				//else we will stop accumulating res, and push it to arr2 (or the single Q if it was alone)
				else {
					if(res) {arr2.push(res); arr2.push(arr[i+1]); res = null;}
					else {arr2.push(arr[i]); arr2.push(arr[i+1]);}
				}
			}
			//finish up: after second subcrawl, return array of Q + Q - Q
			if(res) {arr2.push(res);}
			else {arr2.push(arr[i]);}
			return arr2;
		}
	};

	//generic function to process array with curly {}, returns [numerical input, Unitfun object]
	this.processCurly = function(arr, curly) {
		const Err113 = this.msgDB['ERR_cbrackets_illegal'];
		const units = arr.filter(o => o instanceof this.Unit); //all Unit objects within {expression}
		const nums = arr.filter(o => typeof o === 'number' ); //all numbers within {expression}
		const arrs = arr.filter(o => Array.isArray(o)); //all (arrays) within {expression}
		const idsUF = Unitfuns.map(o => o.id); //map of Unitfuns id

		//check appropriate use of {}
		if(!curly || units.length !== 1 || units[0].power !== 1 || arrs.length > 1) {throw Err113;}
		['+','-','/','^'].forEach(op => {if(arr.indexOf(op) > -1) {throw Err113;}});

		//parse array if necessary
		if(arrs.length > 0) {
			const res = this.reduceField(this.rationalizeField(arrs[0]));
			if(!checkZeros(res.v)) {throw this.msgDB['ERR_cbrackets_dim_mismatch'](units[0].unit.id);}
			nums.push(res.n);
		}
		if(nums.length > 1) {throw Err113;}

		//numerical x within {}, for input should be 1 num, but 0 is allowed; for target strictly 0 nums
		const x = nums.length === 1 ? nums[0] : 0; //note: it even works to use {°C*3} lol

		//find the unitfun
		const i = idsUF.indexOf(units[0].unit.id);
		if(i === -1) {throw this.msgDB['ERR_unknown_unitfun'](units[0].unit.id);}

		//one last check: if prefix, do warning and ignore it
		if(units[0].pref !== 1) {this.warn(this.msgDB['WARN_curly_prefix']);}

		return [x, Unitfuns[i]];
	};

	//process {target} detailed object - bypasses the rest of this.convert, because the functionality is very specific and intentionally limited
	this.processTargetCurly = function(iObj, tObj) {
		const [x, unitfun] = this.processCurly(tObj[0], true);
		if(x !== 0) {throw this.msgDB['ERR_cbrackets_illegal'];} //no number in {target}

		//dimension mismatch is error, unlike regular conversion where it is just a warning
		if(!checkZeros(this.divide(new Q(1, unitfun.v), new Q(1, iObj.v)).v))
			{throw this.msgDB['ERR_cbrackets_dim_mismatch'](unitfun.id);}

		const y = unitfun.fi(iObj.n); //from SI (rationalized reduced input) to inverse unitfun result
		return {num: y, dim: unitfun.id};
	};



	/*
		ARITHMETICS FUNCTIONS
	*/
	//raise quantity object 'q1' to the power of 'q2'
	this.power = function(q1, q2) {
		//q2 has to be dimensionless
		if(!checkZeros(q2.v)) {throw this.msgDB['ERR_power_dim'];}

		return new Q(q1.n**q2.n, q1.v.map(o => o * q2.n));
	};

	//multiply, divide, add and subtract a physical quantity 'q1' with 'q2'
	this.multiply = (q1, q2) => new Q(q1.n * q2.n, q1.v.map((o,i) => o + q2.v[i]));
	this.divide = (q1, q2) => this.multiply(q1, this.power(q2, new Q(-1)));

	this.add = function(q1, q2) {
		//check dimension
		if(!checkZeros(q1.v.map((o,i) => o - q2.v[i]))) {throw this.msgDB['ERR_dim_mismatch'];}

		return new Q(q1.n + q2.n, q1.v);
	};
	this.subtract = (q1, q2) => this.add(q1, this.multiply(q2, new Q(-1)));



	/*
		UTILITIY FUNCTIONS
	*/
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

	//check a detailed nested object for numbers (only shallow crawl), give a warning if number
	this.checkTargetNumbers = function(obj) {
		if(obj.length <= 1) {return;}
		for(let o of obj) {
			if(typeof o === 'number' && o !== 1) {
				this.warn(this.msgDB['WARN_targetNumber']); return;
			}
		}
	};

	//vector2text will convert unit vector 'v' into text representation
	//'properSyntax' is optional, will make the text valid for further processing if true
	this.vector2text = function(v, properSyntax) {
		let text = '';
		const basic = Units.filter(item => item.basic); //first filter all basic units

		//foreach dimension of the vector check if its nonzero. If it is, find the corresponding basic unit and add its id. Add power if it isn't 1 and stick an asterisk at the end
		for(let i = 0; i < v.length; i++) {
			if(v[i] !== 0){
				text += basic.find(item => item.v[i] === 1).id;
				if(properSyntax) {
					(v[i] > 0 && v[i] !== 1) && (text += '^' + v[i]);
					(v[i] < 0) && (text += '^(' + v[i] + ')');
				}
				else {
					(v[i] !== 1) && (text += v[i]);
				}

				text += '*';
			}
		}
		return text.replace(/\*$/, ''); //the last asterisk gets removed
	};

	//check if vector 'v' is all zeroes (w/ tolerance for floating point error)
	const checkZeros = v => v.reduce((acc, o) => acc && Math.abs(o) < dimTolerance, true);

	//format 'output' object as {num: number, dim: string} into the same object but with properly formatted number string 'num2'
	this.format = function(output, params) {
		if(!output) {return;}
		//make it nicer when dim starts with a number
		if(output.dim.search(/^\d/) > -1) {output.dim = ' * ' + output.dim;}

		let dp = params.digits, df = params.fixed, num = output.num;

		if(params.exp) {
			let d;
			(params.spec === 'fixed')  && (d = df || 0);
			(params.spec === 'digits') && (d = dp - 1);
			output.num2 = num.toExponential(d);
		}
		else if(params.spec === 'fixed') {output.num2 = num.toFixed(df || 0);}
		else if(params.spec === 'digits') {
			let dn = Math.floor(Math.log10(num)) + 1; //natural digits of the number. If greater than params.digits, don't use toPrecision, but round up manually to avoid exponential
			output.num2 = dn > dp ? (Math.round(num / 10**(dn-dp)) * 10**(dn-dp)).toFixed(0) : num.toPrecision(dp);
		}
		else {output.num2 = String(num);}
		return output;
	};

	//beautify the input string by balancing brackets. This is not as thorough as Convert_parse > syntaxCheck
	this.beautify = function(text) {
		text = text.trim();
		const opening = text.split('(').length - 1;
		const closing = text.split(')').length - 1;
		return opening > closing ? text + ')'.repeat(opening-closing) : text;
	};

	//parse one string to a Q instance in order to filter reference units
	this.parseQ = function(text) {
		try {
			let id;
			let obj = Convert_parse(this, text);
			(obj.length === 1 && obj[0] instanceof this.Unit) && (id = obj[0].unit.id); //expression consists of single unit - save the id!
			obj = this.rationalizeField(obj, true);
			obj = this.reduceField(obj);
			id && (obj.id = id); //tag the final reduced Q with matched id
			return obj;
		}
		catch(err) {return false;} //no match
	};
}
