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
	//specification of format type ('auto' || 'fixed' || 'digits'), number of sig digits, number of decimals, whether always exponential
	params: {spec: 'auto', digits: 3, fixed: 3, exp: false},
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
	//determine whether there is conflict between two given unit objects
	let determineConflict = function(u, i) {

		//same ID, that's the worst that can happen
		if(u.id === i.id) {
			conflicts.unshift(`HARD CONFLICT: ${u.id} (${u.name}) = ${i.id} (${i.name})`);
			return;
		}

		//conflict of a unit with prefix with another unit. IF u.id is at the end of i.id
		let index = i.id.indexOf(u.id);
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
						conflicts.unshift(`CONFLICT OF A PREFIX: ${p.id}${u.id} (${p.id} ${u.name[CS.lang]}) = ${i.id} (${i.name[CS.lang]})`);
						break;
					}
					else {
						conflicts.push(`conflict of a deprecated prefix: ${p.id}${u.id} (${p.id} ${u.name[CS.lang]}) = ${i.id} (${i.name[CS.lang]})`);
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
	document.getElementById('debug').innerHTML = conflicts.length + ' conflicts<br>' + conflicts.join('<br>');
}
