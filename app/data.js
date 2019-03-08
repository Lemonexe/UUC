/*
Units object is the database of all known units.
	v: [m,kg,s,A,K,mol,cd,$]      represents the vector of powers of basic units, for example N=kg*m/s^2, therefore v = [1,1,-2,0,0,0,0]
	id: string                    something unique. You can use the UnitConflicts() global function to detect possible id conflicts
	name: array                   defines full name or even a short description for every language mutation
	k: number                     this coeficient equates value of the unit in basic units. For example minute = 60 seconds, therefore min.k = 60
	SI: true/false                self-explanatory. This attribute doesn't really do anything, it's merely informational. Perhaps it's redundant, since all SI derived units have k = 1
	basic: true/false             whether it's basic SI unit or derived SI. Basic SI units are of utmost importance to the code, don't ever change them!
	prefix: all/+/-/undefined     it means: all prefixes allowed / only bigger than one allowed / lesser than one / prefixes disallowed. It's not really a restriction, just a recommendation.
	constant: true/undefined      whether it is a constant. If true, attributes SI, basic and prefix are ignored. Prefix is disallowed.
	note: a note that conveys anything important beyond description - what is noteworthy or weird about this unit or its usage. Implemented as an array of strings for all language mutations.
*/

let Units = [
//EIGHT BASIC UNITS
	{v: [1,0,0,0,0,0,0,0], id: 'm', name: ['metre', 'metr'], k:1, SI: true, basic: true, prefix: 'all'},
	{v: [0,1,0,0,0,0,0,0], id: 'kg', name: ['kilogram', 'kilogram'], k:1, SI: true, basic: true, note: [
		'That\'s because kilogram is problematic to code, since the "kilo" itself is a prefix. Therefore I have also defined gram as a derived SI unit, which can have all prefixes.',
		'To protože kilogram se obtížně programuje, neboť samo "kilo" je předpona. Proto jsem definoval také gram jako odvozenou jednotku SI, která může mít jakékoliv předpony.']},
	{v: [0,0,1,0,0,0,0,0], id: 's', name: ['second', 'sekunda'], k:1, SI: true, basic: true, prefix: '-'},
	{v: [0,0,0,1,0,0,0,0], id: 'A', name: ['ampere', 'ampér'], k:1, SI: true, basic: true, prefix: 'all'},
	{v: [0,0,0,0,1,0,0,0], id: 'K', name: ['kelvin', 'kelvin'], k:1, SI: true, basic: true, prefix: 'all'},
	{v: [0,0,0,0,0,1,0,0], id: 'mol', name: ['mole', 'mol'], k:1, SI: true, basic: true, prefix: 'all'},
	{v: [0,0,0,0,0,0,1,0], id: 'cd', name: ['candela', 'kandela'], k:1, SI: true, basic: true, prefix: 'all'},
	//USD arbitrarily set as basic unit. Reference to this unit is harcoded in currency loading!
	{v: [0,0,0,0,0,0,0,1], id: 'USD', name: ['US dollar', 'americký dolar'], k:1, basic: true},

//ALL OTHER UNITS as {id: 'identifier',v: [0,0,0,0,0,0,0], name: ['EN', 'CZ'], k:1, SI: true, prefix: 'all'},
	{v: [0,0,0,0,0,0,0,0], id: '%', name: ['percent', 'procento'], k:1e-2},
	{v: [0,0,0,0,0,0,0,0], id: 'ppm', name: ['parts per million', 'dílů na jeden milion'], k:1e-6},
	{v: [0,0,0,0,0,0,0,0], id: 'rad', name: ['radian', 'radián'], k:1, SI: true, prefix: '-', note: [
		'I consider angle units to be dimensionless, with radian being identical to number 1.',
		'Úhel považuji za bezrozměrné číslo, čili radián je identický s číslem 1.']},
	{v: [0,0,0,0,0,0,0,0], id: '°', name: ['degree', 'stupeň'], k:Math.PI/180},
	{v: [0,0,0,0,0,0,0,0], id: 'gon', name: ['gradian', 'gradián'], k:Math.PI/200},
	{v: [0,0,-1,0,0,0,0,0], id: 'Hz', name: ['hertz', 'hertz'], k:1, SI: true, prefix: 'all'},
	{v: [1,1,-2,0,0,0,0,0], id: 'N', name: ['newton', 'newton'], k:1, SI: true, prefix: 'all'},
	{v: [-1,1,-2,0,0,0,0,0], id: 'Pa', name: ['pascal', 'pascal'], k:1, SI: true, prefix: 'all'},
	{v: [2,1,-2,0,0,0,0,0], id: 'J', name: ['joule', 'joule'], k:1, SI: true, prefix: 'all'},
	{v: [2,1,-3,0,0,0,0,0], id: 'W', name: ['watt', 'watt'], k:1, SI: true, prefix: 'all'},
	{v: [0,0,1,1,0,0,0,0], id: 'C', name: ['coulomb', 'coulomb'], k:1, SI: true, prefix: 'all'},
	{v: [2,1,-3,-1,0,0,0,0], id: 'V', name: ['volt', 'volt'], k:1, SI: true, prefix: 'all'},
	{v: [-2,-1,4,2,0,0,0,0], id: 'F', name: ['farad', 'farad'], k:1, SI: true, prefix: 'all'},
	{v: [2,1,-3,-2,0,0,0,0], id: 'ohm', name: ['ohm', 'ohm'], k:1, SI: true, prefix: 'all'},
	{v: [-2,-1,3,2,0,0,0,0], id: 'S', name: ['siemens', 'siemens'], k:1, SI: true, prefix: 'all'},
	{v: [2,1,-2,-1,0,0,0,0], id: 'Wb', name: ['weber', 'weber'], k:1, SI: true, prefix: 'all'},
	{v: [0,1,-2,-1,0,0,0,0], id: 'T', name: ['tesla', 'tesla'], k:1, SI: true, prefix: 'all'},
	{v: [2,1,-2,-2,0,0,0,0], id: 'H', name: ['henry', 'henry'], k:1, SI: true, prefix: 'all'},
	{v: [0,0,0,0,1,0,0,0], id: '°C', name: ['degree Celsius', 'stupeň Celsia'], k:1, SI: true, note: [
		'Degree Celsius is considered to be a unit of temperature difference (ΔT), not temperature (T)! It doesn\'t make any sense to multiply T in °C with other units or raise it to power. The program couldn\'t even tell whether the input is T or ΔT, so it\'s always considered to be ΔT. Try google for simple temperature conversion!',
		'Stupeň Celsia je považován za jednotku rozdílu teploty (ΔT), nikoliv teploty (T)! Nedává totiž smysl násobit absolutní teplotu v °C jinými veličinami nebo ji umocňovat. Program ani nemůže poznat, zda-li se vstupem myslí T nebo ΔT, takže bude vždy považován za ΔT. Pro jednoduché převody teplot zkuste google!']},
	{v: [0,0,0,0,0,0,1,0], id: 'lm', name: ['lumen', 'lumen'], k:1, SI: true, prefix: 'all'},
	{v: [-2,0,0,0,0,0,1,0], id: 'lx', name: ['lux', 'lux'], k:1, SI: true, prefix: 'all'},
	{v: [0,0,-1,0,0,0,0,0], id: 'Bq', name: ['becquerel', 'becquerel'], k:1, SI: true, prefix: 'all'},
	{v: [2,0,-2,0,0,0,0,0], id: 'Gy', name: ['gray', 'gray'], k:1, SI: true, prefix: 'all'},
	{v: [2,0,-2,0,0,0,0,0], id: 'Sv', name: ['sievert', 'sievert'], k:1, SI: true, prefix: 'all'},
	{v: [-1,0,0,0,0,0,0,0], id: 'dpt', name: ['dioptre', 'dioptrie'], k:1, SI: true},
	
	{v: [0,0,0,0,0,1,0,0], id: 'Ncm', name: ['normal cubic metre', 'normální krychlový metr'], k:(101325)/(273.15*8.3144598), note: [
		'Defined at 0°C and 1 atm. Despite the name, Ncm is actually amount of substance, not volume.',
		'Definován při 0°C a 1 atm. Navzdory názvu je Ncm jednotkou látkového množství, nikoliv objemu.']},

	{v: [0,0,1,0,0,0,0,0], id: 'min', name: ['minute', 'minuta'], k:60},
	{v: [0,0,1,0,0,0,0,0], id: 'h', name: ['hour', 'hodina'], k:3600},
	{v: [0,0,1,0,0,0,0,0], id: 'd', name: ['day', 'den'], k:3600*24},
	{v: [0,0,1,0,0,0,0,0], id: 'week', name: ['week', 'týden'], k:3600*24*7},
	{v: [0,0,1,0,0,0,0,0], id: 'month', name: ['average month', 'průměrný měsíc'], k:3600*24*30.436875, note: [
		'Calculated from gregorian year.',
		'Vypočten z gregoriánského roku.']},
	{v: [0,0,1,0,0,0,0,0], id: 'yr', name: ['gregorian year', 'gregoriánský rok'], k:3600*24*365.2425, note: [
		'If you are unsure which year to use, pick this one. Julian year is obsolete.',
		'Pokud si nejste jisti, který rok použít, zvolte tento. Juliánský rok je zastaralý.']},
	{v: [0,0,1,0,0,0,0,0], id: 'jyr', name: ['julian year', 'juliánský rok'], k:3600*24*365.25},

	{v: [0,0,0,0,1,0,0,0], id: '°F', name: ['degree Fahrenheit', 'stupeň Fahrenheita'], k:5/9, note: [
		'See °C for an important note.',
		'Viz °C pro důležitou poznámku.']},
	{v: [0,0,0,0,1,0,0,0], id: '°R', name: ['degree Réaumur', 'stupeň Réaumura'], k:5/4, note: [
		'See °C for an important note.',
		'Viz °C pro důležitou poznámku.']},

	{v: [1,0,0,0,0,0,0,0], id: 'Å', name: ['angstrom', 'angstrom'], k:1e-10, SI: true},
	{v: [1,0,0,0,0,0,0,0], id: 'th', name: ['thou', 'thou'], k:2.54e-5},
	{v: [1,0,0,0,0,0,0,0], id: 'in', name: ['inch', 'palec'], k:2.54e-2},
	{v: [1,0,0,0,0,0,0,0], id: 'ft', name: ['foot', 'stopa'], k:0.3048},
	{v: [1,0,0,0,0,0,0,0], id: 'yd', name: ['yard', 'yard'], k:0.9144},
	{v: [1,0,0,0,0,0,0,0], id: 'mi', name: ['mile', 'míle'], k:1609.344},
	{v: [1,0,0,0,0,0,0,0], id: 'nmi', name: ['nautical mile', 'námořní míle'], k:1852},
	{v: [1,0,0,0,0,0,0,0], id: 'au', name: ['astronomical unit', 'astronomická jednotka'], k:149597870700, prefix: '+'},
	{v: [1,0,0,0,0,0,0,0], id: 'pc', name: ['parsec', 'parsek'], k:3.08567758149137e16, prefix: '+'},
	{v: [1,0,0,0,0,0,0,0], id: 'ly', name: ['light-year', 'světelný rok'], k:9460730472580800, prefix: '+'},

	{v: [2,0,0,0,0,0,0,0], id: 'a', name: ['ar', 'ar'], k:100, SI: true, prefix: '+'},
	{v: [2,0,0,0,0,0,0,0], id: 'ac', name: ['acre', 'akr'], k:4046.872},

	{v: [3,0,0,0,0,0,0,0], id: 'l', name: ['litre', 'litr'], k:1e-3, SI: true, prefix: 'all'},
	{v: [3,0,0,0,0,0,0,0], id: 'pt', name: ['pint', 'pinta'], k:568.261e-6},
	{v: [3,0,0,0,0,0,0,0], id: 'gal', name: ['US gallon', 'americký galon'], k:3.785412e-3},
	{v: [3,0,0,0,0,0,0,0], id: 'bsh', name: ['US bushel', 'americký bušl'], k:35.2391e-3},
	{v: [3,0,0,0,0,0,0,0], id: 'bbl', name: ['oil barrel', 'barel ropy'], k:158.987294928e-3},

	{v: [0,1,0,0,0,0,0,0], id: 'g', name: ['gram', 'gram'], k:1e-3, SI: true, prefix: 'all'},
	{v: [0,1,0,0,0,0,0,0], id: 't', name: ['tonne', 'tuna'], k:1000, SI: true, prefix: '+'},
	{v: [0,1,0,0,0,0,0,0], id: 'gr', name: ['grain', 'grain'], k:64.79891e-6},
	{v: [0,1,0,0,0,0,0,0], id: 'oz', name: ['ounce', 'once'], k:28.349523e-3},
	{v: [0,1,0,0,0,0,0,0], id: 'ozt', name: ['troy ounce', 'trojská unce'], k:31.1034768e-3},
	{v: [0,1,0,0,0,0,0,0], id: 'ct', name: ['carat', 'karát'], k:200e-6},
	{v: [0,1,0,0,0,0,0,0], id: 'lb', name: ['pound', 'libra'], k:0.45359237},
	{v: [0,1,0,0,0,0,0,0], id: 'st', name: ['stone', 'kámen'], k:6.35029318},
	{v: [0,1,0,0,0,0,0,0], id: 'slug', name: ['slug', 'slug'], k:14.593903},
	{v: [0,1,0,0,0,0,0,0], id: 'ts', name: ['short ton', 'krátká tuna'], k:907.18474},
	{v: [0,1,0,0,0,0,0,0], id: 'tl', name: ['long ton', 'imperiální tuna'], k:1016},
	{v: [0,1,0,0,0,0,0,0], id: 'u', name: ['unified atomic mass unit', 'atomová hmotnostní konstanta'], k:1.660539040e-27, note: [
		'Same as dalton (Da).',
		'Totéž co dalton (Da).']},
	{v: [0,1,0,0,0,0,0,0], id: 'Da', name: ['dalton', 'dalton'], k:1.660539040e-27, note: [
		'Same as unified atomic mass unit (u).',
		'Totéž co atomová hmotnostní konstanta (u).']},

	{v: [1,0,-1,0,0,0,0,0], id: 'mph', name: ['mile per hour', 'míle za hodinu'], k:1609.344/3600},
	{v: [1,0,-1,0,0,0,0,0], id: 'kn', name: ['knot', 'uzel'], k:1852/3600},

	{v: [2,1,-2,0,0,0,0,0], id: 'eV', name: ['electronvolt', 'elektronvolt'], k:1.60217653e-19, prefix: 'all'},
	{v: [2,1,-2,0,0,0,0,0], id: 'erg', name: ['erg', 'erg'], k:1e-7, SI: true, prefix: 'all'},
	{v: [2,1,-2,0,0,0,0,0], id: 'Btu', name: ['british thermal unit', 'britská tepelná jednotka'], k:1055.05585, prefix: 'all'},
	{v: [2,1,-2,0,0,0,0,0], id: 'cal', name: ['calorie', 'kalorie'], k:4.184, prefix: 'all'},
	{v: [2,1,-2,0,0,0,0,0], id: 'TNT', name: ['ton of TNT equivalent', 'tuna ekvivalentu TNT'], k:4.184e9, prefix: 'all'},

	{v: [-1,0,0,1,0,0,0,0], id: 'Oe', name: ['oersted', 'oersted'], k:1000/(4*Math.PI), prefix: 'all'},

	{v: [2,1,-3,0,0,0,0,0], id: 'hp', name: ['imperial horsepower', 'imperiální koňská síla'], k:745.69987158227022},

	{v: [-1,1,-1,0,0,0,0,0], id: 'P', name: ['poise', 'poise'], k:0.1, SI: true, prefix: 'all'},

	{v: [-1,1,-2,0,0,0,0,0], id: 'bar', name: ['bar', 'bar'], k:1e5, SI: true, prefix: 'all'},
	{v: [-1,1,-2,0,0,0,0,0], id: 'atm', name: ['atmosphere', 'atmosféra'], k:101325, note: [
		'Also serves as standard pressure.',
		'Také slouží jako standardní tlak.']},
	{v: [-1,1,-2,0,0,0,0,0], id: 'mmHg', name: ['milimetre of mercury', 'milimetr rtuťového sloupce'], k:133.322387415, note: [
		'There is a negligible difference between mmHg and Torr.',
		'Mezi mmHg a Torr je nepatrný rozdíl.']},
	{v: [-1,1,-2,0,0,0,0,0], id: 'Torr', name: ['torr', 'torr'], k:101325/760, prefix: 'all', note: [
		'There is a negligible difference between mmHg and Torr.',
		'Mezi mmHg a Torr je nepatrný rozdíl.']},
	{v: [-1,1,-2,0,0,0,0,0], id: 'psi', name: ['pound per square inch', 'libra na čtvereční palec'], k:6894.757, prefix: 'all'},

	{v: [0,1,-2,-1,0,0,0,0], id: 'G', name: ['gauss', 'gauss'], k:0.0001, SI: true, prefix: 'all'},

	{v: [1,0,-2,0,0,0,0,0], id: '_g', name: ['standard gravity', 'normální tíhové zrychlení'], k:9.80665, constant: true, note: [
		'Not a universal constant, but a conventional one.',
		'Nikoliv univerzální konstanta, nýbrž konvenční.']},
	{v: [1,0,-1,0,0,0,0,0], id: '_c', name: ['speed of light in vacuum', 'rychlost světla ve vakuu'], k:299792458, constant: true},
	{v: [3,-1,-2,0,0,0,0,0], id: '_G', name: ['gravitational constant', 'gravitační konstanta'], k:6.67408e-11, constant: true},
	{v: [2,1,-1,0,0,0,0,0], id: '_h', name: ['Planck constant', 'Planckova konstanta'], k:6.626070040e-34, constant: true},
	{v: [2,1,-2,0,-1,0,0,0], id: '_k', name: ['Boltzmann constant', 'Boltzmannova konstanta'], k:1.38064852e-23, constant: true},
	{v: [2,1,-2,0,-1,-1,0,0], id: '_R', name: ['gas constant', 'plynová konstanta'], k:8.3144598, constant: true},
	{v: [1,1,-2,-2,0,0,0,0], id: '_mu', name: ['vacuum permeability', 'permeabilita vakua'], k:1.2566370614e-6, constant: true},
	{v: [-3,-1,4,2,0,0,0,0], id: '_E', name: ['vacuum permittivity', 'permitivita vakua'], k:8.854187817e-12, constant: true},
	{v: [0,0,1,1,0,0,0,0], id: '_q', name: ['elementary charge', 'elementární náboj'], k:1.6021766208e-19, constant: true},
	{v: [0,0,0,0,0,-1,0,0], id: '_NA', name: ['Avogadro constant', 'Avogadrova konstanta'], k:6.02214085e23, constant: true},
	{v: [0,0,0,0,0,0,0,0], id: '_pi', name: ['pi (mathematical)', 'pí (matematická)'], k:Math.PI, constant: true},
	{v: [0,0,0,0,0,0,0,0], id: '_e', name: ['e (mathematical)', 'e (matematická)'], k:Math.E, constant: true}
];

