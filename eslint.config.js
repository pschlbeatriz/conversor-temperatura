import js from '@eslint/js';
import globals from 'globals';

export default [
  { ignores: ['node_modules', 'coverage'] },
  js.configs.recommended,
  { files: ['web/**/*.js'], languageOptions: { globals: globals.browser } },
  { files: ['test/**/*.js', 'scripts/**/*.js', 'eslint.config.js'], languageOptions: { globals: globals.node } },
];
