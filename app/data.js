/*
	data.js
	contains all of the program constants, the unit database, and database of prefixes
*/

//program constants
const csts  = {
	R: 8.3144598, //[J/K/mpol]
	TC0: 273.15, //[K]
	TF0: 459.67*5/9, //[K]
	atm: 101325, //[Pa]
	mile: 1609.344, //[m]
	bbl: 158.987294928e-3, //[m3]
	q: 1.6021766208e-19, //[C]
	BTU: 1055.05585, //[J]
	dTnote: {cz: 'Viz °C pro důležitou poznámku.', en: 'See °C for an important note.'},
	T0note: {cz: 'Viz tutoriál pro příklad jak lze použít na převod teplot.', en: 'See tutorial for an example how to use it for temperature conversion.'}
};

/*
Units object is the database of all known units.
	v: [m,kg,s,A,K,mol,cd,$]      represents the vector of powers of basic units, for example N=kg*m/s^2, therefore v = [1,1,-2,0,0,0,0]
	id: string                    something unique. You can use the UnitConflicts() global function to detect possible id conflicts
	alias: array                  array of strings - other ids that reference the unit
	name: object                  defines full name or even a short description for every language mutation
	k: number                     this coeficient equates value of the unit in basic units. For example minute = 60 seconds, therefore min.k = 60
	SI: true/false                self-explanatory. This attribute doesn't really do anything, it's merely informational. Perhaps it's redundant, since all SI derived units have k = 1
	basic: true/false             whether it's basic SI unit or derived SI. Basic SI units are of utmost importance to the code, don't ever change them!
	prefix: all/+/-/undefined     it means: all prefixes allowed / only bigger than one allowed / lesser than one / prefixes disallowed. It's not really a restriction, just a recommendation.
	constant: true/undefined      whether it is a constant. If true, attributes SI, basic and prefix are ignored. Prefix is disallowed.
	note: a note that conveys anything important beyond description - what is noteworthy or weird about this unit or its usage. Implemented as an object of strings for all language mutations.
*/

