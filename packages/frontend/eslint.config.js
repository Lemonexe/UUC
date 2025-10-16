import baseConfig from '../../eslint.config.js';

import globals from 'globals';
import pluginReact from 'eslint-plugin-react';
import pluginReactHooks from 'eslint-plugin-react-hooks';

export default [
	...baseConfig,
	pluginReact.configs.flat.recommended,
	{
		ignores: ['**/dist/*', '**/node_modules/*'],
		files: ['**/*.{ts,tsx}'],
		plugins: {
			react: pluginReact,
			'react-hooks': pluginReactHooks,
		},
		rules: {
			'react/require-default-props': 'off',
			'react-hooks/rules-of-hooks': 'error',
			'react-hooks/exhaustive-deps': 'off',
			'react/sort-comp': 'off',
			'react/react-in-jsx-scope': 'off',
			'react/no-children-prop': 'off',
		},
		languageOptions: {
			globals: globals.browser,
		},
		settings: { react: { version: 'detect' } },
	},
];
