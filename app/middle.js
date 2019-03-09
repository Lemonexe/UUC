/*
	middle.js
	contains the Angular module and controller, which serves as view & controller for the application
*/

angular.module('UUC', [])
.controller('middle', function($scope, $http) {
	
	//initialize language from localstorage or estimate it from window.navigator
	let localLang = localStorage.getItem('lang');
	if(localLang) {
		$scope.lang = localLang;
	}
	else if((window.navigator.userLanguage || window.navigator.language).slice(0,2) === 'cs') {
		$scope.lang = 'CZ';
	}
	else {
		$scope.lang = 'EN';
	}

	//perform conversion from fragment identifier. Executed upon loading of currencies
	function execHash() {
		let hash = decodeURIComponent(window.location.hash).replace(/^.*#/, '');
		if(!hash) {return;}
		//'>', 'to' or 'into' is used to delimit input and target
		hash = hash.replace(/to|into/g, '>');
		hash = hash.split(/>+/);

		//detect input & target text, save them into model
		let i = processInput(hash[0]);
		let t = hash[1] ? processInput(hash[1]) : '';
		$scope.controls.input = i;
		$scope.controls.target = t;

		let c = new Convert();
		//check for wrong input
		hash.length > 2 && c.warn([
				'WARNING: Too many target unit separators have been found (>, to or into). Only the first definiton of target units was accepted.',
				'VAROVÁNÍ: Nalezeno příliš mnoho oddělovačů cílových jednotek (>, to nebo into). Pouze první definice cílových jednotek byla akceptována.'
			][lang()]);
		//initialize conversion
		$scope.result = c.init(i, t);
		finish();
	};
	
	//user switches language by link
	$scope.updateLang = function(newLang) {
		$scope.lang = newLang;
		localStorage.setItem('lang', newLang);
	};

	//important variables to control the application: which tab is in view & three text fields
	//they are in object to ensure proper inheritance to children scopes
	$scope.controls = {
		tab: 'converter',
		input: '',
		target: '',
		filter: '',
		parameters: false,
		digits: 4,
		expForm: false
	};

	//process string input (so it can be fed to convert)
	let processInput = string => string.replace(/,/g , '.').replace(/\s+/g , '');

	//initialize conversion
	$scope.init = function() {
		let i = processInput($scope.controls.input);
		let t = processInput($scope.controls.target);

		let c = new Convert();
		$scope.result = c.init(i, t);
		finish();
	};

	//finish conversion by assigning & formatting the result & status
	function finish() {
		//format of output number
		if($scope.result.output && $scope.controls.parameters) {
			//number of digits
			let d = $scope.controls.digits ? $scope.controls.digits : 2;
			$scope.result.output.num = $scope.controls.expForm ? $scope.result.output.num.toExponential(d-1) : $scope.result.output.num.toPrecision(d);
		}

		$scope.statusClass = ['ok', 'warn', 'err'][$scope.result.status];
	};

	//this function listens to onkeyup in input & target text fields and executes conversion if the key is an Enter
	$scope.listenForConvert = function(event) {
		(event.keyCode === 13 || event.key === 'Enter') && $scope.init();
	};

	/*
		HELP, this section of code is dedicated to Reference!
	*/

	//current unit list view to be displayed
	$scope.Units = Units;
	//constant statistics or strings to be statically displayed
	$scope.databaseCount = Units.length;
	$scope.constantCount = Units.filter(item => item.constant).length;
	$scope.prefixText = Prefixes.map(o => `${o.id} (${o.v})`).join(', ');

	//detect change in filter text field
	$scope.listenForHelp = function() {
		$scope.Units = getUnitList();
	};

	//get a list of units filtered using the filter text field
	function getUnitList() {
		//callback fed to Array.filter, it will check all dimensions of unit (item) and if they all agree with filterVector, it is a related unit and it will pass the filter.
		let filterFunction = function(item) {
			for(let i in item.v) {
				if(item.v[i] !== filterVector[i]) {return false;}
			}
			return true;
		};

		//filter for units - it gets the value of filter textfield and checks it by several conditions
		let filterVector;
		let filterString = $scope.controls.filter;
		//dimensionless units
		if(filterString === '1') {
			filterVector = new Array(8).fill(0);
			return Units.filter(filterFunction);
		}
		//constants
		else if(filterString === '_') {
			return Units.filter(item => item.constant);
		}
		//specific dimension
		else if(filterString !== '') {
			//it parses the filter unit into detailed unit object and then into aggregate vector. See convert.init() of explanation. Then it filters all units using filterFunction
			convert.status = 0;
			let obj = convert.parseField(processInput(filterString));
			convert.SI(obj);

			//if unit wasn't successfully parsed, program tries to find unit by name using the literal value of filter text field, if it is longer than three characters
			if(convert.status === 2) {
				let nameSearch = Units.find(item => item.name[lang()].toLowerCase().indexOf(filterString.toLowerCase()) > -1);
				if(nameSearch && filterString.length >= 3) {
					filterVector = nameSearch.v;
					return Units.filter(filterFunction);
				}
				//attempt to find unit by name failed, collection will be empty
				return [];
			}
			//if successfully parsed
			filterVector = obj.aggregateVector;
			return Units.filter(filterFunction);
		}
		//no filter criterion specified, so all units will be listed
		else {
			return Units;
		}
	};

	//redirect unit name by language
	$scope.getUnitName = unit => unit.name[lang()];

	//each unit is described by dimension represented by basic SI and info:
	//whether it is a constant,  SI, basic SI, what prefixes are recommended and possibly a note
	$scope.buildUnitEntry = function(unit) {
		let text = ' (' + unit.id + ') ';
		//vector2text converts vector to text representation, like [1,1,-2] to m*kg*s^-2
		text += unit.basic ? '' : ' = ' + unit.k + ' ' + convert.vector2text(unit.v) + '\n';

		if(unit.constant) {
			text += ['Constant.', 'Konstanta.'][lang()];
		}
		else {
			text += unit.basic ? ['Basic, ', 'Základní, '][lang()] : '';
			text += unit.SI ? 'SI, ' : '';
			switch(unit.prefix) {
				case 'all': text += ['all prefixes can be used.', 'všechny předpony mohou být použity.'][lang()]; break;
				case '+': text += ['usually only increasing prefixes are used.', 'většinou se používají jen zvětšující předpony.'][lang()]; break;
				case '-': text += ['usually only decreasing prefixes are used.', 'většinou se používají jen zmenšující předpony.'][lang()]; break;
				default: text += ['prefixes are not used.', 'předpony se nepoužívají.'][lang()];
			}
		}

		text += unit.note ? (' ' + unit.note[lang()]) : '';
		return text;
	};

	//load currency exchange rates from a public API (see currencies.php), fill the results in Currency array and concatenate Currency onto Units.
	function loadCurrencies () {
		$http.get('app/currencies.php').then(function(res) {
			if(res.status !== 200) {return;}

			let USDk = res.data.rates['USD'];//because default base is EUR while UUC is USD-centric

			let timestamp = new Date(res.data.timestamp*1000);
			$scope.currencyTimestamp = timestamp.toLocaleDateString() + ' ' + timestamp.toLocaleTimeString();

			//fill values for all currencies
			for(let c of Currency) {
				if(res.data.rates.hasOwnProperty(c.id)) {
					c.k = USDk / res.data.rates[c.id];
					c.v = [0,0,0,0,0,0,0,1];
				}
			}
			Currency = Currency.filter(item => item.k);
			Units = Units.concat(Currency);

			//display statistics in help
			$scope.databaseCount = Units.length;
			$scope.listenForHelp();

			//finally try to execute input from fragment identifier
			execHash();
		}, () => execHash());
	};
	loadCurrencies();
});
