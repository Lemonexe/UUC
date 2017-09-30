/*
	core.js
	here are auxiliary function, ubiquitous utils etc.
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
	let url = 'app/currencies.php';
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
