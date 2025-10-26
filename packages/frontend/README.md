# UUC Frontend

The Frontend application provides a simple, but highly practical user experience around the [UUC Core](../core/README.md) functionality.  
Its interface offers Czech and English language.  
While the conversion form is the centerpiece, the app also features the unit reference page and an interactive tutorial.  
Currencies backend API is consumed to populate currency units with their exchange rates, but that's completely optional.  
Some data is persisted in local storage, namely the form state and the conversion history.  
On initial load the app tries to parse a conversion command from hash, which can be used to share a conversion via link, or to bind UUC as a custom search engine.

[Click here](http://jira.zby.cz/content/UUC/) for live application.

## Setup

All commands are to be run in repository root.

```bash
nvm install # or manually install nodeJS version as per the file .nvmrc
npm i
```

## Build

The Frontend app is bundled by vite into `packages/frontend/dist` folder.
The Currencies PHP backend is included in the `packages/frontend/dist/api` folder.
```bash
npm run build:frontend
```

## Run

### Development

Run the _optional_ Currencies backend and the Frontend vite dev server in separate sessions:
```bash
npm run currencies
npm run frontend
```
Note that the vite dev server has a reverse proxy for the Currencies backend.

### Production

Upload the `dist` folder on a PHP server.

⚠️ Make sure to block the `dist/api/API_key` file from public access, for example via `.htaccess` if using Apache.
