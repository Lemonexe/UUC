// Persistent global config

import type { Lang } from './types.js';

export type Config = {
	lang: Lang; // language code setting for messages and unit names
	dimTolerance: number; // tolerance of dimension mismatch
};

// Default config values
export const cfg: Config = {
	lang: 'en',
	dimTolerance: 1e-3,
};

export const setUUCLang = (lang: Lang) => {
	cfg.lang = lang;
};
