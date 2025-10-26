# UUC Frontend

[Click here](http://jira.zby.cz/content/UUC/) for live application.

**TODO TEMPORARY**, will be rewritten to React https://github.com/Lemonexe/UUC/issues/6

The front-end is written in ECMA6 Javascript and uses [AngularJS 1.7](https://angularjs.org/) framework.
Almost whole HTML GUI is in **index.php**, except for the tutorial window, which is in *res/tutorial.html*.
JavaScript files linked with global variables and side effects.
All static CSS is stored in **app/style.css**, plus there are several ng-style declarations in *app/controller.js*.

## Setup

All commands are to be run in repository root.

```bash
nvm install # or manually install nodeJS version as per the file .nvmrc
npm i
```

## Build

Bundle the Frontend app using vite, including the Currencies PHP files, into `packages/frontend/dist` folder:
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

### Production

**TODO** script to include currencies into `dist` folder for convenience.

Deploy `dist` folder on a PHP server.

⚠️ Make sure to block the `API_key` file from public access, for example via `.htaccess` if using Apache.


## Files TODO delet this

**src/angular.min.js**, the sole dependency of this project. Application was developed with AngularJS v1.7.6.

**src/lang.js** defines `langService`, which contains functionality related to translation, as well as the actual translation table for string messages.
In HTML the translation is done on spot via Angular directives.

**src/misc.js** initializes the program and contains some generic-purpose global functions for saving/loading the application state, as well as maintenance functions.

**src/controller.js** defines the Angular module and controller, as well as all directives at the end.
All functionality related to View and Controller is defined here in the Angular controller function either as a part of `$scope`, or as local variables and functions.
