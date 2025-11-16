import { populateCurrencies } from 'uuc-core';
import { KEY_CACHE } from '../state';
import type { Dispatch } from 'react';

type CurrenciesResponse = {
	success: boolean;
	timestamp: number;
	base: string;
	date: string;
	rates: Record<string, number>;
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

const fetchWithCache = async (): Promise<CurrenciesResponse | null> => {
	const cached = loadFromCache();
	const res = await fetch('./api/currencies.php');

	const addendum = cached ? ', but cache available :)' : '';
	if (res.status !== 200) {
		console.warn(`Failed to fetch currencies: http ${res.status}${addendum}`);
		return cached;
	}

	try {
		return (await res.json()) as CurrenciesResponse;
	} catch (err) {
		console.warn(`Failed to parse currencies${addendum}`, err);
		return cached;
	}
};

export const loadCurrencies = async ({ setCurrencyTimestamp }: LoadCurrenciesParams) => {
	if (didStart) return;
	didStart = true;
	const data = await fetchWithCache();
	if (data === null) return;
	const timestamp = new Date(data.timestamp * 1000).toLocaleString();
	populateCurrencies(data.rates);
	setCurrencyTimestamp(timestamp);
	saveToCache(data);
};
