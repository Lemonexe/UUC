import pluginJS from '@eslint/js';
import pluginTS from 'typescript-eslint';
import pluginImport from 'eslint-plugin-import';

export default [
    pluginJS.configs.recommended,
    ...pluginTS.configs.recommended,
    {
        ignores: ['**/dist/*', '**/node_modules/*'],
        files: ['**/*.{ts,tsx}'],
        plugins: {
            import: pluginImport,
        },
        rules: {
            '@typescript-eslint/no-use-before-define': 'error',
            '@typescript-eslint/no-shadow': 'error',
            'import/prefer-default-export': 'off',
            curly: ['error', 'multi-line'],

            'sort-imports': [1, { ignoreDeclarationSort: true }],
            'import/order': [
                'warn',
                {
                    groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'type'],
                    'newlines-between': 'always',
                    alphabetize: { order: 'asc' },
                },
            ],
        }
    },
];
