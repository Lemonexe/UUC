/*
	controller.js
	contains the Angular module and controller, which serves as view & controller for the application
*/

const app = angular.module('UUC', []);
langService.init();
app.controller('ctrl', function($scope, $http, $timeout) {
	$scope.CS = CS;

	$scope.changeLang = function(lang) {
		CS.lang = lang;
		$scope.populateConvertMessages();
	};

	//perform conversion from fragment identifier. Executed upon loading of currencies
	function execHash() {
return
		let hash = decodeURIComponent(window.location.hash).replace(/^.*#/, '');
		if(!hash) {return;}
		//'>', 'to' or 'into' is used to delimit input and target
		hash = hash.replace(/to|into/g, '>');
		hash = hash.split(/>+/);

		//detect input & target text, save them into model
		let i = hash[0].trim();
		let t = hash[1] ? hash[1].trim() : '';
		CS.input = i;
		CS.target = t;
		i = processInput(i);
		t = processInput(t);

		let c = new Convert();
		//check for wrong input
		hash.length > 2 && c.warn(''.trans('WARN_separators'));
		//initialize conversion
		$scope.result = c.fullConversion(i, t);
		finish();
	}

	//just an informative string to show how to bind UUC as a search engine in Chrome
	$scope.searchEngineTemplate = window.location.origin.replace(/\/$/, '') + window.location.pathname.replace(/\/$/, '') + '/#%s';

	//initialize conversion
	$scope.fullConversion = function() {
		$scope.result = convert.fullConversion(CS.input, CS.target);
		$scope.result = convert.format($scope.result, CS.params);

		//style the results
		$scope.statusClass = ['ok', 'warn', 'err'][$scope.result.status];
		$scope.statusAppear = 'statusAppear';
		$timeout(() => ($scope.statusAppear = ''), 500);
	};

	//populate database of messages with strings or functions in current language
	$scope.populateConvertMessages = function() {Object.keys(convert.msgDB).forEach(key => (convert.msgDB[key] = langService.trans(key)));}
	$scope.populateConvertMessages();

	//this function listens to onkeyup in input & target text fields and executes conversion if the key is an Enter
	$scope.listenForConvert = function(event) {
		(event.keyCode === 13 || event.key === 'Enter') && $scope.fullConversion();
	};

	/*
		HELP, this section of code is dedicated to Reference!
	*/

	//current unit list view to be displayed
	$scope.Units = Units;
	$scope.highlightFirst = false;
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
return Units
		$scope.highlightFirst = false;

		//callback fed to Array.filter, it will check all dimensions of unit (item) and if they all agree with filterVector, it is a related unit and it will pass the filter.
		function filterFunction(item) {
			for(let i in item.v) {
				if(item.v[i] !== filterVector[i]) {return false;}
			}
			return true;
		}

		//callback fed to Array.sort, it will move matched unit to the top
		let sortMatchedUnit = (a, b) => (a.id === sortID) ? -1 : (b.id === sortID) ? 1 : 0;

		//filter for units - it gets the value of filter textfield and checks it by several conditions
		let filterVector;
		let filterString = CS.filter;
		//ID of matched unit (it will be sorted to the top)
		let sortID;

		//search for dimensionless units
		if(filterString === '1') {
			filterVector = new Array(8).fill(0);
			return Units.filter(filterFunction);
		}

		//search for constants
		else if(filterString === '_') {
			return Units.filter(item => item.constant);
		}

		//search for a specific dimension
		else if(filterString !== '') {
			//it parses the filter unit into detailed unit object and then into aggregate vector. See convert.init() of explanation. Then it filters all units using filterFunction
			convert.status = 0;
			let obj = convert.parseField(processInput(filterString));

			//if unit wasn't successfully parsed, program tries to find unit by name using the literal value of filter text field
			if(convert.status > 0) {
				let regex = new RegExp('(^| )' + filterString.toLowerCase()); //search all words of the unitname, whether they begin with the searchphrase
				let nameSearch = Units.find(item => item.name[CS.lang].toLowerCase().match(regex));
				//unit was found, so filter all units with the same dimension, sort the matched unit to the top and highlight it
				if(nameSearch) {
					filterVector = nameSearch.v;
					sortID = nameSearch.id;
					$scope.highlightFirst = true;
					return Units.filter(filterFunction).sort(sortMatchedUnit);
				}
				//attempt to find unit by name failed, collection will be empty
				return [];
			}

			//if successfully parsed, filter units by their aggregate vector
			convert.SI(obj);
			filterVector = obj.aggregateVector;
			let unitList = Units.filter(filterFunction)

			//if the input was exactly one unit, sort it to the top and highlight it
			if(obj.units.length === 1) {
				sortID = obj.units[0][1].id;
				$scope.highlightFirst = true;
				unitList = unitList.sort(sortMatchedUnit);
			}

			return unitList;
		}

		//no filter criterion specified, so all units will be listed
		else {
			return Units;
		}
	}

	//each unit is described by dimension represented by basic SI and info:
	//whether it is a constant, SI, basic SI, what prefixes are recommended and possibly a note
	$scope.buildUnitEntry = function(unit) {
		let text = ' (' + unit.id + ') ';
		//vector2text converts vector to text representation, like [1,1,-2] to m*kg*s^-2
		text += unit.basic ? '' : ' = ' + unit.k + ' ' + convert.vector2text(unit.v) + '\n';

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
					c.prefix = '+';
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
	}
	loadCurrencies();
});
