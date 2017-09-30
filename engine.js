/*
	UUC engine
*/

window.onload = function() {
	view('intro');
	help();
	ECMA6test();
	loadCurrencies();
};

//test availability of ECMA6 with a sample code
function ECMA6test() {
	try {
		eval('const a=[1,2];for(let i of a){};a.map(i => i);');
	}
	catch(err) {
		alert('ERROR:\n Sorry, but unfortunately you seem to be using a very old browser which doesn\'t support ECMA6 javascript.\n The application will not work at all!');
	}
}

//utility to access DOM easier.
function geto(id){
	return document.getElementById(id);
}

//GUI function to switch tabs
function view(what) {
	let tabs = document.getElementsByClassName('tab');
	for(let t of tabs) {
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
	let text = '<h2>Prefixes (exponents):</h2>';
	for(let o of Prefixes) {
		text += o.id + ' (' + o.v + '), ';
	}
	text = text.replace(/, $/ , '');
	text += '<hr><h2>Units</h2>';
	text += 'There are ' + Units.filter(item => !item.constant).length + ' units and ' + Units.filter(item => item.constant).length + ' constants in database!<br>';

	//callback used to filter units. The filter function will check all dimensions of unit (item) and if they all agree with filterVector, it is a related unit and it will pass the filter.
	let filterVector;
	let filterFunction = function(item) {
		for(let i in item.v) {
			if(item.v[i] !== filterVector[i]) {return false;}
		}
		return true;
	};

	//filter for units - it gets the value of filter textfield and checks it. If there isn't any filter unit, else executes - all units will be listed.
	let filter = geto('filter').value.trim();
	if(filter === '1') {
		//Filters all dimensionless units using filterFunction
		filterVector = new Array(8).fill(0);
		unitList = Units.filter(filterFunction);
	}
	else if(filter === '_') {
		unitList = Units.filter(item => item.constant);
	}
	else if(filter !== '') {
		//it parses the filter unit into detailed unit object and then into aggregate vector. See convert.init() of explanation. Then it filters all units using filterFunction
		convert.status = 0;
		convert.parseField(filter);
		filterVector = convert.SI();
		unitList = (convert.status === 2) ? Units : Units.filter(filterFunction);
	}
	else {
		unitList = Units;
	}

	text += unitList.length + ' items are listed.<br><br>';

	//now we have the list of units we want to write
	for(let o of unitList) {
		text += '<b>' + o.name + '</b> (' + o.id + ')';
		//vector2text will be important later. It converts vector to text representation, like [1,1,-2] to m*kg*s^-2
		text += o.basic ? ' ' : ' = ' + o.k + ' ' + convert.vector2text(o.v) + '<br>';

		if(o.constant) {
			text += 'Constant.';
		}
		else {
			text += o.basic ? 'Basic, ' : '';
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
		}

		text += o.note ? (' ' + o.note) : '';
		text += '<br><br>';
	}
	geto('helpContents').innerHTML = text;
}

//these functions listens to onkeyup in text fields and executes the program if the key is an Enter
//input & target
function listen(event) {
	if(event.keyCode !== 13) {return;}
	convert.init();
}

//filter input
function listenFilter(event) {
	if(event.keyCode !== 13) {return;}
	help();
}

//load currency exchange rates from a public API, fill the results in Currency array and concatenate Currency onto Units.
//http://api.fixer.io/latest?base=USD
function loadCurrencies() {
	let url = 'currencies.php';
	let xobj = new XMLHttpRequest();
	xobj.open('GET', url, true);
	xobj.overrideMimeType('application/json');
	xobj.send(null);
	xobj.onreadystatechange = function() {
		if(xobj.readyState === 4 && xobj.status === 200) {
			let res = JSON.parse(xobj.responseText);
			for(let c of Currency) {
				if(res.rates.hasOwnProperty(c.id)) {
					c.k = 1/res.rates[c.id];
					c.v = [0,0,0,0,0,0,0,1];
				}
			}
			Currency = Currency.filter(item => item.k);
			Units = Units.concat(Currency);
			help();
		}
	};
}

//Maintenance function that cannot be accessed by GUI. Conflicts are written in debug div. Quadratic time complexity (in relation to Units)
function unitConflicts() {

	//determine whether there is conflict between two given unit objects
	let determineConflict = function(u, i) {

		//same ID, that's the worst that can happen
		if(u.id === i.id) {
			conflicts.unshift(`HARD CONFLICT: ${u.id} (${u.name}) = ${i.id} (${i.name})`);
			return;
		}

		//conflict of a unit with prefix with another unit. IF u.id is at the end of i.id
		let index = i.id.search(u.id);
		if(
			index > -1 &&
			(index + u.id.length) === i.id.length
		) {
			let id = i.id.replace(u.id, '');
			for(let p of Prefixes) {
				if(p.id === id) {
					if(
						u.prefix === 'all' ||
						(u.prefix === '+' && p.v > 0) ||
						(u.prefix === '-' && p.v < 0)
					) {
						conflicts.unshift(`CONFLICT OF A PREFIX: ${p.id}${u.id} (${p.id} ${u.name}) = ${i.id} (${i.name})`);
						break;
					}
					else {
						conflicts.push(`conflict of a deprecated prefix: ${p.id}${u.id} (${p.id} ${u.name}) = ${i.id} (${i.name})`);
						break;
					}
					break;
				}
			}
		}
	};

	//two for cycles through Units, determineConflict is applied to each pair (pair of a unit with itself is excluded)
	let conflicts = [];
	for(let u in Units) {
		if(Units.hasOwnProperty(u)) {
			for(let i in Units) {
				if(Units.hasOwnProperty(i) && i !== u) {
					determineConflict(Units[u], Units[i]);
				}
			}
		}
	}
	geto('debug').innerHTML = conflicts.length + ' conflicts<br>' + conflicts.join('<br>');
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
		geto('output').innerHTML = '';
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
		text = text.replace(/,/g , '.').replace(/\s+/g , '');

		//it will try to match numerical part. If it exists, it is stored in this.num and removed from text. Else it is one
		let numStr = text.match(/^-?[\d\.]+e?[\-\d]*/);
		if(numStr) {
			numStr = numStr[0];
			if(numStr[numStr.length - 1] === 'e') {
				numStr = numStr.slice(0,-1);
			}
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

		//dimensionless units
		if(text.length === 0) {
			this.units = [];return;
		}

		//all parts of text that might mean something are divided by * or /. But unlike regular split, the delimiters are kept in the array (because we need to distinguish between * and /)
		let members = text.split(/([*/])/);

		//all delimiters at the beginning are removed. A slash shouldn't be found there!
		while(['','*','/'].indexOf(members[0]) > -1) {
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
		if(!arg[1].prefix || arg[1].prefix === '0') {
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
		let aggregateVector = new Array(8).fill(0);;
		
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
		let corr = new Array(8).fill(0);
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
			this.warn('WARNING: Dimensions of units from input and target don\'t match. These basic units have been added: ' + faults.join(', ') + '.');
		}
		
		return [OK, corr];
	}
};
