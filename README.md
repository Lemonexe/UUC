# UUC
Ultimate Unit Converter, a useful tool for science and engineering

While the core features of the app are performed on the front-end using only HTML/JS, its functionality is extended by a PHP script running on server.
The front-end is written in ECMA6 Javascript and uses [AngularJS](https://angularjs.org/) framework.

## Code Structure
Basic outline of HTML GUI is in **index.html**, but most of the page is defined in language-dependent templates, **app/template.EN.html** or **app/template.CZ.html**.
All CSS is stored in **app/style.css**.

### Javascript

**app/core.js** initializes the program and contains some generic-purpose global functions.

**app/convert.js** defines the `convert` object, the application Model. It contains all code related to the unit conversion itself.

**app/middle.js** defines the Angular module and controller.
All functionality related to View and Controller is defined in the Angular controller function.

**data.js** contains all program data, which are divided in three objects:  
`Units` is the unit database itself  
`Prefixes` defines standard SI prefixes  
`Currency` contains empty objects for currency units (which will then be filled with latest values and merged with Units).

### Other

Currency exchange rates are served by **app/currencies.php**, which communicates with the free [API](https://fixer.io/).
The JSON response is cached in *app/currencies.json* and is updated daily by the real API call (upon first request of the day).  
Your API key provided by the website is stored in *app/API_key*, which is of course excluded from repository. Store your own key at this address.

There is commentary in the entire code, and I think it is sufficient. I have to admit that code quality *could* be better, but as it isn't a very large application, some laziness is acceptable :-)
