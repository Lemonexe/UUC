/*
UUC engine

Units object is the database of all known units.
	v: [m,kg,s,A,K,mol,cd]	represents the vector of powers of basic units, for example N=kg*m/s^2, therefore v = [1,1,-2,0,0,0,0]
	SI: true/false			self-explanatory. This attribute doesn't really do anything, it's merely informational. Perhaps it's redundant, since all SI derived units have k = 1
	basic: true/false		whether it's basic SI unit or derived SI. Basic SI units are of utmost importance to the code, don't ever change them!
	prefix: all/+/-/0		it means: all prefixes allowed / only bigger than one allowed / lesser than one / prefixes disabled. It's not really a restriction, just a recommendation.
	k: number				this coeficient equates value of the unit in basic units. For example minute = 60 seconds, therefore min.k = 60
*/

window.onload = function() {
	view('intro');
	help();
};

const Units = [
	{v: [1,0,0,0,0,0,0], id: 'm', name: 'metre', k:1, SI: true, basic: true, prefix: 'all'},
	{v: [0,1,0,0,0,0,0], id: 'kg', name: 'kilogram', k:1, SI: true, basic: true, prefix: '0',
		note: 'That\'s because kilogram is problematic to code, since the "kilo" itself is a prefix... Therefore I have also defined gram as a derived SI unit, which can have all prefixes.'},
	{v: [0,0,1,0,0,0,0], id: 's', name: 'second', k:1, SI: true, basic: true, prefix: '-'},
	{v: [0,0,0,1,0,0,0], id: 'A', name: 'ampere', k:1, SI: true, basic: true, prefix: 'all'},
	{v: [0,0,0,0,1,0,0], id: 'K', name: 'kelvin', k:1, SI: true, basic: true, prefix: '-'},
	{v: [0,0,0,0,0,1,0], id: 'mol', name: 'mole', k:1, SI: true, basic: true, prefix: 'all'},
	{v: [0,0,0,0,0,0,1], id: 'cd', name: 'candela', k:1, SI: true, basic: true, prefix: 'all'},
	//{id: '',v: [0,0,0,0,0,0,0], name: '', k:1, SI: true, prefix: 'all'},
	{v: [0,0,-1,0,0,0,0], id: 'Hz', name: 'hertz', k:1, SI: true, prefix: 'all'},
	{v: [1,1,-2,0,0,0,0], id: 'N', name: 'newton', k:1, SI: true, prefix: 'all'},
	{v: [-1,1,-2,0,0,0,0], id: 'Pa', name: 'pascal', k:1, SI: true, prefix: 'all'},
	{v: [2,1,-2,0,0,0,0], id: 'J', name: 'joule', k:1, SI: true, prefix: 'all'},
	{v: [2,1,-3,0,0,0,0], id: 'W', name: 'watt', k:1, SI: true, prefix: 'all'},
	{v: [0,0,1,1,0,0,0], id: 'C', name: 'coulomb', k:1, SI: true, prefix: 'all'},
	{v: [2,1,-3,-1,0,0,0], id: 'V', name: 'volt', k:1, SI: true, prefix: 'all'},
	{v: [-2,-1,4,2,0,0,0], id: 'F', name: 'farad', k:1, SI: true, prefix: 'all'},
	{v: [2,1,-3,-2,0,0,0], id: 'ohm', name: 'ohm', k:1, SI: true, prefix: 'all'},
	{v: [-2,-1,3,2,0,0,0], id: 'S', name: 'siemens', k:1, SI: true, prefix: 'all'},
	{v: [2,1,-2,-1,0,0,0], id: 'Wb', name: 'weber', k:1, SI: true, prefix: 'all'},
	{v: [0,1,-2,-1,0,0,0], id: 'T', name: 'tesla', k:1, SI: true, prefix: 'all'},
	{v: [2,1,-2,-2,0,0,0], id: 'H', name: 'henry', k:1, SI: true, prefix: 'all'},
	{v: [0,0,0,0,1,0,0], id: '°C', name: 'degree Celsius', k:1, SI: true, prefix: '0',
		note: 'Degree Celsius is considered to be a unit of temperature <b>difference</b> (ΔT), not temperature (T)! It doesn\'t make any sense to combine T in °C with other units or raise it to power, and the program cannot possibly tell whether the input is T or ΔT, so it\'s always considered to be ΔT. Try google for simple temperature conversion...'},
	{v: [0,0,0,0,0,0,1], id: 'lm', name: 'lumen', k:1, SI: true, prefix: 'all'},
	{v: [-2,0,0,0,0,0,1], id: 'lx', name: 'lux', k:1, SI: true, prefix: 'all'},
	{v: [0,0,-1,0,0,0,0], id: 'Bq', name: 'becquerel', k:1, SI: true, prefix: 'all'},
	{v: [2,0,-2,0,0,0,0], id: 'Gy', name: 'gray', k:1, SI: true, prefix: 'all'},
	{v: [2,0,-2,0,0,0,0], id: 'Sv', name: 'sievert', k:1, SI: true, prefix: 'all'},

	{v: [0,0,1,0,0,0,0], id: 'min', name: 'minute', k:60, SI: false, prefix: '0'},
	{v: [0,0,1,0,0,0,0], id: 'h', name: 'hour', k:3600, SI: false, prefix: '0'},
	{v: [0,0,1,0,0,0,0], id: 'd', name: 'day', k:3600*24, SI: false, prefix: '0'},
	{v: [0,0,1,0,0,0,0], id: 'yr', name: 'gregorian year', k:3600*24*365.2425, SI: false, prefix: '0'},

	{v: [0,0,0,0,1,0,0], id: '°F', name: 'degree Fahrenheit', k:5/9, SI: false, prefix: '0', note: 'See °C for an important note.'},
	{v: [0,0,0,0,1,0,0], id: '°R', name: 'degree Réaumur', k:5/4, SI: false, prefix: '0', note: 'See °C for an important note.'},

	{v: [1,0,0,0,0,0,0], id: 'th', name: 'thou', k:2.54e-5, SI: false, prefix: '0'},
	{v: [1,0,0,0,0,0,0], id: 'in', name: 'inch', k:2.54e-2, SI: false, prefix: '0'},
	{v: [1,0,0,0,0,0,0], id: 'ft', name: 'foot', k:0.3048, SI: false, prefix: '0'},
	{v: [1,0,0,0,0,0,0], id: 'yd', name: 'yard', k:0.9144, SI: false, prefix: '0'},
	{v: [1,0,0,0,0,0,0], id: 'mi', name: 'mile', k:1609.344, SI: false, prefix: '0'},
	{v: [1,0,0,0,0,0,0], id: 'nmi', name: 'nautical mile', k:1852, SI: false, prefix: '0'},
	{v: [1,0,0,0,0,0,0], id: 'au', name: 'astronomical unit', k:149597870700, SI: false, prefix: '+'},
	{v: [1,0,0,0,0,0,0], id: 'pc', name: 'parsec', k:3.08567758149137e16, SI: false, prefix: '+'},
	{v: [1,0,0,0,0,0,0], id: 'ly', name: 'light-year', k:9460730472580800, SI: false, prefix: '+'},

	{v: [2,0,0,0,0,0,0], id: 'a', name: 'ar', k:100, SI: true, prefix: '+'},
	{v: [2,0,0,0,0,0,0], id: 'ac', name: 'acre', k:4046.872, SI: false, prefix: '0'},

	{v: [3,0,0,0,0,0,0], id: 'l', name: 'litre', k:1e-3, SI: true, prefix: 'all'},
	{v: [3,0,0,0,0,0,0], id: 'pt', name: 'pint', k:568.261e-6, SI: false, prefix: '0'},
	{v: [3,0,0,0,0,0,0], id: 'gal', name: 'gallon', k:4.54609e-3, SI: false, prefix: '0'},

	{v: [0,1,0,0,0,0,0], id: 'g', name: 'gram', k:1e-3, SI: true, prefix: 'all'},
	{v: [0,1,0,0,0,0,0], id: 't', name: 'tonne', k:1000, SI: false, prefix: '+'},
	{v: [0,1,0,0,0,0,0], id: 'gr', name: 'grain', k:64.79891e-6, SI: false, prefix: '0'},
	{v: [0,1,0,0,0,0,0], id: 'oz', name: 'ounce', k:28.349523e-3, SI: false, prefix: '0'},
	{v: [0,1,0,0,0,0,0], id: 'lb', name: 'pound', k:0.45359237, SI: false, prefix: '0'},
	{v: [0,1,0,0,0,0,0], id: 'slug', name: 'slug', k:14.593903, SI: false, prefix: '0'},
	{v: [0,1,0,0,0,0,0], id: 'ts', name: 'short ton', k:907.18474, SI: false, prefix: '0'},
	{v: [0,1,0,0,0,0,0], id: 'tl', name: 'long ton', k:1016, SI: false, prefix: '0'},
	{v: [0,1,0,0,0,0,0], id: 'u', name: 'unified atomic mass unit', k:1.660539040e-27, SI: false, prefix: '0', note: 'Same as dalton (Da)'},
	{v: [0,1,0,0,0,0,0], id: 'Da', name: 'dalton', k:1.660539040e-27, SI: false, prefix: '0', note: 'Same as unified atomic mass unit (u)'},

	{v: [1,0,-1,0,0,0,0], id: 'mph', name: 'mile per hour', k:1609.344/3600, SI: false, prefix: '0'},
	{v: [1,0,-1,0,0,0,0], id: 'kn', name: 'knot', k:1852/3600, SI: false, prefix: '0'},

	{v: [1,0,-2,0,0,0,0], id: 'gn', name: 'standard gravity', k:9.80665, SI: false, prefix: '0'},

	{v: [2,1,-2,0,0,0,0], id: 'eV', name: 'electronvolt', k:1.60217653e-19, SI: false, prefix: 'all'},

	{v: [-1,1,-2,0,0,0,0], id: 'bar', name: 'bar', k:1e5, SI: true, prefix: 'all'},
	{v: [-1,1,-2,0,0,0,0], id: 'atm', name: 'atmospehre', k:101325, SI: false, prefix: '0'},
	{v: [-1,1,-2,0,0,0,0], id: 'mmHg', name: 'milimetre of mercury', k:133.322387415, SI: false, prefix: '0', note: 'There is a negligible difference between mmHg and torr.'},
	{v: [-1,1,-2,0,0,0,0], id: 'Torr', name: 'torr', k:101325/760, SI: false, prefix: 'all', note: 'There is a negligible difference between mmHg and torr.'},
	{v: [-1,1,-2,0,0,0,0], id: 'psi', name: 'pound per square inch', k:6894.757, SI: false, prefix: 'all'},

	{v: [0,1,-2,-1,0,0,0], id: 'G', name: 'gauss', k:0.0001, SI: false, prefix: 'all'},
];

