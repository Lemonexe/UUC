/*
Units object is the database of all known units.
	v: [m,kg,s,A,K,mol,cd,$]	represents the vector of powers of basic units, for example N=kg*m/s^2, therefore v = [1,1,-2,0,0,0,0]
	id: something unique
	name: full name or even a short description 
	k: number						this coeficient equates value of the unit in basic units. For example minute = 60 seconds, therefore min.k = 60
	SI: true/false					self-explanatory. This attribute doesn't really do anything, it's merely informational. Perhaps it's redundant, since all SI derived units have k = 1
	basic: true/false				whether it's basic SI unit or derived SI. Basic SI units are of utmost importance to the code, don't ever change them!
	prefix: all/+/-/undefined		it means: all prefixes allowed / only bigger than one allowed / lesser than one / prefixes disallowed. It's not really a restriction, just a recommendation.
	constant: true/undefined		whether it is a constant. If true, attributes SI, basic and prefix are ignored. Prefix is disallowed.
	note: a note that conveys anything important beyond description - what is noteworthy or weird about this unit or its usage
*/

let Units = [
	{v: [1,0,0,0,0,0,0,0], id: 'm', name: 'metre', k:1, SI: true, basic: true, prefix: 'all'},
	{v: [0,1,0,0,0,0,0,0], id: 'kg', name: 'kilogram', k:1, SI: true, basic: true,
		note: 'That\'s because kilogram is problematic to code, since the "kilo" itself is a prefix... Therefore I have also defined gram as a derived SI unit, which can have all prefixes.'},
	{v: [0,0,1,0,0,0,0,0], id: 's', name: 'second', k:1, SI: true, basic: true, prefix: '-'},
	{v: [0,0,0,1,0,0,0,0], id: 'A', name: 'ampere', k:1, SI: true, basic: true, prefix: 'all'},
	{v: [0,0,0,0,1,0,0,0], id: 'K', name: 'kelvin', k:1, SI: true, basic: true, prefix: 'all'},
	{v: [0,0,0,0,0,1,0,0], id: 'mol', name: 'mole', k:1, SI: true, basic: true, prefix: 'all'},
	{v: [0,0,0,0,0,0,1,0], id: 'cd', name: 'candela', k:1, SI: true, basic: true, prefix: 'all'},
	//USD arbitrarily set as basic unit. Reference to this unit is harcoded in currency loading!
	{v: [0,0,0,0,0,0,0,1], id: 'USD', name: 'US dollar', k:1, basic: true},

	//HERE COME UNITS WITH THIS FORMAT: {id: '',v: [0,0,0,0,0,0,0], name: '', k:1, SI: true, prefix: 'all'},
	{v: [0,0,0,0,0,0,0,0], id: 'rad', name: 'radian', k:1, SI: true, prefix: '-', note: 'I consider angle units to be dimensionless, with radian being identical to 1.'},
	{v: [0,0,0,0,0,0,0,0], id: '°', name: 'degree', k:Math.PI/180},
	{v: [0,0,0,0,0,0,0,0], id: 'deg', name: 'degree', k:Math.PI/180},
	{v: [0,0,0,0,0,0,0,0], id: 'gon', name: 'gradian', k:Math.PI/200},
	{v: [0,0,-1,0,0,0,0,0], id: 'Hz', name: 'hertz', k:1, SI: true, prefix: 'all'},
	{v: [1,1,-2,0,0,0,0,0], id: 'N', name: 'newton', k:1, SI: true, prefix: 'all'},
	{v: [-1,1,-2,0,0,0,0,0], id: 'Pa', name: 'pascal', k:1, SI: true, prefix: 'all'},
	{v: [2,1,-2,0,0,0,0,0], id: 'J', name: 'joule', k:1, SI: true, prefix: 'all'},
	{v: [2,1,-3,0,0,0,0,0], id: 'W', name: 'watt', k:1, SI: true, prefix: 'all'},
	{v: [0,0,1,1,0,0,0,0], id: 'C', name: 'coulomb', k:1, SI: true, prefix: 'all'},
	{v: [2,1,-3,-1,0,0,0,0], id: 'V', name: 'volt', k:1, SI: true, prefix: 'all'},
	{v: [-2,-1,4,2,0,0,0,0], id: 'F', name: 'farad', k:1, SI: true, prefix: 'all'},
	{v: [2,1,-3,-2,0,0,0,0], id: 'ohm', name: 'ohm', k:1, SI: true, prefix: 'all'},
	{v: [-2,-1,3,2,0,0,0,0], id: 'S', name: 'siemens', k:1, SI: true, prefix: 'all'},
	{v: [2,1,-2,-1,0,0,0,0], id: 'Wb', name: 'weber', k:1, SI: true, prefix: 'all'},
	{v: [0,1,-2,-1,0,0,0,0], id: 'T', name: 'tesla', k:1, SI: true, prefix: 'all'},
	{v: [2,1,-2,-2,0,0,0,0], id: 'H', name: 'henry', k:1, SI: true, prefix: 'all'},
	{v: [0,0,0,0,1,0,0,0], id: '°C', name: 'degree Celsius', k:1, SI: true,
		note: 'Degree Celsius is considered to be a unit of temperature <b>difference</b> (ΔT), not temperature (T)! It doesn\'t make any sense to multiply T in °C with other units or raise it to power, and the program cannot possibly tell whether the input is T or ΔT, so it\'s always considered to be ΔT. Try google for simple temperature conversion!'},
	{v: [0,0,0,0,0,0,1,0], id: 'lm', name: 'lumen', k:1, SI: true, prefix: 'all'},
	{v: [-2,0,0,0,0,0,1,0], id: 'lx', name: 'lux', k:1, SI: true, prefix: 'all'},
	{v: [0,0,-1,0,0,0,0,0], id: 'Bq', name: 'becquerel', k:1, SI: true, prefix: 'all'},
	{v: [2,0,-2,0,0,0,0,0], id: 'Gy', name: 'gray', k:1, SI: true, prefix: 'all'},
	{v: [2,0,-2,0,0,0,0,0], id: 'Sv', name: 'sievert', k:1, SI: true, prefix: 'all'},
	
	{v: [0,0,0,0,0,1,0,0], id: 'Ncm', name: 'normal cubic metre', k:(101325)/(273.15*8.3144598),
		note: 'Defined at 0°C and 1 atm. Despite the name, Ncm is actually amount of substance, not volume.'},

	{v: [0,0,1,0,0,0,0,0], id: 'min', name: 'minute', k:60},
	{v: [0,0,1,0,0,0,0,0], id: 'h', name: 'hour', k:3600},
	{v: [0,0,1,0,0,0,0,0], id: 'd', name: 'day', k:3600*24},
	{v: [0,0,1,0,0,0,0,0], id: 'week', name: 'seven-day week', k:3600*24*7},
	{v: [0,0,1,0,0,0,0,0], id: 'month', name: 'average gregorian month', k:3600*24*30.436875, note: 'If you are unsure which year is right, use this one. Julian year is obsolete.'},
	{v: [0,0,1,0,0,0,0,0], id: 'yr', name: 'gregorian year', k:3600*24*365.2425},
	{v: [0,0,1,0,0,0,0,0], id: 'jyr', name: 'julian year', k:3600*24*365.25},

	{v: [0,0,0,0,1,0,0,0], id: '°F', name: 'degree Fahrenheit', k:5/9, note: 'See °C for an important note.'},
	{v: [0,0,0,0,1,0,0,0], id: '°R', name: 'degree Réaumur', k:5/4, note: 'See °C for an important note.'},

	{v: [1,0,0,0,0,0,0,0], id: 'Å', name: 'angstrom', k:1e-10, SI: true},
	{v: [1,0,0,0,0,0,0,0], id: 'th', name: 'thou', k:2.54e-5},
	{v: [1,0,0,0,0,0,0,0], id: 'in', name: 'inch', k:2.54e-2},
	{v: [1,0,0,0,0,0,0,0], id: 'ft', name: 'foot', k:0.3048},
	{v: [1,0,0,0,0,0,0,0], id: 'yd', name: 'yard', k:0.9144},
	{v: [1,0,0,0,0,0,0,0], id: 'mi', name: 'mile', k:1609.344},
	{v: [1,0,0,0,0,0,0,0], id: 'nmi', name: 'nautical mile', k:1852},
	{v: [1,0,0,0,0,0,0,0], id: 'au', name: 'astronomical unit', k:149597870700, prefix: '+'},
	{v: [1,0,0,0,0,0,0,0], id: 'pc', name: 'parsec', k:3.08567758149137e16, prefix: '+'},
	{v: [1,0,0,0,0,0,0,0], id: 'ly', name: 'light-year', k:9460730472580800, prefix: '+'},

	{v: [2,0,0,0,0,0,0,0], id: 'a', name: 'ar', k:100, SI: true, prefix: '+'},
	{v: [2,0,0,0,0,0,0,0], id: 'ac', name: 'acre', k:4046.872},

	{v: [3,0,0,0,0,0,0,0], id: 'l', name: 'litre', k:1e-3, SI: true, prefix: 'all'},
	{v: [3,0,0,0,0,0,0,0], id: 'pt', name: 'pint', k:568.261e-6},
	{v: [3,0,0,0,0,0,0,0], id: 'gal', name: 'US gallon', k:3.785412e-3},
	{v: [3,0,0,0,0,0,0,0], id: 'bsh', name: 'US bushel', k:35.2391e-3},
	{v: [3,0,0,0,0,0,0,0], id: 'bbl', name: 'oil barrel', k:158.987294928e-3},

	{v: [0,1,0,0,0,0,0,0], id: 'g', name: 'gram', k:1e-3, SI: true, prefix: 'all'},
	{v: [0,1,0,0,0,0,0,0], id: 't', name: 'tonne', k:1000, SI: true, prefix: '+'},
	{v: [0,1,0,0,0,0,0,0], id: 'gr', name: 'grain', k:64.79891e-6},
	{v: [0,1,0,0,0,0,0,0], id: 'oz', name: 'ounce', k:28.349523e-3},
	{v: [0,1,0,0,0,0,0,0], id: 'ozt', name: 'troy ounce', k:31.1034768e-3},
	{v: [0,1,0,0,0,0,0,0], id: 'ct', name: 'carat', k:200e-6},
	{v: [0,1,0,0,0,0,0,0], id: 'lb', name: 'pound', k:0.45359237},
	{v: [0,1,0,0,0,0,0,0], id: 'st', name: 'stone', k:6.35029318},
	{v: [0,1,0,0,0,0,0,0], id: 'slug', name: 'slug', k:14.593903},
	{v: [0,1,0,0,0,0,0,0], id: 'ts', name: 'short ton', k:907.18474},
	{v: [0,1,0,0,0,0,0,0], id: 'tl', name: 'long ton', k:1016},
	{v: [0,1,0,0,0,0,0,0], id: 'u', name: 'unified atomic mass unit', k:1.660539040e-27, note: 'Same as dalton (Da)'},
	{v: [0,1,0,0,0,0,0,0], id: 'Da', name: 'dalton', k:1.660539040e-27, note: 'Same as unified atomic mass unit (u)'},

	{v: [1,0,-1,0,0,0,0,0], id: 'mph', name: 'mile per hour', k:1609.344/3600},
	{v: [1,0,-1,0,0,0,0,0], id: 'kn', name: 'knot', k:1852/3600},

	{v: [2,1,-2,0,0,0,0,0], id: 'eV', name: 'electronvolt', k:1.60217653e-19, prefix: 'all'},
	{v: [2,1,-2,0,0,0,0,0], id: 'erg', name: 'erg', k:1e-7, SI: true, prefix: 'all'},
	{v: [2,1,-2,0,0,0,0,0], id: 'Btu', name: 'british thermal unit', k:1055.05585, prefix: 'all'},
	{v: [2,1,-2,0,0,0,0,0], id: 'cal', name: 'calorie', k:4.184, prefix: 'all'},
	{v: [2,1,-2,0,0,0,0,0], id: 'TNT', name: 'ton of TNT equivalent', k:4.184e9, prefix: 'all'},

	{v: [-1,0,0,1,0,0,0,0], id: 'Oe', name: 'oersted', k:1000/(4*Math.PI), prefix: 'all'},

	{v: [2,1,-3,0,0,0,0,0], id: 'hp', name: 'imperial horsepower', k:745.69987158227022},

	{v: [-1,1,-1,0,0,0,0,0], id: 'P', name: 'poise', k:0.1, SI: true, prefix: 'all'},

	{v: [-1,1,-2,0,0,0,0,0], id: 'bar', name: 'bar', k:1e5, SI: true, prefix: 'all'},
	{v: [-1,1,-2,0,0,0,0,0], id: 'atm', name: 'atmospehre', k:101325, note: 'Also serves as standard pressure.'},
	{v: [-1,1,-2,0,0,0,0,0], id: 'mmHg', name: 'milimetre of mercury', k:133.322387415, note: 'There is a negligible difference between mmHg and torr.'},
	{v: [-1,1,-2,0,0,0,0,0], id: 'Torr', name: 'torr', k:101325/760, prefix: 'all', note: 'There is a negligible difference between mmHg and torr.'},
	{v: [-1,1,-2,0,0,0,0,0], id: 'psi', name: 'pound per square inch', k:6894.757, prefix: 'all'},

	{v: [0,1,-2,-1,0,0,0,0], id: 'G', name: 'gauss', k:0.0001, SI: true, prefix: 'all'},

	{v: [1,0,-2,0,0,0,0,0], id: '_g', name: 'standard gravity', k:9.80665, constant: true, note: 'Not a universal constant, but a conventional one.'},
	{v: [1,0,-1,0,0,0,0,0], id: '_c', name: 'speed of light in vacuum', k:299792458, constant: true},
	{v: [3,-1,-2,0,0,0,0,0], id: '_G', name: 'gravitational constant', k:6.67408e-11, constant: true},
	{v: [2,1,-1,0,0,0,0,0], id: '_h', name: 'Planck constant', k:6.626070040e-34, constant: true},
	{v: [2,1,-2,0,-1,0,0,0], id: '_k', name: 'Boltzman constant', k:1.38064852e-23, constant: true},
	{v: [2,1,-2,0,-1,-1,0,0], id: '_R', name: 'gas constant', k:8.3144598, constant: true},
	{v: [1,1,-2,-2,0,0,0,0], id: '_mu', name: 'vacuum permeability', k:1.2566370614e-6, constant: true},
	{v: [-3,-1,4,2,0,0,0,0], id: '_E', name: 'vacuum permittivity', k:8.854187817e-12, constant: true},
	{v: [0,0,1,1,0,0,0,0], id: '_q', name: 'elementary charge', k:1.6021766208e-19, constant: true},
	{v: [0,0,0,0,0,-1,0,0], id: '_NA', name: 'Avogadro constant', k:6.02214085e23, constant: true},
	{v: [0,0,0,0,0,0,0,0], id: '_pi', name: 'pi (mathematical)', k:Math.PI, constant: true},
	{v: [0,0,0,0,0,0,0,0], id: '_e', name: 'e (mathematical)', k:Math.E, constant: true},
	{v: [0,0,0,0,0,0,0,0], id: '_sqrt2', name: 'square root of 2', k:Math.sqrt(2), constant: true},
	{v: [0,0,0,0,0,0,0,0], id: '_sqrt3', name: 'square root of 3', k:Math.sqrt(3), constant: true}
];

