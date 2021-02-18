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
	//macro code text and size of textarea
	inputCode: '',
	inputCodeWidth: '350px',
	inputCodeHeight: '150px'
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

//Maintenance function that cannot be accessed by GUI. Conflicts are written in debug div. Quadratic time complexity (in relation to Units)
function unitConflicts() {
	//create another database that maps each id and alias to the original unit object (just like in convert_parse.js)
	const UnitIdMap = Units.map(item => ({id: item.id, ref: item}));
	Units.forEach(o => o.alias && o.alias.forEach(a => UnitIdMap.push({id: a, ref: o})));

	//determine whether there is conflict between two given unit objects
	const determineConflict = function(u, i) {
		//same ID, that's the worst that can happen
		if(u.id === i.id) {
			conflicts.unshift(`HARD CONFLICT: ${u.id} (${u.ref.name[CS.lang]}) = ${i.id} (${i.ref.name[CS.lang]})`);
			return;
		}

		//conflict of a unit with prefix with another unit. IF u.id is at the end of i.id
		const j = i.id.indexOf(u.id);
		if(j > -1 && (j + u.id.length) === i.id.length) {
			const pref = i.id.replace(u.id, ''); //perhaps this is a prefix?
			for(let p of Prefixes) {
				if(p.id !== pref) {continue;}
				if(
					u.ref.prefix === 'all' ||
					(u.ref.prefix === '+' && p.v > 0) ||
					(u.ref.prefix === '-' && p.v < 0)
				) {
					conflicts.unshift(`CONFLICT OF A PREFIX: ${p.id}${u.id} (${p.id} ${u.ref.name[CS.lang]}) = ${i.id} (${i.ref.name[CS.lang]})`);
					break;
				}
				else {
					conflicts.push(`conflict of a deprecated prefix: ${p.id}${u.id} (${p.id} ${u.ref.name[CS.lang]}) = ${i.id} (${i.ref.name[CS.lang]})`);
					break;
				}
			}
		}
	};

	//two for cycles through UnitIdMap, determineConflict is applied to each pair (pair of a unit with itself is excluded)
	let conflicts = [];
	for(let u = 0; u < UnitIdMap.length; u++) {
		for(let i = 0; i < UnitIdMap.length; i++) {
			(i !== u) && determineConflict(UnitIdMap[u], UnitIdMap[i]);
		}
	}
	document.getElementById('debug').innerHTML = conflicts.length + ' conflicts<br>' + conflicts.join('<br>');
}