//standard SI prefixes
const Prefixes = [
	{id: 'a', v: -18},
	{id: 'f', v: -15},
	{id: 'p', v: -12},
	{id: 'n', v: -9},
	{id: 'u', v: -6},
	{id: 'm', v: -3},
	{id: 'c', v: -2},
	{id: 'd', v: -1},
	{id: 'h', v: 2},
	{id: 'k', v: 3},
	{id: 'M', v: 6},
	{id: 'G', v: 9},
	{id: 'T', v: 12},
	{id: 'P', v: 15}
];

//utility to access DOM easier.
function geto(id){
	return document.getElementById(id);
}

//GUI function to switch tabs
function view(what) {
	for(let t of document.getElementsByClassName('tab')) {
		t.style.display = (t.id === what) ? 'block' : 'none';
	}
}

/*
	HELP function. First it lists all prefixes.
	Then it lists all units: name, code, their dimension represented by basic SI and info: whether they are SI, basic SI, what prefixes are recommended and a note (for the ambiguous cases).
	Then it shows the help section.
*/
function help() {
	//list of all prefixes
	let text = '<h2>Prefixes</h2> prefix (exponent):<br>';
	for(let o of Prefixes) {
		text += o.id + ' (' + o.v + '), ';
	}
	text = text.replace(/, $/ , '');
	text += '<hr><h2>Units</h2>';

	//filter for units - it gets the value of filter textfield and checks it. If there isn't any filter unit, else executes - all units will be listed.
	let filter = geto('filter').value.trim();
	if(filter !== '') {
		//it parses the filter unit into detailed unit object and then into aggregate vector. See convert.init() of explanation
		convert.parseField(filter);
		let filterVector = convert.SI();

		//it filters all units. The filter function will check all dimensions and if they all agree, it is a related unit and it will pass the filter.
		unitList = Units.filter(function(item) {
			for(let i in item.v) {
				if(item.v[i] !== filterVector[i]) {return false;}
			}
			return true;
		});
	}
	else {
		unitList = Units;
	}

	//now we have the list of units we want to write
	for(let o of unitList) {
		text += '<b>' + o.name + '</b> (' + o.id + ')';
		//vector2text will be important later. It converts vector to text representation, like [1,1,-2] to m*kg*s^-2
		text += o.basic ? ' ' : ' = ' + o.k + '*' + convert.vector2text(o.v) + '<br>';
		text += o.basic ? 'Basic ' : '';
		text += o.SI ? 'SI, ' : '';

		if(o.prefix === 'all') {
			text += 'all prefixes can be used.';
		}
		else if(o.prefix === '+') {
			text += 'usually only increasing prefixes are used.';
		}
		else if(o.prefix === '-') {
			text += 'usually only decreasing prefixes are used.';
		}
		else {
			text += 'prefixes are not used.';
		}

		text += o.note ? (' ' + o.note) : '';
		text += '<br><br>';
	}
	geto('helpContents').innerHTML = text;
}

