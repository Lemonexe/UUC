// Persistent global config

export const langs = ['en', 'cz'] as const;
type Lang = (typeof langs)[number]; // local-only duplicate of types.ts to avoid circular dependency

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