//currencies - their conversion ratio to dollar is unknown and will be obtained by currencies.php
//k and v will be filled later (v is always the same, k is obtained from API)
let Currency = [
	{id: 'EUR', name: ['Euro', 'euro']},
	{id: 'AED', name: ['United Arab Emirates Dirham', 'dirham Spojených arabských emirátů']},
	{id: 'ARS', name: ['Argentine Peso', 'argentinské peso']},
	{id: 'AUD', name: ['Australian Dollar', 'australský dolar']},
	{id: 'BGN', name: ['Bulgarian Lev', 'bulharský lev']},
	{id: 'BRL', name: ['Brazilian Real', 'braziliský real']},
	{id: 'CAD', name: ['Canadian Dollar', 'kanadský dolar']},
	{id: 'CHF', name: ['Swiss Franc', 'švýcarský frank']},
	{id: 'CNY', name: ['Chinese Yuan', 'čínský juan']},
	{id: 'CZK', name: ['Czech Republic Koruna', 'česká koruna']},
	{id: 'DKK', name: ['Danish Krone', 'dánská koruna']},
	{id: 'GBP', name: ['British Pound Sterling', 'britská libra']},
	{id: 'HKD', name: ['Hong Kong Dollar', 'hongkongský dolar']},
	{id: 'HRK', name: ['Croatian Kuna', 'chorvatská kuna']},
	{id: 'HUF', name: ['Hungarian Forint', 'maďarský forint']},
	{id: 'IDR', name: ['Indonesian Rupiah', 'indonéská rupie']},
	{id: 'ILS', name: ['Israeli New Sheqel', 'nový izraelský šekel']},
	{id: 'INR', name: ['Indian Rupee', 'indická rupie']},
	{id: 'JPY', name: ['Japanese Yen', 'japonský jen']},
	{id: 'KRW', name: ['South Korean Won', 'jihokorejský won']},
	{id: 'MXN', name: ['Mexican Peso', 'mexické peso']},
	{id: 'NOK', name: ['Norwegian Krone', 'norská koruna']},
	{id: 'NZD', name: ['New Zealand Dollar', 'novozélandský dolar']},
	{id: 'PLN', name: ['Polish Zloty', 'polský zlotý']},
	{id: 'RON', name: ['Romanian Leu', 'rumunské leu']},
	{id: 'RUB', name: ['Russian Ruble', 'ruský rubl']},
	{id: 'SEK', name: ['Swedish Krona', 'švédská koruna']},
	{id: 'SGD', name: ['Singapore Dollar', 'singapurský dolar']},
	{id: 'THB', name: ['Thai Baht', 'thajský baht']},
	{id: 'TRY', name: ['Turkish Lira', 'turecká lira']},
	{id: 'VND', name: ['Vietnamese Dong', 'vietnamský dong']},
	{id: 'ZAR', name: ['South African Rand', 'jihoafrický rand']},
	{id: 'BTC', name: ['Bitcoin', 'bitcoin']}
];

//standard SI prefixes
const Prefixes = [
	{id: 'a', v: -18},
	{id: 'f', v: -15},
	{id: 'p', v: -12},
	{id: 'n', v: -9},
	{id: 'u', v: -6},
	{id: 'μ', v: -6},
	{id: 'm', v: -3},
	{id: 'c', v: -2},
	{id: 'd', v: -1},
	{id: 'h', v: 2},
	{id: 'k', v: 3},
	{id: 'M', v: 6},
	{id: 'G', v: 9},
	{id: 'T', v: 12},
	{id: 'P', v: 15}
];
