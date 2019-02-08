/*
	core.js
	here are auxiliary function, ubiquitous utils etc.
*/

window.onload = function() {
	middle.view('intro');
	middle.help();
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

//load currency exchange rates from a public API (see currencies.php), fill the results in Currency array and concatenate Currency onto Units.
function loadCurrencies() {
	let url = 'app/currencies.php';
	let xobj = new XMLHttpRequest();
	xobj.open('GET', url, true);
	xobj.overrideMimeType('application/json');
	xobj.send(null);
	xobj.onreadystatechange = function() {
		if(xobj.readyState === 4 && xobj.status === 200) {
			let res = JSON.parse(xobj.responseText);
			let USD = res.rates['USD'];//because default base is EUR while UUC is USD-centric
			
			//add a timestamp to USD description
			let timestamp = new Date(res.timestamp*1000);
			let USDobj = Units.filter(item => item.id === 'USD')[0];
			USDobj.note = 'Other currencies have been loaded from external website at ' + timestamp.toLocaleDateString() + ' ' + timestamp.toLocaleTimeString();

			//fill values for all currencies
			for(let c of Currency) {
				if(res.rates.hasOwnProperty(c.id)) {
					c.k = 1 / res.rates[c.id] * USD;
					c.v = [0,0,0,0,0,0,0,1];
				}
			}
			Currency = Currency.filter(item => item.k);
			Units = Units.concat(Currency);
			middle.help();
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
