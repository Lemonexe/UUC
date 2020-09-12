/*
	lang.js
	here are functions concerning lanugage as well as the whole translate table
*/
const langService = {
	langs: ['cz', 'en'],
	alias: ['Česky', 'English'],
	default: 'cz',

	//here will be the whole translate table for JS language switch, see below
	table: null,

	//initialize lang using angular module
	init: function() {
		(!CS.lang || this.langs.indexOf(CS.lang) === -1) && (CS.lang = this.default);

		//create directives for HTML language switch
		this.langs.forEach(lang => {
			app.directive(lang, () => ({
				restrict: 'E',
				transclude: true,
				template: '<ng-transclude ng-if="CS.lang === \''+lang+'\'"></ng-transclude>'
			}));
		});

		//JS language switch for String prototype. Pls rate my oneliner evilness!
		String.prototype.trans = function(arg) {
			const curr = CS.lang;
			const val = this.valueOf();
			return (curr === langService.default || !langService.table) ? val : (langService.table[arg || val] || {})[curr] || val;
		}
	},

	//access translation table directly from langService, instead of using String prototype function. ID is required here
	//Not just for strings! Anything can be a value (useful for translated functions).
	trans: function(id) {
		const curr = CS.lang;
		const lst = langService.table;
		if(!lst || !lst[id]) {return null;}
		return lst[id][curr] || lst[id][langService.default] || null;
	}
};
langService.init();

//the translate table
langService.table = {
	'PŘEVODNÍK': {en: 'CONVERTER'},
	'Úvod': {en: 'Introduction'},
	'Reference': {en: 'Reference'},
	'Příklady': {en: 'Examples'},
	'Převést': {en: 'Convert'},

	'Konstanta.': {en: 'Constant.'},
	'Základní, ': {en: 'Basic, '},
	'prefixAll': {en: 'all prefixes can be used.'},
	'prefix+': {en: 'usually only increasing prefixes are used.'},
	'prefix-': {en: 'usually only decreasing prefixes are used.'},
	'prefix0': {en: 'prefixes are not used.'},


	'WARN_targetNumber': {en: 'WARNING: Unexpected number in the target field, it has been ignored.'},
	'ERR_noInput': {en: 'ERROR: No input detected!'},
	'ERR_NaN': {en: 'ERROR: Numerical part identified but cannot be parsed!'},
	'ERR_operators': {en: 'ERROR: wrong use of * or / operator'},
	'WARN_separators': {en: 'WARNING: Too many target unit separators have been found (>, to or into). Only the first definiton of target units was accepted.'},
	'ERR_unitPower': {
		cz: (m, powIndex) => `CHYBA: Nelze zpracovat mocninu jednotky (${m.slice(powIndex)})!`,
		en: (m, powIndex) => `ERROR: Cannot parse unit power (${m.slice(powIndex)})!`
	},
	'ERR_unknownUnit': {
		cz: m => `CHYBA: Nenalezena jednotka ${m}!`,
		en: m => `ERROR: Unknown unit ${m}!`
	},
	'WARN_dimension': {
		cz: faults => `VAROVÁNÍ: Rozměry jednotek ze vstupu a cíle nesouhlasí. Tyto základní jednotky byly přidány: ${faults.join(', ')}.`,
		en: faults => `WARNING: Dimensions of units from input and target don\'t match. These basic units have been added: ${faults.join(', ')}.`
	},
	'WARN_prefixes': {
		cz: (unit, words, pref) => `VAROVÁNÍ: Jednotka ${unit.id} (${unit.name[CS.lang]}) většinou nemívá ${langService.trans(words)} předpony, avšak nalezeno ${pref.id}!`,
		en: (unit, words, pref) => `WARNING: Unit ${unit.id} (${unit.name[CS.lang]}) doesn\'t usually have ${langService.trans(words)} prefixes, yet ${pref.id} identified!`
	},
	'WARN_prefixes_words0': {cz: 'žádné', en: 'any'},
	'WARN_prefixes_words+': {cz: 'zmenšující', en: 'decreasing'},
	'WARN_prefixes_words-': {cz: 'zvětšující', en: 'increasing'}
};