//this listens to onkeyup in text fields and executes the program if the key is an Enter
function listen(event) {
	if(event.keyCode !== 13) {return;}
	convert.init();
}

function listenFilter(event) {
	if(event.keyCode !== 13) {return;}
	help();
}





/*
	What you just read were just auxiliary functions. Here comes the
		CONVERT OBJECT
	that does all of the heavy lifting.
	It contains functions and state variables
*/
let convert = {

	//status means 0 = OK, 1 = warnings, 2 = fatal error. Status text will contain error or warning messages.
	status: 0,
	statusText: '',

	//err and warn are for writing messages to statusText. Err works only for one message, warn will concatenate them.
	//That's because when an error occurs, it might trigger another, so user is only informed about the first error encountered.
	err: function(text) {
		this.status = 2;
		this.statusText = '<div class="err">' + text + '</div><br>';
	},
	warn: function(text) {
		this.status = (this.status === 0) ? 1 : this.status;
		this.statusText += '<div class="warn">' + text + '</div><br>';
	},
	//this will check if everything is ok or not and write the final message about status
	ok: function() {
		if(this.status === 0) {
			this.statusText += '<div class="ok">OK</div>';
		}
		geto('status').innerHTML = '<br><b>Status:</b><br>' + this.statusText;
	},

	//this is the central function that determines the program flow. It uses many other functions, they will be properly described later
	init: function() {
		this.status = 0;
		this.statusText = '';
		let input = geto('input').value.trim();
		let target = geto('target').value.trim();
		
		/*
		unit is represented by four kinds of data type:
			1. text representation is parsed from input and then recreated in the end (vars target, SIunit)
			2. detailed object, the result of parsing both input and target. It is stored in this.unit.
				structure: array of all units, each represented by: [{reference to a prefix object or number 1}, {reference to a unit object}, power number]
			3. aggregate vector. It's like the vector of units, but this is aggregated vector of the whole unit
			4. aggregate unit - it is the conversion value of the whole unit (its value in basic SI). For example min^-2 = 60^-2 s
		*/

		//this initiates vars that describe target value. Targetted means whether there is a target unit or not. If the user didn't enter any, the computations related to target unit are not executed.
		let targetAggregateUnit = 1;
		let targetAggregateVector;
		let targetted = false;
		if(target !== '' && target !== '1') {targetted = true;}
		if(targetted) {
			//parseField is the largest function, it parses the numerical value (not important now) and stores it in this.num. Then it parses text representation of unit to detailed object and stores it in this.units
			this.parseField(target);
			if(this.status === 2) {this.ok();return}
			//enumerate will read detailed object from this.units, numerate the aggregate unit and returns it
			targetAggregateUnit = this.enumerate();
			//SI will read detailed object from this.units, enumerate the aggregate vector and returns it
			targetAggregateVector = this.SI();
		}

		//these are the same operations as before, this time done with input. this.num & this.units from target unit are overwritten, they are not important anymore.
		this.parseField(input);
		if(this.status === 2) {this.ok();return}
		let aggregateUnit = this.enumerate();
		let aggregateVector = this.SI();
		//vector2text converts vector of unit to it's text representation in basic SI units
		let SIunit = this.vector2text(aggregateVector);

		//DimAnalysis will check the vectors of target and input. It will result [ok or not, vector of differences]
		if(targetted) {
			let result = this.DimAnalysis(aggregateVector, targetAggregateVector);
			//if there has been a discrepancy (vector of differences will be non-zero), vector of differences will be converted to text and sticked to the target unit
			target += result[0] ? '' : ('*' + this.vector2text(result[1]));
		}
		
		/*
			This is the final piece of code. It enumerates the output numerical value (input numerical value times its aggregate unit divided by target aggregate unit (is 1 if there is no target unit)).
			<NOPE>Then it rounds the output to "significant digits" (kind of).</NOPE> Then it adds either original unit converted to basic SI or to the corrected target unit.
			ok() checks the status and writes about it
		*/
		geto('output').innerHTML = this.num*aggregateUnit/targetAggregateUnit + ' ' + (targetted ? target : SIunit);
		this.ok();
	},

	//the largest function, parses the text. It parses the numerical value and stores it in this.num. Then it parses text representation of unit to detailed object and stores it in this.units
	parseField: function(text) {
		if(text === '') {
			this.err('ERROR: No input detected!');return;
		}

		//bad things must go away
		text = text.replace(/,/g , '.').replace(/  /g , ' ');

		//it will try to match numerical part. If it exists, it is stored in this.num and removed from text. Else it is one
		let numStr = text.match(/^[\d\.\-\+e]+/);
		if(numStr) {
			numStr = numStr[0];
			this.num = Number(numStr);
			text = text.slice(numStr.length);

			//is the numerical part a sensible number?
			if(isNaN(this.num)) {
				this.err('ERROR: Cannot parse numerical part!');return;
			}
		}
		else {
			this.num = 1;
		}

		if(text.length === 0) {
			this.warn('WARNING: There is no unit detected. I don\'t know what do you expect from the program...');
			this.units = [];return;
		}

		//all parts of text that might mean something are divided by either space, * or /. But unlike regular split, the delimiters are kept in the array (because we need to distinguish between * and /)
		let members = text.split(/([*/ ])/);

		//all delimiters at the beginning are removed. A slash shouldn't be found there!
		while(['',' ','*','/'].indexOf(members[0]) > -1) {
			if(members[0] === '/') {
				this.warn('WARNING: Unexpected slash sign after numerical part, it is regarded as a space.');
			}
			members.shift();
		}

		//now we are getting to parsing units.
		//ids and prefs are arrays of the abbreviations. We can later search those auxiliary arrays with indexOf and use the index to get the unit or prefix from the original array
		this.units = [];
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
					this.err('ERROR: Cannot parse unit power (' + m.slice(powIndex) + ')!');return;
				}
				power *= pow2;
				m = m.slice(0, powIndex);
			}

			//now that we stripped the power, there shouldn't be any number in the unit
			if(m.search(/\d/) !== -1) {
				this.err('ERROR: Units cannot contain numbers (' + m +')!');return;
			}

			//first we try to find the unit in ids. If we are successful we go to else.
			let i = ids.indexOf(m);
			if(i === -1) {
				//there might be a prefix. First letter is stripped and we search for units without it. We also search the prefixes for the first letter
				i = ids.indexOf(m.slice(1))
				j = prefs.indexOf(m[0]);

				//if we find both, we add the unit with its prefix and check whether its appropriately used. If we didn't find i or j, the unit is unknown.
				if(i === -1 || j === -1) {
					this.err('ERROR: Unit ' + m + ' not identified!');return;
				}
				else {
					this.units.push([Prefixes[j], Units[i], power]);
					this.checkPrefix([Prefixes[j], Units[i]]);
				}
			}
			//unit is added with prefix equal to 1
			else {
				this.units.push([1, Units[i], power]);
			}

		}
	},

	//checkPrefix accepts pair [prefix object, unit object] and gives warnings if they are not appropriately used.
	checkPrefix: function(arg) {
		if(arg[1].prefix === '0') {
			this.warn('WARNING: Unit ' + arg[1].id + ' (' + arg[1].name + ') doesn\'t usually have any prefixes, yet ' + arg[0].id + ' identified!')
		}
		else if(arg[1].prefix === '+' && arg[0].v < 0) {
			this.warn('WARNING: Unit ' + arg[1].id + ' (' + arg[1].name + ') doesn\'t usually have decreasing prefixes, yet ' + arg[0].id + ' identified!')
		}
		else if(arg[1].prefix === '-' && arg[0].v > 0) {
			this.warn('WARNING: Unit ' + arg[1].id + ' (' + arg[1].name + ') doesn\'t usually have increasing prefixes, yet ' + arg[0].id + ' identified!')
		}
	},

	//enumerate reads the detailed unit object from this.units and enumerates the aggregate unit.
	enumerate: function() {
		let aggregateUnit = 1;
		let current = 1;

		//foreach unit we check prefix and if it is an object (not number 1), read it and raise it to power. Then we raise the unit coeficient to power and multiply the aggregateUnit with all of it.
		for (u of this.units) {
			current = 1;
			if(typeof u[0] === 'object') {
				current *= Math.pow(10 , u[0].v*u[2]);
			}
			current *= Math.pow(u[1].k, u[2]);
			aggregateUnit *= current;
		}
		return aggregateUnit;
	},

	//SI reads the detailed unit object from this.units and enumerates the aggregate vector.
	SI: function() {
		let aggregateVector = [0,0,0,0,0,0,0];
		
		//foreach unit we add vector of its units multiplied by power
		for(let u of this.units) {
			for(i in u[1].v) {
				if(u[1].v.hasOwnProperty(i)) {
					aggregateVector[i] += u[1].v[i] * u[2];
				}
			}
		}
		return aggregateVector;
	},

	//vector2text will convert unit vector into text representation. 
	vector2text: function(vect) {
		//first we filter all basic units, they are important
		let text = '';
		let basic = Units.filter(item => item.basic);

		//foreach dimension of the vector we check if its nonzero. If it is, we find the corresponding basic unit and add its id. If it is not 1, we add power and stick an asterisk at the end.
		for(let i in vect) {
			if(vect.hasOwnProperty(i)) {
				if(vect[i] !== 0){
					text += basic.filter(item => item.v[i] === 1)[0].id;
					if(vect[i] !== 1) {
						text += '^' + vect[i];
					}
					text += '*';
				}
			}
		}
		//the last asterisk gets removed
		text = text.replace(/\*$/, '');
		return text;
	},

	//DimAnalysis will take vector of input and target. OK represents whether everything is ok. Faults is array of id of dimensions that don't fit. Corr is the correction vector - power of basic units we have to add.
	DimAnalysis: function(source, target) {
		let corr = [0,0,0,0,0,0,0];
		let OK = true;
		let basic = Units.filter(item => item.basic);
		let faults = [];

		//foreach dimension we check if it is equal. If it isn't, it's not OK. We enumerate correction and add a fault.
		for(let i in corr) {
			if(corr.hasOwnProperty(i)) {
				if(source[i] !== target[i]) {
					corr[i] = source[i] - target[i];
					faults.push(basic.filter(item => item.v[i] === 1)[0].id);
					OK = false;
				}
			}
		}
		//nicely written warning
		if(faults.length > 0) {
			this.warn('WARNING: Units from input and target don\'t match. These basic units have been added: ' + faults.join(', ') + '.');
		}
		
		return [OK, corr];
	}
};
