import { populateCurrencies } from 'uuc-core';
import { KEY_CACHE } from '../state';
import type { Dispatch } from 'react';

// as per https://frankfurter.dev/v2
type FiatItem = {
	quote: string; // currency identifier
	rate: number;
	base: 'USD'; // specified by request parameter
	date: string; // unused, we use our own timestamp
};
type FiatResponse = FiatItem[];

// as per https://docs.cdp.coinbase.com/coinbase-business/track-apis/prices#get-spot-price
type BTCResponse = {
	data: { amount: string; base: 'BTC'; currency: 'USD' };
};

// the data representations that we work with
type Rates = Record<string, number>; // [currency identifier]: how much of this currency is 1 USD (reciprocal unit.k)
type PersistedData = {
	date: string; // ISO string Date
	rates: Rates;
};

const currenciesResponseToRates = (response: FiatResponse): Rates =>
	response.reduce<Rates>((acc, item) => {
		acc[item.quote] = item.rate;
		return acc;
	}, {});

const saveToCache = (data: PersistedData) => localStorage.setItem(KEY_CACHE, JSON.stringify(data));

const loadFromCache = (): PersistedData | null => {
	try {
		const data = localStorage.getItem(KEY_CACHE);
		if (data) return JSON.parse(data) as PersistedData;
	} catch (e) {
		// Malformed data?
		console.error('Failed to parse cached currencies, purging...', e);
		localStorage.removeItem(KEY_CACHE);
	}
	return null;
};

let didStart = false;

const fetchFiat = async (): Promise<FiatResponse | null> => {
	const res = await fetch('https://api.frankfurter.dev/v2/rates?base=USD');
	if (res.status !== 200) {
		console.warn(`Failed to fetch fiat exchange rates from frankfurter: http ${res.status}`);
		return null;
	}
	return (await res.json()) as FiatResponse;
};

const fetchBTC = async (): Promise<BTCResponse | null> => {
	const res = await fetch('https://api.coinbase.com/v2/prices/BTC-USD/spot');
	if (res.status !== 200) {
		console.warn(`Failed to fetch BTC exchange rate from coinbase: http ${res.status}`);
		return null;
	}
	return (await res.json()) as BTCResponse;
};

const fetchAllWithCache = async (): Promise<PersistedData | null> => {
	const cached = loadFromCache();
	const addendum = cached ? ', but cache available :)' : '';
	const today = new Date().toISOString().split('T')[0];
	const cachedDate = cached?.date;
	if (today === cachedDate) {
		console.info('Not fetching currencies, cache is up-to-date.');
		return cached;
	}

	try {
		const [fiatRes, btcRes] = await Promise.all([fetchFiat(), fetchBTC()]);
		const newRates: Rates = Array.isArray(fiatRes) ? currenciesResponseToRates(fiatRes) : {};
		const rates: Rates = { ...cached?.rates, ...newRates };

		const BTCRate = parseFloat(btcRes?.data?.amount as string); // returns NaN when nullish, that's okay
		if (!isNaN(BTCRate)) rates['BTC'] = 1 / BTCRate;

		console.info('Successfully fetched currencies (will be cached).');
		return { date: today, rates };
	} catch (err) {
		console.warn(`Failed to parse currencies${addendum}`, err);
		return cached;
	}
};

type LoadCurrenciesParams = {
	setCurrencyTimestamp: Dispatch<string>;
};

export const loadCurrencies = async ({ setCurrencyTimestamp }: LoadCurrenciesParams) => {
	if (didStart) return;
	didStart = true;

	const data = await fetchAllWithCache();
	if (data === null) return;
	const timestamp = new Date(data.date).toLocaleDateString();
	populateCurrencies(data.rates);
	setCurrencyTimestamp(timestamp);
	saveToCache(data);
};
