# UUC Frontend

The Frontend application provides a simple, but highly practical user experience around the [UUC Core](../core/README.md) functionality.  
Its interface offers Czech and English language.  
While the conversion form is the centerpiece, the app also features the unit reference page and an interactive tutorial.  
[Frankfurter free public API](https://frankfurter.dev/) is consumed to populate currency units with their exchange rates,
plus [Coinbase API](https://docs.cdp.coinbase.com/coinbase-business/track-apis/prices#get-spot-price) is used for bitcoin, but that's all completely optional.  
Some data is persisted in local storage, namely the form state and the conversion history.  
On initial load the app tries to parse a conversion command from hash, which can be used to share a conversion via link, or to bind UUC as a custom search engine.

[Click here](https://jira.zby.cz/content/UUC/) for live application.

## Setup

All commands are to be run in repository root.

```bash
nvm install # or manually install nodeJS version as per the file .nvmrc
npm i
npm run build:core # internal dependency of Frontend
```

## Build

The Frontend app is bundled by vite into `packages/frontend/dist` folder.
```bash
npm run build:frontend
```

## Run

### Development

Run the Frontend vite dev server:
```bash
npm run frontend
```

### Production

Upload the `dist` folder to a static site hosting service.
