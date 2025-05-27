import js from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import prettier from 'eslint-config-prettier';
import { default as react, default as reactPlugin } from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';

export default [
	{ ignores: ['dist'] },
	{
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
			'@typescript-eslint': tsPlugin,
			react: reactPlugin,
		},

		rules: {
			...js.configs.recommended.rules,
			...react.configs.recommended.rules,
			...react.configs['jsx-runtime'].rules,
			...reactHooks.configs.recommended.rules,
			'react/jsx-no-target-blank': 'off',
			'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
		},
	},
	prettier,
];
