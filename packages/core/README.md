# UUC Core library

The core library contains the logic for parsing, converting and unit definitions.
It was created mainly for the UUC Frontend app, but is also available as a standalone library at npm.
is written in TypeScript and can be transpiled to Javascript.
Only distributed as ESM.

## Usage
TODO

Note that languages are built-in to UUC.
Currently only English (default) and Czech are supported.
You may switch there and back any time during runtime:

```javascript
import { setLang } from 'uuc-core';
setLang('cz')
```
Q: Why are language localizations part of the core library, shouldn't we do translate strings outside via a translation library of choice?  
A: The parser has a feature that it can match a unit by its display name. So the unit database bears all translated strings and the core has to keep the state of language selection.

## Setup

See [Common setup](../../README.md#common-setup).

## Build

The library can be imported directly as `.ts`, or you may build it to `.js` and `.d.ts` files with:
```bash
tsc
```

## Development

Standard commands:
```bash
npm -w=uuc-core run test
npm -w=uuc-core run lint
npm -w=uuc-core run prettier
```

You can use `npm -w=uuc-core run get-conflicts` to detect possible `id` conflicts with prefixes.

## Files

**src/convert.js** defines the `Convert()` function, constructor for an object that acts as the application Model and contains all the main code related to `Q` arithmetic, unit conversion itself and subsequent calculations.

**src/convert_parse.js** defines the `Convert_parse()` function, which parses an input string into a detailed nested structure, which represents a mathematical expression with unit objects and numbers.

**src/data.js** contains all program data, which is divided into these objects:  
`csts` contains application constants  
`Units` is the unit database itself  
`Prefixes` defines standard SI prefixes  
`Currency` contains empty objects for currency units (to be filled with current values and merged with `Units`)  
`Unitfuns` defines the special {substitution functions}

**src/tests.js** defines the `tests()` function, which contains a DIY test infrastructure, and of course the unit tests themselves.
Only the application model is considered complicated enough to deserve the luxury of test coverage.
