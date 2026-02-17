import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import { defineConfig } from 'eslint/config'

// TODO: Waiting for native TypeScript support.
// https://eslint.org/docs/latest/use/configure/configuration-files#typescript-configuration-files
export default defineConfig(
    eslint.configs.recommended,
    tseslint.configs.strictTypeChecked,
    tseslint.configs.stylisticTypeChecked,
    {
        languageOptions: {
            parserOptions: {
                projectService: {
                    allowDefaultProject: ['eslint.config.mts'],
                },
            },
        },
    },
    {
        files: ['**/*.ts'],
        rules: {
            eqeqeq: 'error',
            'prefer-template': 'error',
            'prefer-spread': 'error',
            'no-eval': 'error',
            'no-console': 'error',
            'object-shorthand': 'error',
            'no-useless-concat': 'error',
            'no-return-assign': ['error', 'always'],
            'one-var': ['error', 'never'],
            'no-sequences': ['error', { allowInParentheses: false }],
            // TODO: Migrate to `eslint-plugin-import-x`.
            // https://github.com/un-ts/eslint-plugin-import-x/issues/421
            // https://github.com/un-ts/eslint-plugin-import-x/issues/200
            'no-duplicate-imports': ['error', { includeExports: true }],
            '@typescript-eslint/require-array-sort-compare': 'error',
            '@typescript-eslint/explicit-function-return-type': 'error',
            '@typescript-eslint/prefer-destructuring': 'error',
            '@typescript-eslint/no-shadow': 'error',
            '@typescript-eslint/return-await': ['error', 'always'],
            '@typescript-eslint/promise-function-async': 'error',
            '@typescript-eslint/strict-void-return': 'error',
            '@typescript-eslint/no-useless-empty-export': 'error',
            '@typescript-eslint/default-param-last': 'error',
            '@typescript-eslint/strict-boolean-expressions': [
                'error',
                {
                    allowString: false,
                    allowNumber: false,
                },
            ],
            '@typescript-eslint/consistent-type-assertions': [
                'error',
                {
                    arrayLiteralTypeAssertions: 'never',
                    objectLiteralTypeAssertions: 'never',
                },
            ],
            '@typescript-eslint/naming-convention': [
                'error',
                {
                    selector: 'default',
                    format: ['strictCamelCase'],
                },
                {
                    selector: ['interface', 'typeAlias', 'enum', 'enumMember'],
                    format: ['StrictPascalCase'],
                },
                {
                    selector: 'variable',
                    types: ['boolean'],
                    // NOTE: The prefix is trimmed before format is validated,
                    // thus PascalCase must be used to allow variables such as `isEnabled`.
                    // https://typescript-eslint.io/rules/naming-convention/#enforce-that-boolean-variables-are-prefixed-with-an-allowed-verb
                    format: ['StrictPascalCase'],
                    prefix: ['is', 'has', 'can'],
                },
                {
                    selector: ['objectLiteralProperty'],
                    format: null,
                    modifiers: ['requiresQuotes'],
                },
            ],
        },
    },
)
