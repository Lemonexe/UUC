# UUC Core library

[![NPM](https://img.shields.io/npm/v/uuc-core.svg)](https://www.npmjs.org/package/uuc-core)

The core library contains the logic for parsing, converting and unit definitions.
It was created mainly for the [UUC Frontend app](https://github.com/Lemonexe/UUC/blob/master/packages/frontend/README.md), but is also available as a standalone library at npm.
It is written in TypeScript, and is only distributed as ESM.

This page documents the _usage_ of the library for end users, as distributed via npm.  
If you wish to take part of the library development _(or fork it)_, please see [local dev setup instructions](https://github.com/Lemonexe/UUC/blob/master/packages/core/CONTRIBUTING.md).

## Documentation basics

This guide assumes that you are a user of the UUC App ([live here](https://jira.zby.cz/content/UUC/)), and are familiar with its features.  
If not, please go through the Tutorial there, which will demonstrate typical use cases, i.e. what a typical conversion job looks like.  
For implementation details, refer to [the source code](https://github.com/Lemonexe/UUC/blob/master/packages/core/src), particularly the TypeScript declarations and unit tests.

### Installation

Install via [npm](https://www.npmjs.org/package/uuc-core) or an alternative package manager of your choice:
```bash
npm install uuc-core
```

### Initialization

All functions are pure and stateless, so you may import and use them right away.  
Though if you wish to use currency units, initialize them first with an object of exchange rates to any base currency (see [API used by Frontend](https://github.com/Lemonexe/UUC/blob/master/packages/frontend/src/io/currencies.ts)):
```javascript
import { populateCurrencies } from 'uuc-core'
populateCurrencies({ USD: 1.5, EUR: 1, CZK: 26, BTC: 21e-6 }) // any subset of available currencies may be populated, others will stay undefined
```

### Full conversion

Standard use case: conversion from an input string, optionally a target string, into an output string, result status and possibly messages.  
Status 0 means OK, 1 means warning, 2 means critical error.

```javascript
import { convert } from 'uuc-core'
convert('7 min', '') // → { status: 0, output: { num: 420, dim: 's' }, messages: [] }
convert('km / 5min', 'km/h') // → { status: 0, output: { num: 12, dim: 'km/h' }, messages: [] }
convert('m3', 'm2') // → { status: 1, output: { num: 1, dim: 'm2*m' }, messages: [UUCError: WARNING 202] }
convert('m*', '') // → { status: 2, output: null, messages: [UUCError: ERROR 107] }
```

### Formatting

The `output` from `convert` result can be formatted:

```javascript
import { format } from 'uuc-core'
format({ num: 1234.567, dim: 'm' }, { spec: 'fixed', fixed: 2 }) // → { num: '1234.57', dim: 'm' }
format({ num: 1234.567, dim: 'm' }, { spec: 'digits', digits: 3 }) // → { num: '1230', dim: 'm' }
format({ num: 1234.567, dim: 'm' }, { spec: 'none', exp: true }) // → { num: '1.234567e+3', dim: 'm' }
format({ num: 1234.567, dim: 'm' }, { spec: 'fixed', fixed: 2, exp: true }) // → { num: '1.23e+3', dim: 'm' }
format({ num: 1234.567, dim: 'm' }, { spec: 'digits', digits: 5, exp: true }) // → { num: '1.2346e+3', dim: 'm' }
```

### Languages

Note that languages are built-in to UUC, so that the parser can match a unit by its display name in the selected language.
Currently only English (default) and Czech are supported.  
The current setting is globally persisted in UUC and you may switch there and back any time during runtime:

```javascript
import { setLang } from 'uuc-core'
setLang('cz')
setLang('en')
```

## Details

### Data representation & primitives

An expression with physical quantities can be represented by four kinds of data type:
1. `string`: raw input/target text that is parsed, as well as final output stringified & formatted
2. `NestedRichArray`: a deep nested array with numbers, operators, `ExtUnit` instances and deeper arrays for bracket or curly bracket expressions
3. `NestedQArray`: a deep nested array where all numbers and `ExtUnit`s were converted into `Q` instances, and curly bracket arrays were already resolved to `Q` instances
4. Single `Q` instance: the whole expression is reduced into a one `Q` (enumerated and with final dimension)

- `Unit`: a unit definition from the database, most importantly with `id`, the SI conversion ratio `k`, and the dimension vector `v`
- `Prefix`: an SI unit prefix with `id` and the exponent factor `e`
- `V`: the vector of powers of basic units to form a particular dimension of physical quantity as [m, kg, s, A, K, mol, cd, $]
- `Q`: a physical quantity represented by the numerical value in SI units `n` and its dimension vector `v`
- `ExtUnit`: includes the `Prefix` (or 1 if none), reference to `Unit` definition and power

### Low-level functions

- `convert_parse` parses an input `string` into a `NestedRichArray`
- `reduceQ` recursively crawls through `NestedRichArray` to transform it to `NestedQArray`
- `recursivelyQ` recursively crawls through `NestedQArray` to reduce it into a single `Q` instance
- `parseQ` parses one string to a Q instance, and if it was a single unit, its id (useful for filtering units in reference)
- `add, subtract, multiply, divide, power`: basic arithmetic operations on `Q` instances
- `vector2text` converts unit vector `v` into its `string` representation
and others...

### Errors

Exceptions as well as warnings are represented by the [UUCError](https://github.com/Lemonexe/UUC/blob/master/packages/core/src/errors.ts).
Refer to its source code for all possible error/warning codes.
The main `convert` function catches errors and includes them in status and messages, but lower-level function will throw them.
