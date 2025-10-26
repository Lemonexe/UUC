import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { loadAndInit } from './state';

import './style.css';

// ensure ps is loaded or constructed, so that React state can be initialized from its values
loadAndInit();

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<App />
	</StrictMode>
);
