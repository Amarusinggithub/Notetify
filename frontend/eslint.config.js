import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import prettier from 'eslint-config-prettier';
import { default as react } from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';

export default tseslint.config(
	{ ignores: ['dist'] },
	{
		extends: [js.configs.recommended, ...tseslint.configs.recommended],

		files: ['**/*.{js,jsx,tsx}'],
		languageOptions: {
			ecmaVersion: 2020,
			globals: globals.browser,
			parser: tsParser,

			parserOptions: {
				ecmaVersion: 'latest',
				ecmaFeatures: { jsx: true },
				sourceType: 'module',
			},
		},
		settings: { react: { version: '18.3' } },

		plugins: {
			'react-hooks': reactHooks,
			'react-refresh': reactRefresh,
		},

		rules: {
			...react.configs.recommended.rules,
			...reactHooks.configs.recommended.rules,
			'react-refresh/only-export-components': [
				'warn',
				{ allowConstantExport: true },
			],
		},
	},
	prettier,
);
