# UUC
Ultimate Unit Converter, a useful tool for science and engineering.  
[Click here](http://jira.zby.cz/content/UUC/) for live application.

You can find a lot of unit converters on the internet, so what makes this one stand out?
Well, most online converters are limited only to conversion within predefined categories within a dimension.
But what if you need to convert a complex unit, composed as a product of various units with different powers e.g. Btu/°F/lb → kJ/K/kg?
A converter may implement that specific dimension, but in truth, there are endless combinations of physical quantities used in science and engineering,
and no converter can cover all of them.

With no other freeware alternative, I created a converter built upon interpreting physical quantity expressions instead of just predefined conversion categories.
This means an unlimited freedom to combine any units, break them down to basic SI, and convert them to any desired unit of the same dimension.
In fact, it can even perform simple calculations with automatic conversion and dimensional analysis!

_Contains:_ an abundance of units, including up-to-date world currencies as well as everlasting physical constants, an easy-to-use web interface, an interactive tutorial with examples and full coverage in English & Czech language ✨

## Packages

UUC is a monorepo of three packages:
- [Core library](packages/core/README.md) – the core functionality, published at npm as a standalone library
- [Frontend](packages/frontend/README.md) – the AngularJS web application providing the user interface
- [Currencies](packages/currencies/README.md) – the currency exchange caching, which is used by the frontend

### Common setup
 
```bash
nvm install
npm i
```

## Philosophy

Here I'd like to explain in essence the idea behind UUC – what happens under the hood when you enter a string with input?

First we need to parse the raw string, which is then represented as a sequence of numbers, units with prefixes and arithmetic operators.
Parentheses are handled via recursion, forming a deeper array – the result of parsing is a detailed nested structure.

The second step is to interpret all the numbers and units identified in the database as a `Q` instance:
an object that represents a physical quantity, comprising a number `n` and vector of dimensions `v`,
which can be understood as vector of powers of 8 basic units (7 basic SI + dollar) that form a quantity with the same dimension.  
For example, `J = m^2 · kg · s^-2`, therefore `v = [2,1,-2,0,0,0,0,0]`.  
This is the best thing about UUC: instead of multiple databases for each thinkable dimension, there is a single database of _all units_ as well as universal constants, each defined by their dimension `v` and their SI value `n`.
This key feature enables you to combine any units freely.

Finally, the whole nested structure of `Q` objects and arithmetic operators is aggregated into a single quantity object via `Q` arithmetic –
addition, subtraction, multiplication, division and power are operations defined to work with physical quantities instead of mere numbers.
Standard operator precedence applies, recursion handles parentheses from deepest to shallowest.  
For example `Q1·Q2` is performed by `n1·n2` & `v1+v2`, while `Q^3` by `n^3` & `v·3` etc.

Having processed the input string to gain the final `n` and `v`, the number `n` then represents the numerical value in basic SI units, which are composed by `v`.
If there are no target units set, the job is done – input is converted to SI.
This is also used in the Reference to lookup units with the same dimension.
In order to perform the main function – to convert the input into target units, all we have to do is calling the same procedure for target string, check if the `v` vectors match, and then simply divide the two `n` numbers!

The above described procedure is so generalized and universal, it can handle anything... Except the exceptions.
Non-linear units such as °C, °F are a simple problem with a complicated solution:
in input, the {substitution functions} behave partially like (parentheses), but they are resolved by special functions that bypass parts of the main procedure.
Moreover, this approach loses its original symmetry, as the whole procedure has to be bypassed when {} is used in target units.
 
And that's all – that's the spirit of UUC.
Deeper insight can be gained by studying the [core package](packages/core) codebase.
