/*
	controller.js
	contains the Angular module and controller, which serves as view & controller for the application
*/

const app = angular.module('UUC', []);
langService.init();
app.controller('ctrl', function($scope, $http, $timeout) {
	//INITIALIZE
	$scope.CS = CS;
	loadCurrencies(execHash);

	//generate ng-style for inputCode textarea
	$scope.textareaStyle = () => ({width: CS.inputCodeWidth || '350px', height: CS.inputCodeHeight || '150px'});
	//generate ng-style for currently active tab button
	$scope.tabButtonStyle = tab => CS.tab === tab ? ({'border-bottom': '2px solid white'}) : ({});

	$scope.changeLang = function(lang) {
		CS.lang = lang;
		$scope.populateConvertMessages();
	};
	$scope.changeTab = tab => (CS.tab = tab);

	//just an informative string to show how to bind UUC as a search engine in Chrome
	$scope.searchEngineTemplate = window.location.origin.replace(/\/$/, '') + window.location.pathname.replace(/\/$/, '') + '/#%s';

	//initialize conversion
	$scope.fullConversion = function() {
		$scope.result = convert.fullConversion(CS.input, CS.target);
		$scope.result.output = convert.format($scope.result.output, CS.params);

		//style the results
		$scope.statusClass = ['ok', 'warn', 'err'][$scope.result.status];
		$scope.statusAppear = 'statusAppear';
		$timeout(() => ($scope.statusAppear = ''), 500);
	};
	//when a user changes format settings, there is no need to initialize conversion again
	$scope.updateFormat = () => $scope.result && ($scope.result.output = convert.format($scope.result.output, CS.params));

	//flip input & target field
	$scope.flip = function() {
		const i = CS.input;
		CS.input = CS.target;
		CS.target = i;
	};

	//this function, well, it runs a code
	$scope.runCode = () => ($scope.resultCode = convert.runCode(CS.inputCode));

	//populate database of messages with strings or functions in current language
	$scope.populateConvertMessages = function() {Object.keys(convert.msgDB).forEach(key => (convert.msgDB[key] = langService.trans(key)));}
	$scope.populateConvertMessages();

	//these functions listen to onkeyup in various text fields
	//input & target field: perform fullConversion on Enter
	$scope.listenForConvert = event => (event.keyCode === 13 || event.key === 'Enter') && $scope.fullConversion();
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
			const q = convert.getReference(fs);

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
		hash = hash.replace(/to|into/g, '>');
		hash = hash.split(/>+/);
		hash.length > 2 && convert.warn(convert.msgDB['WARN_separators']);

		//detect input & target, feed them into full conversion
		CS.input = hash[0].trim();
		CS.target = hash[1] ? hash[1].trim() : '';
		$scope.fullConversion();
	}
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