const Units = [
//EIGHT BASIC UNITS
	{v: [1,0,0,0,0,0,0,0], id: 'm', name: {cz: 'metr', en: 'metre'}, k:1, SI: true, basic: true, prefix: 'all'},
	{v: [0,1,0,0,0,0,0,0], id: 'kg', name: {cz: 'kilogram', en: 'kilogram'}, k:1, SI: true, basic: true, note: {
		cz: 'To protože kilogram se obtížně programuje, neboť samo "kilo" je předpona. Proto jsem definoval také gram jako odvozenou jednotku SI, která může mít jakékoliv předpony.',
		en: 'That\'s because kilogram is problematic to code, since the "kilo" itself is a prefix. Therefore I have also defined gram as a derived SI unit, which can have all prefixes.'}},
	{v: [0,0,1,0,0,0,0,0], id: 's', name: {cz: 'sekunda', en: 'second'}, k:1, SI: true, basic: true, prefix: '-'},
	{v: [0,0,0,1,0,0,0,0], id: 'A', name: {cz: 'ampér', en: 'ampere'}, k:1, SI: true, basic: true, prefix: 'all'},
	{v: [0,0,0,0,1,0,0,0], id: 'K', name: {cz: 'kelvin', en: 'kelvin'}, k:1, SI: true, basic: true, prefix: 'all'},
	{v: [0,0,0,0,0,1,0,0], id: 'mol', name: {cz: 'mol', en: 'mole'}, k:1, SI: true, basic: true, prefix: 'all'},
	{v: [0,0,0,0,0,0,1,0], id: 'cd', name: {cz: 'kandela', en: 'candela'}, k:1, SI: true, basic: true, prefix: 'all'},
	//USD arbitrarily set as basic unit. Reference to this unit is harcoded in currency loading!
	{v: [0,0,0,0,0,0,0,1], id: 'USD', alias:['$', 'usd'], name: {cz: 'americký dolar', en: 'US dollar'}, k:1, basic: true, prefix: '+'},

//ALL OTHER UNITS as {id: 'identifier',v: [0,0,0,0,0,0,0], name: {cz: 'CZ', en: 'EN'}, k:1, SI: true, prefix: 'all'},
	{v: [0,0,0,0,0,0,0,0], id: '%', name: {cz: 'procento', en: 'percent'}, k:1e-2},
	{v: [0,0,0,0,0,0,0,0], id: 'ppm', name: {cz: 'dílů na jeden milion', en: 'parts per million'}, k:1e-6},
	{v: [0,0,0,0,0,0,0,0], id: 'rad', name: {cz: 'radián', en: 'radian'}, k:1, SI: true, prefix: '-', note: {
		cz: 'Úhel považuji za bezrozměrné číslo, čili radián je identický s číslem 1.',
		en: 'I consider angle units to be dimensionless, with radian being identical to number 1.'}},
	{v: [0,0,0,0,0,0,0,0], id: '°', alias:['deg'], name: {cz: 'stupeň', en: 'degree'}, k:Math.PI/180},
	{v: [0,0,0,0,0,0,0,0], id: 'gon', name: {cz: 'gradián', en: 'gradian'}, k:Math.PI/200},
	{v: [0,0,-1,0,0,0,0,0], id: 'Hz', name: {cz: 'hertz', en: 'hertz'}, k:1, SI: true, prefix: 'all'},
	{v: [1,1,-2,0,0,0,0,0], id: 'N', name: {cz: 'newton', en: 'newton'}, k:1, SI: true, prefix: 'all'},
	{v: [-1,1,-2,0,0,0,0,0], id: 'Pa', name: {cz: 'pascal', en: 'pascal'}, k:1, SI: true, prefix: 'all'},
	{v: [2,1,-2,0,0,0,0,0], id: 'J', name: {cz: 'joule', en: 'joule'}, k:1, SI: true, prefix: 'all'},
	{v: [2,1,-3,0,0,0,0,0], id: 'W', name: {cz: 'watt', en: 'watt'}, k:1, SI: true, prefix: 'all'},
	{v: [0,0,1,1,0,0,0,0], id: 'C', name: {cz: 'coulomb', en: 'coulomb'}, k:1, SI: true, prefix: 'all'},
	{v: [2,1,-3,-1,0,0,0,0], id: 'V', name: {cz: 'volt', en: 'volt'}, k:1, SI: true, prefix: 'all'},
	{v: [-2,-1,4,2,0,0,0,0], id: 'F', name: {cz: 'farad', en: 'farad'}, k:1, SI: true, prefix: 'all'},
	{v: [2,1,-3,-2,0,0,0,0], id: 'ohm', name: {cz: 'ohm', en: 'ohm'}, k:1, SI: true, prefix: 'all'},
	{v: [-2,-1,3,2,0,0,0,0], id: 'S', name: {cz: 'siemens', en: 'siemens'}, k:1, SI: true, prefix: 'all'},
	{v: [2,1,-2,-1,0,0,0,0], id: 'Wb', name: {cz: 'weber', en: 'weber'}, k:1, SI: true, prefix: 'all'},
	{v: [0,1,-2,-1,0,0,0,0], id: 'T', name: {cz: 'tesla', en: 'tesla'}, k:1, SI: true, prefix: 'all'},
	{v: [2,1,-2,-2,0,0,0,0], id: 'H', name: {cz: 'henry', en: 'henry'}, k:1, SI: true, prefix: 'all'},
	{v: [0,0,0,0,1,0,0,0], id: '°C', name: {cz: 'stupeň Celsia', en: 'degree Celsius'}, k:1, SI: true, note: {
		cz: 'Stupeň Celsia je považován za jednotku rozdílu teploty (ΔT), nikoliv teploty (T)! Program by nemohl poznat, zda-li se vstupem myslí T nebo ΔT, takže bude vždy považován za ΔT. Pro převod teploty (T) použijte konstantu TC0 –  viz tutoriál pro příklad použití.',
		en: 'Degree Celsius is considered to be a unit of temperature difference (ΔT), not temperature (T)! The program couldn\'t tell whether the input is T or ΔT, so it\'s always considered to be ΔT. In order to convert temperature (T) use the TC0 constant – see tutorial how to use it.'}},
	{v: [0,0,0,0,0,0,1,0], id: 'lm', name: {cz: 'lumen', en: 'lumen'}, k:1, SI: true, prefix: 'all'},
	{v: [-2,0,0,0,0,0,1,0], id: 'lx', name: {cz: 'lux', en: 'lux'}, k:1, SI: true, prefix: 'all'},
	{v: [0,0,-1,0,0,0,0,0], id: 'Bq', name: {cz: 'becquerel', en: 'becquerel'}, k:1, SI: true, prefix: 'all'},
	{v: [2,0,-2,0,0,0,0,0], id: 'Gy', name: {cz: 'gray', en: 'gray'}, k:1, SI: true, prefix: 'all'},
	{v: [2,0,-2,0,0,0,0,0], id: 'Sv', name: {cz: 'sievert', en: 'sievert'}, k:1, SI: true, prefix: 'all'},
	{v: [-1,0,0,0,0,0,0,0], id: 'dpt', name: {cz: 'dioptrie', en: 'dioptre'}, k:1, SI: true},

	{v: [0,0,0,0,0,1,0,0], id: 'Nm3', alias:['Ncm'], name: {cz: 'normální krychlový metr', en: 'normal cubic metre'}, k:csts.atm/csts.TC0/csts.R, note: {
		cz: 'Definován při 0°C a 1 atm. Navzdory názvu je Nm3 jednotkou látkového množství, nikoliv objemu.',
		en: 'Defined at 0°C and 1 atm. Despite the name, Nm3 is actually amount of substance, not volume.'}},

	{v: [0,0,1,0,0,0,0,0], id: 'min', name: {cz: 'minuta', en: 'minute'}, k:60},
	{v: [0,0,1,0,0,0,0,0], id: 'h', name: {cz: 'hodina', en: 'hour'}, k:3600},
	{v: [0,0,1,0,0,0,0,0], id: 'd', alias:['day'], name: {cz: 'den', en: 'day'}, k:3600*24},
	{v: [0,0,1,0,0,0,0,0], id: 'week', name: {cz: 'týden', en: 'week'}, k:3600*24*7},
	{v: [0,0,1,0,0,0,0,0], id: 'month', alias:['mth', 'měs'], name: {cz: 'průměrný měsíc', en: 'average month'}, k:3600*24*30.436875, note: {
		cz: 'Vypočten z gregoriánského roku.',
		en: 'Calculated from gregorian year.'}},
	{v: [0,0,1,0,0,0,0,0], id: 'yr', alias:['year'], name: {cz: 'gregoriánský rok', en: 'gregorian year'}, k:3600*24*365.2425, note: {
		cz: 'Pokud si nejste jisti, který rok použít, zvolte tento. Juliánský rok je zastaralý.',
		en: 'If you are unsure which year to use, pick this one. Julian year is obsolete.'}},
	{v: [0,0,1,0,0,0,0,0], id: 'jyr', name: {cz: 'juliánský rok', en: 'julian year'}, k:3600*24*365.25},

	{v: [0,0,-1,0,0,0,0,0], id: 'rpm', name: {cz: 'otáčky za minutu', en: 'revolutions per minute'}, k:1/60},

	{v: [0,0,0,0,1,0,0,0], id: '°F', name: {cz: 'stupeň Fahrenheita', en: 'degree Fahrenheit'}, k:5/9, note: csts.dTnote},
	{v: [0,0,0,0,1,0,0,0], id: '°R', alias:['°Re', '°Ré'], name: {cz: 'stupeň Réaumura', en: 'degree Réaumur'}, k:5/4, note: csts.dTnote},

	{v: [1,0,0,0,0,0,0,0], id: 'Å', name: {cz: 'angstrom', en: 'angstrom'}, k:1e-10, SI: true},
	{v: [1,0,0,0,0,0,0,0], id: 'th', name: {cz: 'thou', en: 'thou'}, k:2.54e-5},
	{v: [1,0,0,0,0,0,0,0], id: 'in', name: {cz: 'palec', en: 'inch'}, k:2.54e-2},
	{v: [1,0,0,0,0,0,0,0], id: 'ft', name: {cz: 'stopa', en: 'foot'}, k:0.3048},
	{v: [1,0,0,0,0,0,0,0], id: 'yd', name: {cz: 'yard', en: 'yard'}, k:0.9144},
	{v: [1,0,0,0,0,0,0,0], id: 'mi', name: {cz: 'míle', en: 'mile'}, k:csts.mile},
	{v: [1,0,0,0,0,0,0,0], id: 'nmi', name: {cz: 'námořní míle', en: 'nautical mile'}, k:1852},
	{v: [1,0,0,0,0,0,0,0], id: 'au', name: {cz: 'astronomická jednotka', en: 'astronomical unit'}, k:149597870700, prefix: '+'},
	{v: [1,0,0,0,0,0,0,0], id: 'pc', name: {cz: 'parsek', en: 'parsec'}, k:3.08567758149137e16, prefix: '+'},
	{v: [1,0,0,0,0,0,0,0], id: 'ly', name: {cz: 'světelný rok', en: 'light-year'}, k:9460730472580800, prefix: '+'},

	{v: [2,0,0,0,0,0,0,0], id: 'a', name: {cz: 'ar', en: 'ar'}, k:100, SI: true, prefix: '+'},
	{v: [2,0,0,0,0,0,0,0], id: 'ac', name: {cz: 'akr', en: 'acre'}, k:4046.872},
	{v: [2,0,0,0,0,0,0,0], id: 'darcy', name: {cz: 'darcy', en: 'darcy'}, k: 9.869233e-13},

	{v: [3,0,0,0,0,0,0,0], id: 'l', name: {cz: 'litr', en: 'litre'}, k:1e-3, SI: true, prefix: 'all'},
	{v: [3,0,0,0,0,0,0,0], id: 'pt', name: {cz: 'pinta', en: 'pint'}, k:568.261e-6},
	{v: [3,0,0,0,0,0,0,0], id: 'gal', name: {cz: 'americký galon', en: 'US gallon'}, k:3.785412e-3},
	{v: [3,0,0,0,0,0,0,0], id: 'bsh', name: {cz: 'americký bušl', en: 'US bushel'}, k:35.2391e-3},
	{v: [3,0,0,0,0,0,0,0], id: 'ccm', name: {cz: 'kubický centimetr', en: 'cubic centimetr'}, k:1e-6},
	{v: [3,0,0,0,0,0,0,0], id: 'bbl', name: {cz: 'barel ropy', en: 'oil barrel'}, k:csts.bbl, prefix: '+'},
	
	{v: [3,0,-1,0,0,0,0,0], id: 'BPD', name: {cz: 'barel ropy za den', en: 'oil barrel per day'}, k:csts.bbl/3600/24, prefix: '+'},

	{v: [0,1,0,0,0,0,0,0], id: 'g', name: {cz: 'gram', en: 'gram'}, k:1e-3, SI: true, prefix: 'all'},
	{v: [0,1,0,0,0,0,0,0], id: 't', name: {cz: 'tuna', en: 'tonne'}, k:1000, SI: true, prefix: '+'},
	{v: [0,1,0,0,0,0,0,0], id: 'gr', name: {cz: 'grain', en: 'grain'}, k:64.79891e-6},
	{v: [0,1,0,0,0,0,0,0], id: 'oz', name: {cz: 'once', en: 'ounce'}, k:28.349523e-3},
	{v: [0,1,0,0,0,0,0,0], id: 'ozt', name: {cz: 'trojská unce', en: 'troy ounce'}, k:31.1034768e-3},
	{v: [0,1,0,0,0,0,0,0], id: 'ct', name: {cz: 'karát', en: 'carat'}, k:200e-6},
	{v: [0,1,0,0,0,0,0,0], id: 'lb', alias:['lbs'], name: {cz: 'libra', en: 'pound'}, k:0.45359237},
	{v: [0,1,0,0,0,0,0,0], id: 'st', name: {cz: 'kámen', en: 'stone'}, k:6.35029318},
	{v: [0,1,0,0,0,0,0,0], id: 'slug', name: {cz: 'slug', en: 'slug'}, k:14.593903},
	{v: [0,1,0,0,0,0,0,0], id: 'ts', name: {cz: 'krátká tuna', en: 'short ton'}, k:907.18474},
	{v: [0,1,0,0,0,0,0,0], id: 'tl', name: {cz: 'imperiální tuna', en: 'long ton'}, k:1016},
	{v: [0,1,0,0,0,0,0,0], id: 'u', alias:['Da'], name: {cz: 'dalton (atomová hmotnostní konstanta)', en: 'dalton (unified atomic mass unit)'}, k:1.660539040e-27},

	{v: [1,0,-1,0,0,0,0,0], id: 'mph', name: {cz: 'míle za hodinu', en: 'mile per hour'}, k:csts.mile/3600},
	{v: [1,0,-1,0,0,0,0,0], id: 'kn', name: {cz: 'uzel', en: 'knot'}, k:1852/3600},

	{v: [1,1,-2,0,0,0,0,0], id: 'dyn', name: {cz: 'dyn', en: 'dyne'}, k:1e-5, prefix: 'all'},

	{v: [2,1,-2,0,0,0,0,0], id: 'Wh', name: {cz: 'watthodina', en: 'watt-hour'}, k:3600, prefix: 'all'},
	{v: [2,1,-2,0,0,0,0,0], id: 'eV', name: {cz: 'elektronvolt', en: 'electronvolt'}, k:csts.q, prefix: 'all'},
	{v: [2,1,-2,0,0,0,0,0], id: 'erg', name: {cz: 'erg', en: 'erg'}, k:1e-7, SI: true, prefix: 'all'},
	{v: [2,1,-2,0,0,0,0,0], id: 'Btu', alias:['BTU','btu'], name: {cz: 'britská tepelná jednotka', en: 'british thermal unit'}, k:csts.BTU, prefix: 'all'},
	{v: [2,1,-2,0,0,0,0,0], id: 'Chu', alias:['CHU','chu'], name: {cz: 'celsiova jednotka tepla', en: 'celsius heat unit'}, k: 1.899101e3, prefix: 'all'},
	{v: [2,1,-2,0,0,0,0,0], id: 'thm', name: {cz: 'therm', en: 'therm'}, k:csts.BTU*1e5, prefix: 'all'},
	{v: [2,1,-2,0,0,0,0,0], id: 'cal', name: {cz: 'kalorie', en: 'calorie'}, k:4.184, prefix: 'all'},
	{v: [2,1,-2,0,0,0,0,0], id: 'TNT', name: {cz: 'ekvivalent tuny TNT', en: 'ton of TNT equivalent'}, k:4.184e9, prefix: '+'},
	{v: [2,1,-2,0,0,0,0,0], id: 'BOE', alias: ['BFOE'], name: {cz: 'ekvivalent barelu ropy', en: 'barrel of oil equivalent'}, k:5.8e6*csts.BTU, prefix: '+'},

	{v: [-1,0,0,1,0,0,0,0], id: 'Oe', name: {cz: 'oersted', en: 'oersted'}, k:1000/(4*Math.PI), prefix: 'all'},

	{v: [2,1,-3,0,0,0,0,0], id: 'hp', name: {cz: 'imperiální koňská síla', en: 'imperial horsepower'}, k:745.69987158227022},

	{v: [-1,1,-1,0,0,0,0,0], id: 'P', name: {cz: 'poise', en: 'poise'}, k:0.1, SI: true, prefix: 'all'},
	{v: [2,0,-1,0,0,0,0,0], id: 'St', name: {cz: 'stokes', en: 'stokes'}, k:1e-4, SI: true, prefix: 'all'},

	{v: [-1,1,-2,0,0,0,0,0], id: 'bar', name: {cz: 'bar', en: 'bar'}, k:1e5, SI: true, prefix: 'all'},
	{v: [-1,1,-2,0,0,0,0,0], id: 'atm', name: {cz: 'atmosféra', en: 'atmosphere'}, k:csts.atm, note: {
		cz: 'Také slouží jako standardní tlak.',
		en: 'Also serves as standard pressure.'}},
	{v: [-1,1,-2,0,0,0,0,0], id: 'mmHg', name: {cz: 'milimetr rtuťového sloupce', en: 'milimetre of mercury'}, k:133.322387415, note: {
		cz: 'Mezi mmHg a Torr je nepatrný rozdíl.',
		en: 'There is a negligible difference between mmHg and Torr.'}},
	{v: [-1,1,-2,0,0,0,0,0], id: 'Torr', alias:['torr'], name: {cz: 'torr', en: 'torr'}, k:csts.atm/760, prefix: 'all', note: {
		cz: 'Mezi mmHg a Torr je nepatrný rozdíl.',
		en: 'There is a negligible difference between mmHg and Torr.'}},
	{v: [-1,1,-2,0,0,0,0,0], id: 'psi', name: {cz: 'libra na čtvereční palec', en: 'pound per square inch'}, k:6894.757293168362, prefix: 'all'},

	{v: [0,1,-2,-1,0,0,0,0], id: 'G', name: {cz: 'gauss', en: 'gauss'}, k:0.0001, SI: true, prefix: 'all'},

	{v: [1,0,-2,0,0,0,0,0], id: '_g', name: {cz: 'normální tíhové zrychlení', en: 'standard gravity'}, k:9.80665, constant: true, note: {
		cz: 'Nikoliv univerzální konstanta, nýbrž konvenční.',
		en: 'Not a universal constant, but a conventional one.'}},
	{v: [1,0,-1,0,0,0,0,0], id: '_c', name: {cz: 'rychlost světla ve vakuu', en: 'speed of light in vacuum'}, k:299792458, constant: true},
	{v: [3,-1,-2,0,0,0,0,0], id: '_G', name: {cz: 'gravitační konstanta', en: 'gravitational constant'}, k:6.67408e-11, constant: true},
	{v: [2,1,-1,0,0,0,0,0], id: '_h', name: {cz: 'Planckova konstanta', en: 'Planck constant'}, k:6.626070040e-34, constant: true},
	{v: [2,1,-2,0,-1,0,0,0], id: '_k', name: {cz: 'Boltzmannova konstanta', en: 'Boltzmann constant'}, k:1.38064852e-23, constant: true},
	{v: [2,1,-2,0,-1,-1,0,0], id: '_R', name: {cz: 'plynová konstanta', en: 'gas constant'}, k:csts.R, constant: true},
	{v: [1,1,-2,-2,0,0,0,0], id: '_mu', alias:['μ'], name: {cz: 'permeabilita vakua', en: 'vacuum permeability'}, k:1.2566370614e-6, constant: true},
	{v: [-3,-1,4,2,0,0,0,0], id: '_E', name: {cz: 'permitivita vakua', en: 'vacuum permittivity'}, k:8.854187817e-12, constant: true},
	{v: [0,0,1,1,0,0,0,0], id: '_q', name: {cz: 'elementární náboj', en: 'elementary charge'}, k:csts.q, constant: true},
	{v: [0,0,0,0,0,-1,0,0], id: '_NA', name: {cz: 'Avogadrova konstanta', en: 'Avogadro constant'}, k:6.02214085e23, constant: true},
	{v: [0,0,0,0,0,0,0,0], id: '_pi', alias:['π'], name: {cz: 'Ludolfovo číslo', en: 'Archimedes\' constant'}, k:Math.PI, constant: true},
	{v: [0,0,0,0,0,0,0,0], id: '_e', name: {cz: 'Eulerovo číslo', en: 'Euler\'s number'}, k:Math.E, constant: true},
	{v: [0,0,0,0,1,0,0,0], id: '_C0', alias:['_°C0','_TC0','TC0'], name: {cz: '0°C v kelvinech', en: '0°C in kelvin'}, k:csts.TC0, constant: true, note: csts.T0note},
	{v: [0,0,0,0,1,0,0,0], id: '_F0', alias:['_°F0','_TF0','TF0'], name: {cz: '0°F v kelvinech', en: '0°F in kelvin'}, k:csts.TF0, constant: true, note: csts.T0note},
	{v: [0,0,0,0,1,0,0,0], id: 'C2F', name: {cz: 'TC0 - TF0', en: 'TC0 - TF0'}, k:csts.TC0 - csts.TF0, constant: true, note: csts.T0note},
	{v: [0,0,0,0,1,0,0,0], id: 'F2C', name: {cz: 'TF0 - TC0', en: 'TF0 - TC0'}, k:csts.TF0 - csts.TC0, constant: true, note: csts.T0note}
];

