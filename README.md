# UUC
Ultimate Unit Converter II, a useful tool for science and engineering.  
[Click here](http://jira.zby.cz/content/UUC/) for live application.

You can find a lot of unit converters on the internet, but I've always wished for an option to convert complicated units – units composed as a product of various units with different powers, e.g. Btu/°F/lb → kJ/K/kg.
With no other freeware alternative, I created this converter, which can convert any unit to any other and break them down to basic SI as well.
In fact, it can even parse and interpret any expression with physical quantities, just like the way how programming languages parse purely numerical expressions.

_Contains:_ an abundance of units, including up-to-date world currencies as well as everlasting constants, an easy-to-use web interface, an interactive tutorial with examples, and full coverage in English & Czech language.

## Philosophy
Here I want explain in essence the process that UUC undergoes when you enter a string with input.
Deeper insight can be gained by reading the `convert.js` & `convert_parse.js` source code, which is supplemented with //commentary.

First comes the string parsing, which identifies a collection of numbers, units with prefixes and arithmetic operators.
Parentheses are handled via recursion, forming a deeper array – the result of parsing is a detailed nested structure.

Second step is converting every number and unit object to a `Q` instance: an object that represents a physical quantity, comprising a number `n` and vector of dimensions `v`,
which can be understood as vector of powers of 8 basic units (7 basic SI + dollar) that form a quantity with the same dimension.
For example, `J = m^2 · kg · s^-2`, therefore `v = [2,1,-2,0,0,0,0,0]`.  
This is the best thing about UUC: instead of multiple databases for each thinkable dimension, there is a single database of _all units_ as well as universal constants, each defined by their dimension `v` and their SI value `n`.
This key feature enables you to combine any units freely.

Finally, the whole nested structure is condensed into a single quantity object via `Q` arithmetic – addition, subtraction, multiplication, division and power are recreated to work with physical quantities instead of mere numbers.
Standard operator precedence applies, recursion handles parentheses from deepest to shallowest.  
For example `Q1·Q2` is performed by `n1·n2` & `v1+v2`, while `Q^3` by `n^3` & `v·3` etc.

Having processed the input string to gain the final `n` and `v`, the number `n` then represents the numerical value in basic SI units, which are composed by `v`.
If there are no target units set, the job is done – input is converted to SI.
In order to convert the input into target units, all we have to do is calling the same procedure for target string, check if the `v` vectors match, and then simply divide the two `n` numbers!

The above described procedure is so generalized and universal, it can handle anything... Except the exceptions.
Non-linear units such as °C, °F are a simple problem with a complicated solution:
in input, the {substitution functions} behave partially like (parentheses), but they are resolved by special functions that bypass parts of the main procedure.
Moreover, this approach loses its original symmetry, as the whole procedure has to be bypassed when {} is used in target units.

One last note: the parsing procedure also applies when searching for units in Reference.  
And that's all – that's the spirit of UUC.

## Code Structure
While the core features of the app are performed on the front-end using only HTML/JS, its functionality is extended by a PHP script running on server.
The front-end is written in ECMA6 Javascript and uses [AngularJS 1.7](https://angularjs.org/) framework.
Almost whole HTML GUI is in **index.php**, except for the tutorial window, which is in *res/tutorial.html*.  
All static CSS is stored in **app/style.css**, plus there are several ng-style declarations in *app/controller.js*.

### Javascript
All javascript files are listed here in the same order as they are loaded in **index.html**:

**libs/angular.min.js**, the sole dependency of this project. Application was developed with AngularJS v1.7.6.

**app/convert.js** defines the `Convert()` function, constructor for an object that acts as the application Model and contains all the main code related to `Q` arithmetic, unit conversion itself and subseqeuent calculations.

**app/convert_parse.js** defines the `Convert_parse()` function, which parses an input string into a detailed nested structure, which represents a mathematical expression with unit objects and numbers.

**app/convert_macro.js** defines the `Convert_macro()` function, which is simply appended to the main convert object. It serves to interpret and execute the macro code.

**app/lang.js** defines `langService`, which contains functionality related to translation, as well as the actual translation table for string messages.
In HTML the translation is done on spot via Angular directives.

**app/data.js** contains all program data, which is divided into these objects:  
`csts` contains application constants  
`Units` is the unit database itself  
`Prefixes` defines standard SI prefixes  
`Currency` contains empty objects for currency units (to be filled with current values and merged with `Units`)  
`Unitfuns` defines the special {substitution functions}

**app/misc.js** initializes the program and contains some generic-purpose global functions for saving/loading the application state, as well as maintenance functions.

**app/controller.js** defines the Angular module and controller, as well as all directives at the end.
All functionality related to View and Controller is defined here in the Angular controller function either as a part of `$scope`, or as local variables and functions.

**app/tests.js** defines the `tests()` function, which contains a DIY test infrastructure, and of course the unit tests themselves.
Only the application model is considered complicated enough to deserve the luxury of test coverage.

### Other

Currency exchange rates are served by **app/currencies.php**, which communicates with the public [API](https://fixer.io/).
The JSON response is cached in *app/currencies.json* and is updated daily by the real API call (upon first request of the day).  
Your API key provided by the website is stored in *app/API_key* (simple plain text), which is of course excluded from repository. Store your own key in this file.

There is commentary in the entire code, and I think it is sufficient to understand it, provided you have read the Philosophy section above. Have fun deciphering my convoluted one-liners :-)
