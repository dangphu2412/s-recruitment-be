// eslint.config.js
import typescriptEslint from 'typescript-eslint';
import tsparser from '@typescript-eslint/parser';
import eslintConfigPrettier from "eslint-config-prettier";
import prettierPlugin from 'eslint-plugin-prettier';
import tseslintPlugin from '@typescript-eslint/eslint-plugin';

export default typescriptEslint.config(
  typescriptEslint.configs.recommended,
  eslintConfigPrettier,
  {
    files: ['**/*.ts'],
    ignores: ['.eslintrc.js'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        project: './tsconfig.json'
      },
    },
    plugins: {
      prettier: prettierPlugin,
      '@typescript-eslint': tseslintPlugin,
    },
    rules: {
      ...prettierPlugin.configs.recommended.rules,
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off'
    },
  }
)
