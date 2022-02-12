process.env.NODE_ENV = process.env.NODE_ENV || 'development';
const config = require('./config/config.js');
const fs = require('fs');

const commonConfig = {
	'no-unused-vars': ['warn', { varsIgnorePattern: '_', argsIgnorePattern: '_', caughtErrorsIgnorePattern: '_' }],
};

const common = {};
common.js = {
	extends: ['eslint:recommended'],
	rules: {
		'no-empty': 'off',
		'require-yield': 'off',

		'no-unused-vars': commonConfig['no-unused-vars'],
		'no-unreachable': 'warn',
	},
};
common.ts = {
	extends: [...common.js.extends, 'plugin:@typescript-eslint/eslint-recommended', 'plugin:@typescript-eslint/recommended'],
	rules: {
		...common.js.rules,

		// =========================================================================
		// disable some rules as we would have duplicates with common.js.rules
		'no-unused-vars': 'off',
		'@typescript-eslint/explicit-module-boundary-types': 'off',
		// =========================================================================

		'@typescript-eslint/no-empty-function': 'off',
		'@typescript-eslint/no-empty-interface': 'off',
		'@typescript-eslint/no-inferrable-types': 'off',
		'@typescript-eslint/no-namespace': 'off',

		'@typescript-eslint/no-unused-vars': commonConfig['no-unused-vars'],
		'@typescript-eslint/explicit-function-return-type': 'error',
		'@typescript-eslint/no-explicit-any': 'error',
		'@typescript-eslint/no-implicit-any-catch': 'error',
		'@typescript-eslint/no-unsafe-assignment': 'error',
		'@typescript-eslint/no-unsafe-call': 'error',
		'@typescript-eslint/no-unsafe-member-access': 'error',
		'@typescript-eslint/no-unsafe-return': 'error',
	},
};
common.vue = {
	extends: [...common.ts.extends, 'plugin:vue/vue3-recommended'],
	rules: {
		...common.ts.rules,

		// =========================================================================
		// turn off for now as <script setup> won't work well with this
		'@typescript-eslint/no-unused-vars': 'off',
		// =========================================================================

		'vue/attribute-hyphenation': 'off',
		'vue/html-indent': 'off',
		'vue/html-self-closing': 'off',
		'vue/max-attributes-per-line': 'off',
		'vue/singleline-html-element-content-newline': 'off',
		'vue/no-parsing-error': [2, { 'invalid-first-character-of-tag-name': false }],
		'vue/multi-word-component-names': 'off',
	},
};

module.exports = {
	root: true,
	// Ignore every file and folder except src.
	ignorePatterns: [...fs.readdirSync(__dirname).filter((name) => name != 'src')],
	env: {
		node: true,
		es6: true,
	},
	overrides: [
		{
			files: ['*.ts'],
			parser: '@typescript-eslint/parser',
			parserOptions: {
				project: './tsconfig.json',
				tsconfigRootDir: __dirname,
			},
			rules: common.ts.rules,
			extends: common.ts.extends,
		},
		{
			globals: {
				module: true,
				__IS_PRODUCTION__: true,
			},
			files: ['*.vue'],
			parser: 'vue-eslint-parser',
			parserOptions: {
				parser: '@typescript-eslint/parser',
				project: './tsconfig.json',
				tsconfigRootDir: config.ROOT_PATH,
				extraFileExtensions: ['.vue'],
			},
			rules: common.vue.rules,
			extends: common.vue.extends,
		},
	],
};
