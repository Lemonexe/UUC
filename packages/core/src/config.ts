// Persistent global config

import type { Config, Lang } from './types.js';

export let cfg: Config = {
	lang: 'en',
};

export const setUUCLang = (lang: Lang) => {
	cfg.lang = lang;
};
