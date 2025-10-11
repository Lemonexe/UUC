# UUC Currencies

A simple PHP script that acts as a caching layer for the [Fixer.io](https://fixer.io/) API,
which is free but with limited requests.

The JSON response is cached in `currencies.json` and is updated daily by the real API call (upon first request of the day).  
Your API key obtained from Fixer.io shall be stored in `API_key` (simple plain text).

## Setup

Get your fixer.io API key and insert it into the file `API_key`:

```bash
cd packages/currencies
echo deadbeefdeadbeefdeadbeefdeadbeef > API_key
```

## Build

N/A (this script is run straight from source code).

## Run

### Development
For local development, use PHP CLI:

```bash
cd packages/currencies
php -S localhost:3001
```

### Production

Deploy on a PHP server as part of the Frontend app, see [Frontend README](../frontend/README.md).

⚠️ Make sure to block the `API_key` file from public access, for example via `.htaccess` if using Apache.
