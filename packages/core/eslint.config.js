import baseConfig from '../../eslint.config.js';

export default [
	...baseConfig,
	{
		rules: {
			// I love this pattern dearly <3
			'@typescript-eslint/no-unused-expressions': 'off',
		},
	},
];
