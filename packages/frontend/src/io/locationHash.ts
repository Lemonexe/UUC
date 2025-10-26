import { type FormatParams, type UUCError, err } from 'uuc-core';
import type { FormState, FullConversion } from '../types';
import type { Dispatch } from 'react';

const defaultParams: FormatParams = { spec: 'none' };

export type ParsedLocationHash = FormState & {
	messages: UUCError[];
};

export const parseLocationHash = (hash: string): ParsedLocationHash => {
	const messages: UUCError[] = [];

	hash = decodeURIComponent(hash).replace(/^.*#/, '');

	// extract the params from hash and process it
	let formatParams: FormatParams = defaultParams;
	const paramsMatch = hash.match(/&.+$/);
	if (paramsMatch) {
		hash = hash.slice(0, paramsMatch.index);
		formatParams = processParams(paramsMatch[0].slice(1));
	}

	// continue with parsing the first part of the hash into target & input
	// '>', 'to' or 'into' is used to delimit input and target
	hash = hash.replace(/ to | into /g, '>');
	const sections = hash.split(/>+/);
	sections.length > 2 && messages.push(err('WARN_separators'));

	const input = sections[0].trim();
	const target = sections[1]?.trim() ?? '';

	return { input, target, formatParams, messages };

	//process the substring which contains format params in the format of `${spec},${digits || fixed}` + (exp ? ',exp' : '')
	function processParams(paramsStr: string): FormatParams {
		const warn = () => messages.push(err('WARN_format_params'));
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const params: any = { spec: 'none' };
		const pSections = paramsStr.split(',');
		if (pSections.length > 3) {
			warn();
			return defaultParams;
		}

		if (pSections[0] === 'fixed' || pSections[0] === 'digits') {
			params.spec = pSections[0];
		} else {
			warn();
			return defaultParams;
		}

		// get digits || fixed as integer
		const num = Number(pSections[1]);
		if (Number.isInteger(num)) {
			params[params.spec] = num;
		} else {
			warn();
			return defaultParams;
		}

		// get exp if defined
		params.exp = false;
		if (pSections[2] === 'exp') {
			params.exp = true;
		} else if (pSections.length === 3) {
			warn();
			return defaultParams;
		}

		return params;
	}
};

type ExecHashProps = {
	setInput: Dispatch<string>;
	setTarget: Dispatch<string>;
	setFormatParams: Dispatch<FormatParams>;
	fullConversion: FullConversion;
};

export const execHash = ({ setInput, setTarget, setFormatParams, fullConversion }: ExecHashProps) => {
	const hash = window.location.hash;
	const { input, target, formatParams, messages } = parseLocationHash(hash);
	if (!input && !target) return;
	setInput(input);
	setTarget(target);
	setFormatParams(formatParams);
	// Perform full conversion and merge any messages from parsing the hash
	fullConversion(input, target, (res) => ({ ...res, messages: [...messages, ...res.messages] }));
};
