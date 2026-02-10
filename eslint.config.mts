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
            // TODO: Migrate to `eslint-plugin-import-x`.
            // https://github.com/un-ts/eslint-plugin-import-x/issues/421
            'no-duplicate-imports': ['error', { includeExports: true }],
            '@typescript-eslint/naming-convention': [
                'error',
                {
                    selector: 'default',
                    format: ['camelCase'],
                },
                {
                    selector: ['interface', 'typeAlias'],
                    format: ['PascalCase'],
                },
                {
                    selector: 'variable',
                    types: ['boolean'],
                    // NOTE: The prefix is trimmed before format is validated,
                    // thus PascalCase must be used to allow variables such as `isEnabled`.
                    // https://typescript-eslint.io/rules/naming-convention/#enforce-that-boolean-variables-are-prefixed-with-an-allowed-verb
                    format: ['PascalCase'],
                    prefix: ['has'],
                },
                {
                    selector: ['objectLiteralProperty', 'typeProperty', 'objectLiteralMethod'],
                    format: null,
                    modifiers: ['requiresQuotes'],
                },
            ],
            '@typescript-eslint/consistent-type-imports': [
                'error',
                {
                    fixStyle: 'inline-type-imports',
                },
            ],
        },
    },
)
