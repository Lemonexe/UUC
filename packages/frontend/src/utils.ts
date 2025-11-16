import { useState } from 'react';
import { ps } from './state';
import type { FormState } from './types';

// whole address without GET or hash, trailing slashes removed (that's needed to append hash params to form shareLinks)
export const getCurrentWebAddress = () => window.location.origin + window.location.pathname.replace(/\/+$/, '');

const HISTORY_MAX_LENGTH = 10;

// Add current form state to history
export const add2history = ({ input, target, formatParams }: FormState) => {
	formatParams = { ...formatParams };
	// empty target is allowed, but not empty input
	if (input === '') return;
	// if input & target are unchanged, the entry is just updated with (possibly) changed params
	if (ps.history.length > 0 && input === ps.history[0].input && target === ps.history[0].target) {
		ps.history[0].formatParams = formatParams;
		return;
	}
	// or add a new entry, deduplicate, limit max length
	ps.history.unshift({ input, target, formatParams });
	ps.history = ps.history
		.filter((o, i) => i === 0 || o.input !== input || o.target !== target)
		.slice(0, HISTORY_MAX_LENGTH);
};

// Generate a shareable link representing the current form state
export const getShareLink = ({ input, target, formatParams }: FormState): string => {
	const i = input.trim();
	const t = target.trim();
	let phrase = i + (t === '' ? '' : `>${t}`);

	if (formatParams.spec !== 'none') {
		// @ts-expect-error yes, the spec always aligns with the property name
		phrase += `&${formatParams.spec},${formatParams[formatParams.spec]}` + (formatParams.exp ? ',exp' : '');
	}

	return getCurrentWebAddress() + '#' + encodeURI(phrase);
};

export const useCopyUIEffects = () => {
	const [wasCopiedNow, setWasCopiedNow] = useState(false);

	const [copyAppearClass, setCopyAppearClass] = useState<'copyEffect' | ''>('');
	const copyClass = `copyEffStatic ${copyAppearClass}`;

	const doCopyUIEffect = () => {
		setCopyAppearClass('copyEffect');
		setWasCopiedNow(true);
		setTimeout(() => {
			setCopyAppearClass('');
			setWasCopiedNow(false);
		}, 1000);
	};

	return { wasCopiedNow, copyClass, doCopyUIEffect };
};
