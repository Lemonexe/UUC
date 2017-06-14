# UUC
Ultimate Unit Converter, a useful tool for science and engineering

The app is functional using only HTML/JS (with ECMAscript 6), its functionality is extended by a PHP script on server.

## Code Structure
All static HTML GUI is in  **index.html**, CSS in *style.css*.

All code logic is in **engine.js**. Model, view and controller are kind of mixed... There are also functions for dynamically generated HTML (program output, reference).

Auxiliary/general purpose functions are global and then there is the **convert** object, which contains code related to the unit conversion itself.

All program data (units and prefixes) is stored in **data.js**.

**save.php** is a PHP program for unit suggestions.

There is commentary in the entire code, I think it is sufficient. I have to admit that code quality *could* be better, but it isn't a large application, therefore some laziness is acceptable :-)
