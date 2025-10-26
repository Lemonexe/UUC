import { populateCurrencies } from 'uuc-core';
import type { Dispatch } from 'react';

type CurrenciesResponse = {
	success: boolean;
	timestamp: number;
	base: string;
	date: string;
	rates: Record<string, number>;
};

type LoadCurrenciesParams = {
	setCurrencyTimestamp: Dispatch<string>;
};

let didStart = false;

export const loadCurrencies = async ({ setCurrencyTimestamp }: LoadCurrenciesParams) => {
	if (didStart) return;
	didStart = true;
	try {
		const res = await fetch('./api/currencies.php');
		if (res.status !== 200) {
			console.error(`Failed to load currencies, HTTP ${res.status}`);
			return;
		}
		const json = (await res.json()) as CurrenciesResponse;
		const timestamp = new Date(json.timestamp * 1000).toLocaleDateString();
		populateCurrencies(json.rates);
		setCurrencyTimestamp(timestamp);
	} catch (err) {
		console.error('Failed to load currencies', err);
	}
};
