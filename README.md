# UUC
Ultimate Unit Converter II, a useful tool for science and engineering. [Live application](http://jira.zby.cz/content/UUC/)

While the core features of the app are performed on the front-end using only HTML/JS, its functionality is extended by a PHP script running on server.
The front-end is written in ECMA6 Javascript and uses [AngularJS](https://angularjs.org/) framework.

## Code Structure
Almost whole HTML GUI is in **index.php**, except for the tutorial window, which is in *res/tutorial.html*.  
All static CSS is stored in **app/style.css**, plus there are several ng-style declarations in *app/controller.js*.

### Javascript
All javascript files are listed here in the same order as they are loaded in **index.html**:

**libs/angular.min.js**, the sole dependency of this project. Application was developed with AngularJS v1.7.6.

**app/convert.js** defines the `Convert()` function, constructor for an object that acts as the application Model and contains all the main code related to the unit conversion itself and the subseqeuent calculations.

**app/convert_parse.js** defines the `Convert_parse()` function, which parses an input string into a detailed nested structure, which represents a mathematical expression with physical quantities.

**app/convert_macro.js** defines the `Convert_macro()` function, which is simply appended to the main convert object. It serves to interpret and execute the macro code.

**app/lang.js** defines `langService`, which contains functionality related to translation, as well as the actual translation table for string messages.
In HTML the translation is done on spot via directives.

**app/data.js** contains all program data, which is divided into three objects:  
`Units` is the unit database itself  
`Prefixes` defines standard SI prefixes  
`Currency` contains empty objects for currency units (which will then be filled with latest values and merged with `Units`).

**app/misc.js** initializes the program and contains some generic-purpose global functions for saving/loading, maintenance...

**app/controller.js** defines the Angular module and controller, as well as all directives at the end.
All functionality related to View and Controller is defined here in the Angular controller function either as a part of `$scope`, or as local variables and functions.

**app/tests.js** defines the `tests()` function, which contains a DIY test infrastructure, and of course the unit tests themselves.
Only the application model is considered complicated enough to deserve the luxury of test coverage.

### Other

Currency exchange rates are served by **app/currencies.php**, which communicates with the public [API](https://fixer.io/).
The JSON response is cached in *app/currencies.json* and is updated daily by the real API call (upon first request of the day).  
Your API key provided by the website is stored in *app/API_key* (simple plain text), which is of course excluded from repository. Store your own key in this file.

There is commentary in the entire code, and I think it is sufficient. I have to admit that code quality *could* be better, but as it isn't a very large application, some laziness is acceptable :-)