//currencies - their conversion ratio to dollar is unknown and will be obtained by currencies.php
//k and v will be filled later (v is always the same, k is obtained from API)
const Currencies = [
	{id: 'EUR', alias:['€'], name: {cz: 'euro', en: 'Euro'}},
	{id: 'AED', name: {cz: 'dirham Spojených arabských emirátů', en: 'United Arab Emirates Dirham'}},
	{id: 'ARS', name: {cz: 'argentinské peso', en: 'Argentine Peso'}},
	{id: 'AUD', name: {cz: 'australský dolar', en: 'Australian Dollar'}},
	{id: 'BGN', name: {cz: 'bulharský lev', en: 'Bulgarian Lev'}},
	{id: 'BRL', name: {cz: 'braziliský real', en: 'Brazilian Real'}},
	{id: 'CAD', name: {cz: 'kanadský dolar', en: 'Canadian Dollar'}},
	{id: 'CHF', name: {cz: 'švýcarský frank', en: 'Swiss Franc'}},
	{id: 'CNY', name: {cz: 'čínský juan', en: 'Chinese Yuan'}},
	{id: 'CZK', alias:['Kč'], name: {cz: 'česká koruna', en: 'Czech Republic Koruna'}},
	{id: 'DKK', name: {cz: 'dánská koruna', en: 'Danish Krone'}},
	{id: 'GBP', alias:['£'], name: {cz: 'britská libra', en: 'British Pound Sterling'}},
	{id: 'HKD', name: {cz: 'hongkongský dolar', en: 'Hong Kong Dollar'}},
	{id: 'HRK', name: {cz: 'chorvatská kuna', en: 'Croatian Kuna'}},
	{id: 'HUF', name: {cz: 'maďarský forint', en: 'Hungarian Forint'}},
	{id: 'IDR', name: {cz: 'indonéská rupie', en: 'Indonesian Rupiah'}},
	{id: 'ILS', name: {cz: 'nový izraelský šekel', en: 'Israeli New Sheqel'}},
	{id: 'INR', name: {cz: 'indická rupie', en: 'Indian Rupee'}},
	{id: 'JPY', alias: ['¥'], name: {cz: 'japonský jen', en: 'Japanese Yen'}},
	{id: 'KRW', name: {cz: 'jihokorejský won', en: 'South Korean Won'}},
	{id: 'MXN', name: {cz: 'mexické peso', en: 'Mexican Peso'}},
	{id: 'NOK', name: {cz: 'norská koruna', en: 'Norwegian Krone'}},
	{id: 'NZD', name: {cz: 'novozélandský dolar', en: 'New Zealand Dollar'}},
	{id: 'PLN', name: {cz: 'polský zlotý', en: 'Polish Zloty'}},
	{id: 'RON', name: {cz: 'rumunské leu', en: 'Romanian Leu'}},
	{id: 'RUB', name: {cz: 'ruský rubl', en: 'Russian Ruble'}},
	{id: 'SEK', name: {cz: 'švédská koruna', en: 'Swedish Krona'}},
	{id: 'SGD', name: {cz: 'singapurský dolar', en: 'Singapore Dollar'}},
	{id: 'THB', name: {cz: 'thajský baht', en: 'Thai Baht'}},
	{id: 'TRY', name: {cz: 'turecká lira', en: 'Turkish Lira'}},
	{id: 'VND', name: {cz: 'vietnamský dong', en: 'Vietnamese Dong'}},
	{id: 'ZAR', name: {cz: 'jihoafrický rand', en: 'South African Rand'}},
	{id: 'BTC', name: {cz: 'bitcoin', en: 'Bitcoin'}}
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
