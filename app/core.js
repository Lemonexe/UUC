/*
	core.js
	here are auxiliary functions, ubiquitous utils etc.
*/

let convert;
window.onload = function() {
	ECMA6test();
	//this instance serves only to facilitate access to auxiliary functions, not conversion itself - each conversion should get a new instance
	convert = new Convert();
};

//get language from angular scope
let lang = function() {
	let scope = angular.element(document).scope().lang;
	return {EN: 0, CZ: 1}[scope ? scope : 'EN'];
}

//test availability of ECMA6 with a sample code
function ECMA6test() {
	try {
		eval('const a=[1,2];for(let i of a){};a.map(i => i);');
	}
	catch(err) {
		alert([
			'ERROR:\n\nUnfortunately, your browser is probably outdated and doesn\'t support latest Javascript. The application will not work at all!',
			'CHYBA:\n\nBohužel, váš prohlížeč je nejspíše zastaralý a nepodporuje aktuální Javascript. Aplikace nebude vůbec fungovat!'
		][lang()]);
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
						conflicts.unshift(`CONFLICT OF A PREFIX: ${p.id}${u.id} (${p.id} ${u.name[lang()]}) = ${i.id} (${i.name[lang()]})`);
						break;
					}
					else {
						conflicts.push(`conflict of a deprecated prefix: ${p.id}${u.id} (${p.id} ${u.name[lang()]}) = ${i.id} (${i.name[lang()]})`);
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
