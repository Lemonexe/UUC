# Development of UUC Core library

Pull requests or issues are very welcome :)  
Here's how to set up a local dev environment for the core library.  
All commands are to be run in repository root.

## Setup

```bash
nvm install # or manually install nodeJS version as per the file .nvmrc
npm i
```

## Build

The library can be imported directly as `.ts` source code,
or you may transpile it to `.js` and `.d.ts` files + map files into `packages/core/dist` folder with:
```bash
npm run build:core
```

## Development

Standard dev script commands:
```bash
npm -w=uuc-core run test
npm -w=uuc-core run lint
npm -w=uuc-core run prettier
```

When updating the units database, run this command to detect possible conflicts in parsing units from string.
```bash
npm -w=uuc-core run check-conflicts
```

## Publishing

```bash
npm -w=uuc-core version patch # minor, major...
npm run build:core
npm -w=uuc-core pack # to inspect the package contents
npm -w=uuc-core publish --access public
```
