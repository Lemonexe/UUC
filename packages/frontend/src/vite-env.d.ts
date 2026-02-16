/// <reference types="vite/client" />

import type { PersistedState } from './types';

declare module '*.png';

declare global {
	interface Window {
		ps: PersistedState;
		purge: () => void;
	}
	const __APP_VERSION__: string;
}

export {};
