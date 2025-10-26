import type { FormatParams, Lang, Result } from 'uuc-core';

export type Route = 'reference' | 'converter' | 'intro' | 'search';

export type FormState = {
	input: string;
	target: string;
	formatParams: FormatParams;
};

export type PersistedState = FormState & {
	lang: Lang;
	history: FormState[];
	hideTutorialLink: boolean;
};

// Result with id of unique full conversion request (will not be modified when formatting the result)
export type ResultWithId = Result & { id: string };

export type FullConversion = (input: string, target: string, callback?: (res: ResultWithId) => ResultWithId) => void;