//currencies - their conversion ratio to dollar is unknown and will be obtained by currencies.php
//k and v will be filled later (v is always the same, k is obtained from API)
let Currency = [
	{id: "EUR", name: "Euro"},
	{id: "AED", name: "United Arab Emirates Dirham"},
	{id: "ARS", name: "Argentine Peso"},
	{id: "AUD", name: "Australian Dollar"},
	{id: "BGN", name: "Bulgarian Lev"},
	{id: "BRL", name: "Brazilian Real"},
	{id: "CAD", name: "Canadian Dollar"},
	{id: "CHF", name: "Swiss Franc"},
	{id: "CNY", name: "Chinese Yuan"},
	{id: "CZK", name: "Czech Republic Koruna"},
	{id: "DKK", name: "Danish Krone"},
	{id: "GBP", name: "British Pound Sterling"},
	{id: "HKD", name: "Hong Kong Dollar"},
	{id: "HRK", name: "Croatian Kuna"},
	{id: "HUF", name: "Hungarian Forint"},
	{id: "IDR", name: "Indonesian Rupiah"},
	{id: "ILS", name: "Israeli New Sheqel"},
	{id: "INR", name: "Indian Rupee"},
	{id: "JPY", name: "Japanese Yen"},
	{id: "KRW", name: "South Korean Won"},
	{id: "MXN", name: "Mexican Peso"},
	{id: "NOK", name: "Norwegian Krone"},
	{id: "NZD", name: "New Zealand Dollar"},
	{id: "PLN", name: "Polish Zloty"},
	{id: "RON", name: "Romanian Leu"},
	{id: "RUB", name: "Russian Ruble"},
	{id: "SEK", name: "Swedish Krona"},
	{id: "SGD", name: "Singapore Dollar"},
	{id: "THB", name: "Thai Baht"},
	{id: "TRY", name: "Turkish Lira"},
	{id: "VND", name: "Vietnamese Dong"},
	{id: "ZAR", name: "South African Rand"},
	{id: "BTC", name: "Bitcoin"}
];

//standard SI prefixes
const Prefixes = [
	{id: 'a', v: -18},
	{id: 'f', v: -15},
	{id: 'p', v: -12},
	{id: 'n', v: -9},
	{id: 'u', v: -6},
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
