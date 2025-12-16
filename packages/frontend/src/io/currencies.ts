import { populateCurrencies } from 'uuc-core';
import { KEY_CACHE } from '../state';
import type { Dispatch } from 'react';

type Rates = Record<string, number>;
// as per https://frankfurter.dev
type CurrenciesResponse = {
	amount: number;
	base: string;
	date: string;
	rates: Rates;
};
// as per https://docs.cdp.coinbase.com/coinbase-business/track-apis/prices#get-spot-price
type BTCResponse = {
	data: { amount: string; currency: string };
};

const saveToCache = (data: CurrenciesResponse) => localStorage.setItem(KEY_CACHE, JSON.stringify(data));

export const loadFromCache = (): CurrenciesResponse | null => {
	try {
		const data = localStorage.getItem(KEY_CACHE);
		if (data) return JSON.parse(data) as CurrenciesResponse;
	} catch (e) {
		// Malformed data?
		console.error('Failed to parse cached currencies, purging...', e);
		localStorage.removeItem(KEY_CACHE);
	}
	return null;
};

type LoadCurrenciesParams = {
	setCurrencyTimestamp: Dispatch<string>;
};

let didStart = false;

const fetchFiat = async (): Promise<CurrenciesResponse | null> => {
	const res = await fetch('https://api.frankfurter.app/latest?base=USD');
	if (res.status !== 200) {
		console.warn(`Failed to fetch fiat exchange rates from frankfurter: http ${res.status}`);
		return null;
	}
	return (await res.json()) as CurrenciesResponse;
};
const fetchBTC = async (): Promise<BTCResponse | null> => {
	const res = await fetch('https://api.coinbase.com/v2/prices/BTC-USD/spot');
	if (res.status !== 200) {
		console.warn(`Failed to fetch BTC exchange rate from coinbase: http ${res.status}`);
		return null;
	}
	return (await res.json()) as BTCResponse;
};

const composeWithCache = async (): Promise<CurrenciesResponse | null> => {
	const cached = loadFromCache();
	const addendum = cached ? ', but cache available :)' : '';

	try {
		const defaultRes: CurrenciesResponse = {
			amount: 1.0, // we are always asking for exchange rates for 1 dollar unit...
			date: cached?.date ?? new Date().toISOString(),
			base: 'USD',
			rates: {},
		};
		const [fiatRes, btcRes] = await Promise.all([fetchFiat(), fetchBTC()]);
		const rates: Rates = { ...cached?.rates, ...fiatRes?.rates };
		const BTCRate = parseFloat(btcRes?.data?.amount as string); // returns NaN when nullish, that's okay
		if (!isNaN(BTCRate)) rates.BTC = 1 / BTCRate;
		return { ...defaultRes, ...fiatRes, rates };
	} catch (err) {
		console.warn(`Failed to parse currencies${addendum}`, err);
		return cached;
	}
};

export const loadCurrencies = async ({ setCurrencyTimestamp }: LoadCurrenciesParams) => {
	if (didStart) return;
	didStart = true;
	const data = await composeWithCache();
	if (data === null) return;
	const timestamp = new Date(data.date).toLocaleDateString();
	populateCurrencies(data.rates);
	setCurrencyTimestamp(timestamp);
	saveToCache(data);
};
