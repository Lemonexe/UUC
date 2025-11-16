import type { PersistedState, Route } from './types';

export const initialRoute: Route = 'converter';

// Global variable for persistent state
export const ps: PersistedState = {
	lang: 'en',
	input: '',
	target: '',
	history: [],
	formatParams: { spec: 'none' },
	hideTutorialLink: false,
};
window.ps = ps; // just read-only for easier debug
export const defaultFixed = 2;
export const defaultDigits = 3;

export const save = () => localStorage.setItem('UUC_userdata', JSON.stringify(ps));

export const loadAndInit = () => {
	window.onbeforeunload = save;

	// estimate default language from browser
	ps.lang = window.navigator.language.slice(0, 2) === 'cs' ? 'cz' : 'en';

	const data = localStorage.getItem('UUC_userdata');
	if (data) {
		ps.hideTutorialLink = true; // if data, it was definitely visited before
		const json: PersistedState = JSON.parse(data);

		json.lang && (ps.lang = json.lang);
		json.input && (ps.input = json.input);
		json.target && (ps.target = json.target);
		json.history && (ps.history = json.history);
		json.formatParams && (ps.formatParams = json.formatParams);
	}

	// persist the initialized data, marking the app as visited
	save();
};

export const purge = () => {
	window.onbeforeunload = null;
	localStorage.removeItem('UUC_userdata');
	location.reload();
};
