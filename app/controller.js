/*
	controller.js
	contains the Angular module and controller, which serves as view & controller for the application
*/

const app = angular.module('UUC', []);
langService.init();
app.controller('ctrl', function($scope, $http, $timeout) {
	//INITIALIZE
	$scope.CS = CS; //permanent controller state that is saved
	$scope.ctrl = {autocomplete: -1}; //temporary controller state
	loadCurrencies(execHash);

	//generate ng-style for inputCode textarea
	$scope.textareaStyle = () => ({width: CS.inputCodeWidth || '350px', height: CS.inputCodeHeight || '150px'});
	//generate ng-style for currently active tab button
	$scope.tabButtonStyle = tab => CS.tab === tab ? ({'border-bottom': '3px solid white'}) : ({});
	//generate ng-style for tutorial window
	$scope.tutorialStyle = () => ({top: CS.tutorial.top+'px', left: CS.tutorial.left+'px', width: CS.tutorial.width+'px'});

	//get available screen size for resizing purposes
	const getWindowDimensions = () => ({
		height: window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight,
		width: window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth
	});

	//switch language, switch tab
	$scope.changeLang = function(lang) {
		CS.lang = lang;
		$scope.populateConvertMessages();
	};
	$scope.changeTab = function(tab) {
		tab === 'intro' && (CS.hideTutorialLink = true);
		CS.tab = tab;
	}

	//just an informative string to show how to bind UUC as a search engine in Chrome
	$scope.searchEngineTemplate = window.location.origin.replace(/\/$/, '') + window.location.pathname.replace(/\/$/, '') + '/#%s';
	//list of available prefixes
	$scope.prefixText = Prefixes.map(o => `${o.id} (${o.v})`).join(', ');
	//link for github documentation on macros
	$scope.documentation = 'https://github.com/Lemonexe/UUC/blob/master/_dev/macro.md';
	//hide image sources from dumb robots
	$scope.imgSrcCZ = 'res/CZ.png'; $scope.imgSrcEN = 'res/EN.png';

	//initialize conversion
	$scope.fullConversion = function() {
		$scope.result = convert.fullConversion(CS.input, CS.target);
		$scope.result.output = convert.format($scope.result.output, CS.params);
		add2history();

		//style the results
		$scope.statusClass = ['ok', 'warn', 'err'][$scope.result.status];
		$scope.statusAppear = 'statusAppear';
		$timeout(() => ($scope.statusAppear = ''), 500);
	};
	//add the conversion request to history
	function add2history() {
		if(CS.input === '') {return;}
		if(CS.history.length > 0 && CS.input === CS.history[0].input && CS.target === CS.history[0].target) {CS.history[0].params = angular.copy(CS.params); return;} //just update the params if strings are unchanged
		CS.history.unshift({input: CS.input, target: CS.target, params: angular.copy(CS.params)}); //or add a new entry
		CS.history = CS.history.filter((o,i) => (i === 0) || o.input !== CS.input || o.target !== CS.target); //remove duplicates further down
		(CS.history.length > 10) && CS.history.pop(); //and perhaps delete the old ones
	}
	//when a user changes format settings, there is no need to initialize conversion again
	$scope.updateFormat = () => {add2history(); $scope.result && ($scope.result.output = convert.format($scope.result.output, CS.params));};

	//flip input & target field
	$scope.flip = function() {
		const i = CS.input;
		CS.input = CS.target;
		CS.target = i;
	};

	//recall from history using the autocomplete dropdown list
	$scope.autocomplete = function(type) {//type 0: choose from dropdown, 1: go down, 2: go up
		function execKey() {
			(type === 1) && ctrl.autocomplete++;
			(type === 2) && ctrl.autocomplete--;
		}

		let ctrl = $scope.ctrl;
		if(ctrl.autocomplete === -1) {
			if(type === 0) {return;} //user has clicked the "empty option", and thus chosen to retain current input
			add2history(); execKey(); //type 1,2: save the current input that hasn't been sent yet, so the user doesn't lose it!
		}

		let len = CS.history.length;
		execKey();
		//cycle back to beginning or to end
		(ctrl.autocomplete < 0)    && (ctrl.autocomplete = len-1);
		(ctrl.autocomplete >= len) && (ctrl.autocomplete = 0);
		//load the entry
		let obj = CS.history[ctrl.autocomplete];
		[CS.input, CS.target, CS.params] = [obj.input, obj.target, angular.copy(obj.params)];
	};
	//reset the currently selected history entry
	$scope.autoforget = () => ($scope.ctrl.autocomplete = -1);

	//this function, well, it runs a code
	$scope.runCode = () => ($scope.resultCode = convert.runCode(CS.inputCode));

	//populate database of messages with strings or functions in current language
	$scope.populateConvertMessages = function() {Object.keys(convert.msgDB).forEach(key => (convert.msgDB[key] = langService.trans(key)));}
	$scope.populateConvertMessages();

	//these functions listen to onkeyup in various text fields

	//input & target field: perform fullConversion on Enter
	$scope.listenForConvert = function(event) {
		if(event.keyCode === 13 || event.key === 'Enter') {$scope.fullConversion();}
		else if(event.keyCode === 40 || event.key === 'ArrowDown') {$scope.autocomplete(1);}
		else if(event.keyCode === 38 || event.key === 'ArrowUp') {$scope.autocomplete(2);}
	};
	//macro code field: run code on F2
	$scope.listenForRun = event => (event.keyCode === 113 || event.key === 'F2') && $scope.runCode();


	/*
		HELP, this section of code is dedicated to Reference!
	*/
	$scope.Units = Units; //current unit list view to be displayed
	$scope.highlightFirst = false; //whether to highlight the first one as a match
	$scope.databaseCount = Units.length; //total unit count

	//detect change in filter text field
	$scope.listenForHelp = () => ($scope.Units = getUnitList());

	//get a list of units filtered using the filter text field
	function getUnitList() {
		$scope.highlightFirst = false;
		//callback fed to Array.sort, it will move matched unit to the top
		const sortMatchedUnit = (a, b) => (a.id === sortID) ? -1 : (b.id === sortID) ? 1 : 0;
		//reduce callback to find filter string in unit name
		const reduceNameCb = (acc, o) => acc || o.indexOf(fs.toLowerCase()) === 0;
		//match vector of Q instance against filter vector
		const filterFunction = q => q.v.reduce((acc, o, i) => acc && o === fv[i], true);

		let fv; //filter vector
		let fs = CS.filter; //filter string
		let sortID; //ID of matched unit (it will be sorted to the top)

		//search for constants
		if(fs === '_') {return Units.filter(item => item.constant);}

		//search for a specific dimension
		if(fs !== '') {
			//parse filter string into Q instance, which may also contain unit id
			const q = convert.parseQ(fs);
			convert.clearStatus();

			//if unit wasn't successfully parsed, program tries to find unit by name using the literal value of filter text field
			if(!q) {
				//split unit name into words and try to match filter string at beginning of words
				const nameSearch = Units.find(item => item.name[CS.lang].toLowerCase().split(' ').reduce(reduceNameCb, false));

				//attempt to find unit by name failed, collection will be empty
				if(!nameSearch) {return [];}
				//unit was found, so filter all units with the same dimension, sort the matched unit to the top and highlight it
				fv = nameSearch.v;
				sortID = nameSearch.id;
				$scope.highlightFirst = true;
				return Units.filter(filterFunction).sort(sortMatchedUnit);
			}

			//if filter string was successfully parsed into Q instance, filter by its vector
			fv = q.v;
			const unitList = Units.filter(filterFunction);

			//if the input was exactly one unit, sort it to the top and highlight it
			if(q.id) {
				sortID = q.id;
				$scope.highlightFirst = true;
				return unitList.sort(sortMatchedUnit);
			}
			return unitList;
		}

		//no filter criterion specified, so all units will be listed
		return Units;
	}

	//each unit is described by dimension represented by basic SI and info:
	//whether it is a constant, SI, basic SI, what prefixes are recommended and possibly a note
	$scope.buildUnitEntry = function(unit) {
		const aliases = unit.alias ? ', '+unit.alias.join(', ') : '';
		let text = ` (${unit.id + aliases}) `;
		//vector2text converts vector to text representation, like [1,1,-2] to m*kg*s^-2
		text += unit.basic ? '' : ` = ${unit.k} ${convert.vector2text(unit.v)}\n`;

		if(unit.constant) {
			text += 'Konstanta.'.trans();
		}
		else {
			text += unit.basic ? 'Základní, '.trans() : '';
			text += unit.SI ? 'SI, ' : '';
			switch(unit.prefix) {
				case 'all': text += 'všechny předpony mohou být použity.'.trans('prefixAll'); break;
				case '+': text += 'většinou se používají jen zvětšující předpony.'.trans('prefix+'); break;
				case '-': text += 'většinou se používají jen zmenšující předpony.'.trans('prefix-'); break;
				default: text += 'předpony se nepoužívají.'.trans('prefix0');
			}
		}

		text += unit.note ? (' ' + unit.note[CS.lang]) : '';
		return text;
	};

	/*
		MISC FUNCTIONS
	*/
	//load currency exchange rates from a public API (see currencies.php), process the results and append the currencies to Units
	function loadCurrencies(callback) {
		$http.get('app/currencies.php').then(function(res) {
			if(res.status !== 200) {return;}

			const USDk = res.data.rates['USD']; //because default base is EUR while UUC is USD-centric
			const timestamp = new Date(res.data.timestamp * 1000);
			$scope.currencyTimestamp = timestamp.toLocaleDateString() + ' ' + timestamp.toLocaleTimeString();

			//fill values for all currencies
			for(let c of Currencies) {
				if(!res.data.rates.hasOwnProperty(c.id)) {continue;}
				c.k = USDk / res.data.rates[c.id];
				c.v = [0,0,0,0,0,0,0,1];
				c.prefix = '+';
				if(!c.alias) {c.alias = [];}
				c.alias.push(c.id.toLowerCase()); //for all currencies enable lowercase id, because there's not really a convention
				Units.push(c);
			}

			//update help
			$scope.databaseCount = Units.length;
			$scope.listenForHelp();

			callback();
		}, callback);
	}

	//perform conversion from fragment identifier. Executed upon loading of currencies
	function execHash() {
		let hash = decodeURIComponent(window.location.hash).replace(/^.*#/, '');
		if(!hash) {return;}
		//'>', 'to' or 'into' is used to delimit input and target
		hash = hash.replace(/ to | into /g, '>');
		hash = hash.split(/>+/);
		hash.length > 2 && convert.warn(convert.msgDB['WARN_separators']);

		//detect input & target, feed them into full conversion
		CS.input = hash[0].trim();
		CS.target = hash[1] ? hash[1].trim() : '';
		$scope.fullConversion();
	}

	/*
		TUTORIAL functions
	*/
	//clear all, start the tutorial window and update outputs
	$scope.initTutorial = function() {
		CS.input = ''; CS.target = ''; CS.filter = ''; CS.showParams = false; CS.params.spec = 'auto'; CS.params.exp = false;
		CS.tutorial = {step: 0, top: 120, left: 400, width: 600}
		$scope.changeTab('converter'); $scope.listenForHelp(); $scope.fullConversion();
	};

	//initiate window dragging on mousedown
	$scope.dragStart = function($event) {
		$event.preventDefault();
		const ctrl = $scope.ctrl;
		ctrl.drag = true;
		//save initial coords of the mouse as well as the window
		[ctrl.dragX0, ctrl.dragY0] = [$event.clientX, $event.clientY];
		[ctrl.left0, ctrl.top0] = [CS.tutorial.left, CS.tutorial.top];
	};

	//drag the window
	$scope.mouseMove = function($event) {
		if(!$scope.ctrl.drag) {return;}
		const ctrl = $scope.ctrl; const CSt = CS.tutorial; const dim = getWindowDimensions();
		const margin = 5; const margin2 = 25; //top-left, bottom-right margin for window in [px]
		//move window by relative, not absolute coords, that is: initial coords + traveled distance
		CSt.left = ctrl.left0 + $event.clientX - ctrl.dragX0;
		CSt.top = ctrl.top0 + $event.clientY - ctrl.dragY0;
		//do not allow the window to exit screen
		(CSt.left < margin) && (CSt.left = margin);
		(CSt.top  < margin) && (CSt.top  = margin);
		(CSt.left + CSt.width > dim.width - margin2)  && (CSt.left = dim.width  - margin2 - CSt.width);
		(CSt.top + CSt.height > dim.height - margin2) && (CSt.top  = dim.height - margin2 - CSt.height);
	};

	//finish dragging the window onmouseup or onmouseleave
	$scope.mouseUp = () => ($scope.ctrl.drag = false);
	$scope.mouseLeave = function($event) {
		const dim = getWindowDimensions();
		($event.clientX < 0 || $event.clientY < 0 || $event.clientX > dim.width || $event.clientY > dim.height) && ($scope.ctrl.drag = false);
	};

	//TF = tutorial functions (advance the tutorial, operate UI, insert examples)
	$scope.TF = {
		step1: function() {CS.tutorial.step = 1; $scope.changeTab('help'); CS.tutorial.top = 200; CS.tutorial.left = 500;},
		step2: function() {CS.tutorial.step = 2; $scope.changeTab('converter'); CS.tutorial.top = 120; CS.tutorial.left = 400;},
		step6: function() {CS.tutorial.step = 6; $scope.changeTab('converter'); CS.tutorial.top = 260; CS.tutorial.left = 400; CS.showParams = true;},
		nextStep: function() {CS.tutorial.step++; $scope.changeTab('converter');},
		close: () => (CS.tutorial = null),
		//examples as array [input, target]
		examples: {
			SI: ['min', ''],
			simple: ['45 kPa', 'torr'],
			wrongCase: ['45 kPA', 'torr'],
			wrongSymbol: ['4.186 J/C/g ', 'Btu/F/lb'],
			okSymbol: ['4.186 J/°C/g ', 'Btu/°F/lb'],
			brackets: ['4.186 J/(°C*g) ', 'Btu/(°F lb)'],
			numbers: ['7,42e-3', '%'],
			spaces: ['  4   CZK / ( kW *h)  ', '€ / MJ'],
			powers: ['kg * m2 * s^(-3)', 'W'],
			radioactiveDecay: ['500 mg * _e^(-72 h / (8.0197 d))', 'mg'],
			volumeABC: ['18mm * 6.5cm * 22cm  +  0.2 l', 'ml'],
			charDim: ['(1,5 l)^(1/3)', 'cm'],
			pythagor: ['((53 cm)^2 + (295 mm)^2)^.5', 'in'],
			lbft: ['_g * lb * ft ', 'J'],
			kgcm2: ['kg * _g / cm2 ', 'psi'],
			poundal: ['lb * ft / s2 ', 'N'],
			oersted: ['T / _mu', 'Oe'],
			pi: ['45°', '_pi'],
			targetNumber: ['96', '12'],
			gasFlow: ['7000 Nm3 / h * 28 g/mol', 't/h'],
			gasConc: ['25 mg / Nm3 / (34 g/mol)', 'ppm'],
			barometric: ['atm * _e^(-37000ft * _g * 28 g/mol / (_R * 300K))', 'kPa'],
			escape: ['( 2 _G * 5.972e24 kg / (6371 km) )^0.5', 'mph'],
			dC: ['°C', 'K'],
			C2K: ['25°C + TC0', 'K'],
			F2K: ['85°F+TF0', ''],
			F2C: ['98.6°F + TF0 - TC0', '°C'],
			F2C2: ['98.6°F + F2C', '°C'],
			C2F: ['37°C + TC0 - TF0', '°F'],
			C2F2: ['37°C + C2F', '°F'],
			gauge: ['80 mmHg + atm', 'kPa']
		},
		//use an example
		ex: function(key) {
			CS.input = this.examples[key][0];
			CS.target = this.examples[key][1];
			$scope.fullConversion();
		},
	};
});

//directive to give textarea an observer for resize
app.directive('resizeObserver', () => ({restrict: 'A', link: function(scope, elem) {
	elem = elem[0];
	function callback() {
		CS.inputCodeWidth = elem.style.width;
		CS.inputCodeHeight = elem.style.height;
	}
	new MutationObserver(callback).observe(elem, {
		attributes: true, attributeFilter: [ "style" ]
	});
}}));
