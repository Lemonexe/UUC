/*
	middle.js
	contains functions related to view & controller, which are not present in convert object anymore
*/

let middle = {
	err: function(text) {
		convert.status = 2;
		convert.statusText = '<div class="err">' + text + '</div><br>';
		geto('output').innerHTML = '';
	},
	warn: function(text) {
		convert.status = (convert.status === 0) ? 1 : convert.status;
		convert.statusText += '<div class="warn">' + text + '</div><br>';
	},
	//this function will check if everything is ok or not and write the final message about status
	finish: function() {
		if(convert.status === 0) {
			convert.statusText += '<div class="ok">OK</div>';
		}
		geto('status').innerHTML = '<br><b>Status:</b><br>' + convert.statusText;
	},

	//process input (so it can be fed to convert)
	processInput: function(arg) {
		let input = geto(arg).value
			.trim()
			.replace(/,/g , '.')
			.replace(/\s+/g , '');
		return input;
	},

	//simply write the result of conversion
	writeResult: function(result) {geto('output').innerHTML = result;},

	//these functions listens to onkeyup in text fields and executes the program if the key is an Enter
	//input & target
	listen: function(event) {
		if(event.keyCode === 13 || event.key === 'Enter') {
			convert.init();
		}
	},

	//filter input
	listenFilter: function(event) {
		if(event.keyCode === 13 || event.key === 'Enter') {
			this.help();
		}
	},

	//GUI function to switch tabs
	view: function(what) {
		let tabs = document.getElementsByClassName('tab');
		for(let t of tabs) {
			t.style.display = (t.id === what) ? 'block' : 'none';
		}
	},

	/*
		HELP function. First it lists all prefixes.
		Then it lists all units: name, code, their dimension represented by basic SI and info: whether they are SI, basic SI, what prefixes are recommended and a note (for the ambiguous cases).
		Then it shows the help section.
	*/
	help: function() {
		let unitList = this.getUnitList();
		//statistics
		let constantCount = Units.filter(item => !item.constant).length;
		let unitCount = Units.filter(item => item.constant).length;
		//list of all prefixes
		let prefixesText = Prefixes.map(o => `${o.id} (${o.v})`).join(', ');

		let text = `<h2>Prefixes (exponents):</h2>
			${prefixesText}<hr>
			<h2>Units</h2>
			<p>There are ${unitCount} units and ${constantCount} constants in database!<br>
			${unitList.length} items are listed.</p>`;

		//now we have the list of units we want to write
		for(let unit of unitList) {
			text += this.buildUnitEntry(unit);
		}
		geto('helpContents').innerHTML = text;
	},

	//get a list of units filtered using the filter field
	getUnitList: function() {
		//callback fed to Array.filter, it will check all dimensions of unit (item) and if they all agree with filterVector, it is a related unit and it will pass the filter.
		let filterFunction = function(item) {
			for(let i in item.v) {
				if(item.v[i] !== filterVector[i]) {return false;}
			}
			return true;
		};

		//filter for units - it gets the value of filter textfield and checks it. If there isn't any filter unit, else executes - all units will be listed.
		let filterVector;
		let filter = this.processInput('filter');
		//dimensionless units
		if(filter === '1') {
			filterVector = new Array(8).fill(0);
			return Units.filter(filterFunction);
		}
		//constants
		else if(filter === '_') {
			return Units.filter(item => item.constant);
		}
		//specific dimension
		else if(filter !== '') {
			//it parses the filter unit into detailed unit object and then into aggregate vector. See convert.init() of explanation. Then it filters all units using filterFunction
			convert.status = 0;
			let obj = convert.parseField(filter);
			convert.SI(obj);
			filterVector = obj.aggregateVector;
			return ((convert.status === 2) ? [] : Units.filter(filterFunction));
		}
		else {
			return Units;
		}
	},

	buildUnitEntry: function(unit) {
		let text = `<p><b>${unit.name}</b> (${unit.id})`;

		//vector2text converts vector to text representation, like [1,1,-2] to m*kg*s^-2
		text += unit.basic ? ' ' : ' = ' + unit.k + ' ' + convert.vector2text(unit.v) + '<br>';

		if(unit.constant) {
			text += 'Constant.';
		}
		else {
			text += unit.basic ? 'Basic, ' : '';
			text += unit.SI ? 'SI, ' : '';

			if(unit.prefix === 'all') {
				text += 'all prefixes can be used.';
			}
			else if(unit.prefix === '+') {
				text += 'usually only increasing prefixes are used.';
			}
			else if(unit.prefix === '-') {
				text += 'usually only decreasing prefixes are used.';
			}
			else {
				text += 'prefixes are not used.';
			}
		}

		text += unit.note ? (' ' + unit.note) : '';
		text += '</p>';
		return text;
	}
};
