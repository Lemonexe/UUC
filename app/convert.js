/*
	convert.js
	contains the CONVERT OBJECT CONSTRUCTOR
	that does all of the heavy lifting.
	It contains functions and state variables concerning the conversion itself
*/

let Convert = function() {
	//status means 0 = OK, 1 = warnings, 2 = fatal error. Status text will contain error or warning messages.
	this.status = 0;
	this.messages = [];

	//err and warn functions fill messages. Err() will display only the first error, warn() will concatenate all warnings.
	//That's because when an error occurs, it might trigger another, and it would be useless to display the whole cascade of errors
	this.err = function(text) {
		this.status = 2;
		this.messages = [text]
	};
	this.warn = function(text) {
		this.status = (this.status < 1) ? 1 : this.status;
		this.messages.push(text);
	};

	//factory for result object returned by init()
	this.result = function(num, dim) {
		return {
			output: num ? {num: num, dim: dim} : false,
			status: this.status,
			messages: this.messages
		};
	};

	//this is the central function that determines the program flow. It uses many other functions, which will be properly described later. Returns an object from result() factory
	this.init = function(input, target) {
		/*
		unit is represented by four kinds of data type:
			1. text representation is parsed from input and then recreated in the end (vars target, SIunit)
			2. detailed object, the result of parsing both input and target. It is stored in this.unit.
				structure: array of all units, each represented by: [{reference to a prefix object or number 1}, {reference to a unit object}, power number]
			3. aggregate vector. It's like the vector of units, but this is aggregated vector of the whole unit
			4. aggregate unit - it is the conversion value of the whole unit (its value in basic SI). For example min^-2 = 60^-2 s
		*/

		//target object
		let objT = false;
		if(target !== '' && target !== '1') {
			//these lines are the core of conversion, now executed on target unit field
			objT = this.parseField(target);
			//throw error if it has occured
			if(this.status === 2) {return this.result();}
			//continue
			this.enumerate(objT);
			this.SI(objT);
			if(objT.numStr) {
				this.warn([
					'WARNING: Unexpected number in the target field, it has been ignored.',
					'VAROVÁNÍ: Neočekáváné číslo v cílovém poli, bylo ignorováno.'
				][lang()]);
			}
		}

		//same operations as before, this time done with input
		let obj = this.parseField(input);
		//throw error if it has occured
		if(this.status === 2) {return this.result();}
		//continue
		this.enumerate(obj);
		this.SI(obj);

		//DimAnalysis will check the vectors of target and input. It will result [ok or not, vector of differences]
		if(target) {
			let result = this.DimAnalysis(obj.aggregateVector, objT.aggregateVector);
			//if there has been a discrepancy (vector of differences will be non-zero), vector of differences will be converted to text and sticked to the target unit
			objT.unitStr += (result === true) ? '' : ('*' + this.vector2text(result));
		}

		//enumerate the output numerical value (input numerical value times its aggregate unit divided by target aggregate unit (is 1 if there is no target unit)).
		let num = obj.numVal * obj.aggregateUnit;
		num /= objT ? objT.aggregateUnit : 1;

		//add the corrected target unit, or the original unit converted to basic SI using vector2text (if no target unit)
		let dim = (objT ? objT.unitStr : this.vector2text(obj.aggregateVector));

		//finally finish
		if(this.status === 0) {this.messages = ['OK'];}
		return this.result(num, dim);
	};

/*MAIN CONVERSION FUNCTIONS - they all work with state object (defined in parseField) and have to be executed in strict order*/

	//the largest function, parses the text. It parses the numerical value and stores it in this.num. Then it parses text representation of unit to detailed object and stores it in this.units
	this.parseField = function(text) {
		if(text === '') {
			this.err([
				'ERROR: No input detected!',
				'CHYBA: Nenalezen žádný vstup!'
			][lang()]);return;
		}

		//obj is the object which contains state of one input field conversion
		let obj = {
			input: text,
			numVal: 1,
			unitStr: text,
			units: []
		};

		this.parseNumerical(obj);
		this.parseUnits(obj);

		return obj;
	};

	//parse the numerical part of raw text input and store extracted data in obj
	this.parseNumerical = function(obj) {
		//try to match numerical part
		let numStr = obj.input.match(/^-?[\d\.]+e?[\-\d]*/);

		if(numStr) {
			numStr = numStr[0];
			if(numStr[numStr.length - 1] === 'e') {
				numStr = numStr.slice(0,-1);
			}
			//save results
			obj.numStr = numStr;
			obj.numVal = Number(numStr);
			obj.unitStr = obj.input.slice(numStr.length);

			//is the numerical part a sensible number?
			if(isNaN(obj.numVal)) {
				this.err([
					'ERROR: Numerical part identified but cannot be parsed!',
					'CHYBA: Nalezena numerická část, ovšem nelze ji zpracovat!'
				][lang()]);return;
			}
		}
	};

	this.parseUnits = function(obj) {
		//dimensionless units
		if(obj.unitStr.length === 0) {return;}

		//all parts of text that might mean something are divided by * or /. But unlike regular split, the delimiters are kept in the array (because we need to distinguish between * and /)
		//before splitting it, parenthesis must be evaluated - and replaced by their numeric value
		let members = obj.unitStr
			.replace(/(\([\d\-\./\*]+\))/g, m => eval(m))
			.split(/([*/])/);

		//all delimiters at the beginning are removed. A slash shouldn't be found there!
		while(['', '*', '/'].indexOf(members[0]) > -1) {
			if(members[0] === '/') {
				this.warn([
					'WARNING: Unexpected slash sign after numerical part, it is regarded as a space. Consider using the form: unit -exponent.',
					'VAROVÁNÍ: Neočekáváné lomítko po numerické části, bude považováno za mezeru. Používejte raději tvar: jednotka -exponent.'
				][lang()]);
			}
			members.shift();
		}

		//now we are getting to parsing units.
		//ids and prefs are arrays of the abbreviations. We can later search those auxiliary arrays with indexOf and use the index to get the unit or prefix from the original array
		let ids = Units.map(item => item.id);
		let prefs = Prefixes.map(item => item.id);

		//this for cycle is rather unusual - it skips the delimiters and then look back at them.
		for(let n = 0; n < members.length; n += 2) {
			let m = members[n];
			
			//if there is a preceding delimiter and it is a slash, power will be -1
			let power = (members[n - 1] === '/') ? -1 : 1;

			//the unit now consists of unit and its power. It searches for number or ^number at the end and if it exists, ^ is removed and if its number, we multiply power with it and strip it from the text
			let powIndex = m.search(/[\^\-\.\d]+$/);
			if(powIndex > -1) {
				let pow2 = Number(m.slice(powIndex).replace(/^\^/ , ''));
				if(isNaN(pow2)) {
					this.err([
						'ERROR: Cannot parse unit power (' + m.slice(powIndex) + ')!',
						'CHYBA: Nelze zpracovat mocninu jednotky (' + m.slice(powIndex) + ')!'
					][lang()]);return;
				}
				power *= pow2;
				m = m.slice(0, powIndex);
			}

			//first we try to find the unit in ids. If we are successful we go to else.
			let i = ids.indexOf(m);
			if(i === -1) {
				//there might be a prefix. First letter is stripped and we search for units without it. We also search the prefixes for the first letter
				i = ids.indexOf(m.slice(1))
				j = prefs.indexOf(m[0]);

				//if we find both, we add the unit with its prefix and check whether its appropriately used. If we didn't find i or j, the unit is unknown.
				if(i === -1 || j === -1) {
					this.err([
						'ERROR: Unknown unit ' + m + '!',
						'CHYBA: Nenalezena jednotka ' + m + '!'
					][lang()]);return;
				}
				else {
					obj.units.push([Prefixes[j], Units[i], power]);
					this.checkPrefix([Prefixes[j], Units[i]]);
				}
			}
			//unit is added with prefix equal to 1
			else {
				obj.units.push([1, Units[i], power]);
			}

		}
	};

	//checkPrefix accepts pair [prefix object, unit object] and gives warnings if they are not appropriately used.
	this.checkPrefix = function(arg) {
		if(!arg[1].prefix || arg[1].prefix === '0') {
			this.warn([
				'WARNING: Unit ' + arg[1].id + ' (' + arg[1].name[lang()] + ') doesn\'t usually have any prefixes, yet ' + arg[0].id + ' identified!',
				'VAROVÁNÍ: Jednotka ' + arg[1].id + ' (' + arg[1].name[lang()] + ') většinou nemívá žádné předpony, avšak nalezeno ' + arg[0].id + '!',
			][lang()]);
		}
		else if(arg[1].prefix === '+' && arg[0].v < 0) {
			this.warn([
				'WARNING: Unit ' + arg[1].id + ' (' + arg[1].name[lang()] + ') doesn\'t usually have decreasing prefixes, yet ' + arg[0].id + ' identified!',
				'VAROVÁNÍ: Jednotka ' + arg[1].id + ' (' + arg[1].name[lang()] + ') většinou nemívá zmenšující předpony, avšak nalezeno ' + arg[0].id + '!',
			][lang()]);
		}
		else if(arg[1].prefix === '-' && arg[0].v > 0) {
			this.warn([
				'WARNING: Unit ' + arg[1].id + ' (' + arg[1].name[lang()] + ') doesn\'t usually have increasing prefixes, yet ' + arg[0].id + ' identified!',
				'VAROVÁNÍ: Jednotka ' + arg[1].id + ' (' + arg[1].name[lang()] + ') většinou nemívá zvětšující předpony, avšak nalezeno ' + arg[0].id + '!',
			][lang()]);
		}
	};

	//enumerate reads the detailed unit object from obj.units and enumerates the aggregate unit.
	this.enumerate = function(obj) {
		let aggregateUnit = 1;
		let current = 1;

		//foreach unit we check prefix and if it is an object (not number 1), read it and raise it to power. Then we raise the unit coeficient to power and multiply the aggregateUnit with all of it.
		for (u of obj.units) {
			current = 1;
			if(typeof u[0] === 'object') {
				current *= 10 ** (u[0].v*u[2]);
			}
			current *= u[1].k ** u[2];
			aggregateUnit *= current;
		}
		obj.aggregateUnit = aggregateUnit;
	};

	//SI reads the detailed unit object from this.units and enumerates the aggregate vector.
	this.SI = function(obj) {
		let aggregateVector = new Array(8).fill(0);
		
		//foreach unit we add vector of its units multiplied by power
		for(let u of obj.units) {
			for(i in u[1].v) {
				if(u[1].v.hasOwnProperty(i)) {
					aggregateVector[i] += u[1].v[i] * u[2];
				}
			}
		}
		obj.aggregateVector = aggregateVector;
	};

/*AUXILIARY FUNCTIONS, can be fired at will*/

	//vector2text will convert unit vector into text representation. 
	this.vector2text = function(vect) {
		//first we filter all basic units, they are important
		let text = '';
		let basic = Units.filter(item => item.basic);

		//foreach dimension of the vector we check if its nonzero. If it is, we find the corresponding basic unit and add its id. If it is not 1, we add power and stick an asterisk at the end.
		for(let i in vect) {
			if(vect.hasOwnProperty(i)) {
				if(vect[i] !== 0){
					text += basic.find(item => item.v[i] === 1).id;
					if(vect[i] !== 1) {
						text += vect[i];
					}
					text += '*';
				}
			}
		}
		//the last asterisk gets removed
		text = text.replace(/\*$/, '');
		return text;
	};

	//DimAnalysis will take vector of input and target. Returns true if ok, or the correction vector - power of basic units we have to add.
	this.DimAnalysis = function(source, target) {
		let corr = new Array(8).fill(0);
		let OK = true;
		let basic = Units.filter(item => item.basic);
		//array of ids of dimensions that don't fit
		let faults = [];

		//foreach dimension we check if it is equal. If it isn't, it's not OK. We enumerate correction and add a fault.
		for(let i in corr) {
			if(corr.hasOwnProperty(i)) {
				if(source[i] !== target[i]) {
					corr[i] = source[i] - target[i];
					faults.push(basic.find(item => item.v[i] === 1).id);
					OK = false;
				}
			}
		}
		//nicely written warning
		if(faults.length > 0) {
			this.warn([
				'WARNING: Dimensions of units from input and target don\'t match. These basic units have been added: ' + faults.join(', ') + '.',
				'VAROVÁNÍ: Rozměry jednotek ze vstupu a cíle nesouhlasí. Tyto základní jednotky byly přidány: ' + faults.join(', ') + '.'
			][lang()]);
		}
		
		return ((OK === true) ? OK : corr);
	};
};
