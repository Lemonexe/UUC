/*
	misc.js
	here are auxiliary functions, ubiquitous utils etc.
*/

ECMA6test();
let convert = new Convert();
let CS;

const CSdefault = {
	tab: 'converter', //current tab
	input: '', //content of input text field
	target: '', //target field
	filter: '', //filter field
	showParams: false, //whether to show output formatting parameters
	history: [], //history of last 10 commands as {input: '', target: '', params:{}}
	//specification of format type ('auto' || 'fixed' || 'digits'), number of sig digits, number of decimals, whether always exponential
	params: {spec: 'auto', digits: 3, fixed: 2, exp: false},
};

const saveService = {
	save: () => CS && localStorage.setItem('UUC_userdata', JSON.stringify(CS)),
	load: function() {
		const data = localStorage.getItem('UUC_userdata');
		CS = data ? JSON.parse(data) : CSdefault;
		!!data && (CS.hideTutorialLink = true);
		CS.tab = 'converter'; //always land on converter tab when refreshing the page
		!CS.hasOwnProperty('history') && (CS.history = []); //just a compatibility fix

		//estimate language from window.navigator
		!CS.lang && (CS.lang = ((window.navigator.userLanguage || window.navigator.language).slice(0,2) === 'cs') ? 'cz' : 'en');
		this.save();
	},
	purge: function() {
		window.onbeforeunload = null;
		localStorage.removeItem('UUC_userdata');
		location.reload();
	},
};
saveService.load();
window.onbeforeunload = saveService.save;

/*
TODO unit test like this, although this was an integration test..
describe(parseLocationHash.name, () => {
	eqObj(parseLocationHash('#!#3 kPa to torr'), { input: '3 kPa', target: 'torr' }, 'parse simple location hash');
	eqObj(
		parseLocationHash('#!#3%20kPa%20to%20torr'),
		{ input: '3 kPa', target: 'torr' },
		'parse simple URIencoded location hash'
	);
	eqObj(
		parseLocationHash('#!#3·%7B3°C%7D%2F(1e-1)%5E2*_g'),
		{ input: '3·{3°C}/(1e-1)^2*_g', target: '' },
		'parse complex location hash'
	);
	res = parseLocationHash('2m to cm > ft');
	fullTest(res.input, res.target, 200, 1e-2, 204);
	eqObj(
		parseLocationHash('#!#_G&fixed,3'),
		{ input: '_G', target: '', params: { spec: 'fixed', fixed: 3, exp: false } },
		'parse location hash with format params #1'
	);
	eqObj(
		parseLocationHash('#!#_G&digits,2,exp'),
		{ input: '_G', target: '', params: { spec: 'digits', digits: 2, exp: true } },
		'parse location hash with format params #2'
	);
	res = parseLocationHash('#!#_pi into 1 &auto,2.1');
	fullTest(res.input, res.target, Math.PI, 1e-6, 206);
});
*/

//parse window.location.hash to input, target and params
function parseLocationHash(hash) {
	const resObj = {};
	hash = decodeURIComponent(hash).replace(/^.*#/, '');

	//process the substring which contains format params in the format of `${spec},${digits || fixed}` + (exp ? ',exp' : '')
	function processParams(paramsStr) {
		const warn = () => convert.warn(convert.msgDB['WARN_format_params']);
		let obj = {};
		let params = paramsStr.split(',');
		if(params.length > 3) {warn(); return;}

		//get spec
		if(params[0] === 'fixed' || params[0] === 'digits') {obj.spec = params[0];}
		else {warn(); return;}

		//get digits || fixed as integer
		const num = Number(params[1]);
		if(Number.isInteger(num)) {obj[obj.spec] = num;}
		else {warn(); return;}

		//get exp if defined
		obj.exp = false;
		if(params[2] === 'exp') {obj.exp = true;}
		else if(params.length === 3) {warn(); return;}

		return obj;
	}

	//extract the params from hash and process it
	let paramsObj;
	const paramsMatch = hash.match(/&.+$/);
	if(paramsMatch) {
		hash = hash.slice(0, paramsMatch.index);
		paramsObj = processParams(paramsMatch[0].slice(1));
	}

	//continue with parsing the first part of the hash into target & input
	//'>', 'to' or 'into' is used to delimit input and target
	hash = hash.replace(/ to | into /g, '>');
	hash = hash.split(/>+/);
	hash.length > 2 && convert.warn(convert.msgDB['WARN_separators']);

	//detect input & target, return them
	resObj.input = hash[0].trim();
	resObj.target = hash[1] ? hash[1].trim() : '';
	paramsObj && (resObj.params = paramsObj);
	return resObj;
}

//test availability of ECMA6 with a sample code
function ECMA6test() {
	try {
		eval('const a=[1,2];for(let i of a){};a.map(i => i);');
	}
	catch(err) {
		alert('ERROR:\nUnfortunately, your browser is probably outdated and doesn\'t support latest Javascript. The application will not work at all!\n\n' +
			'CHYBA:\nBohužel, váš prohlížeč je nejspíše zastaralý a nepodporuje aktuální Javascript. Aplikace nebude vůbec fungovat!');
	}
}
