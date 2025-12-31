import eslint from '@eslint/js'
import { defineConfig } from 'eslint/config'
import tseslint from 'typescript-eslint'

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
                    // NOTE:
                    // The prefix is trimmed before format is validated, thus PascalCase must be used to allow variables such as `isEnabled`.
                    // https://typescript-eslint.io/rules/naming-convention/#enforce-that-boolean-variables-are-prefixed-with-an-allowed-verb
                    format: ['PascalCase'],
                    prefix: ['has'],
                },
                {
                    selector: [
                        'objectLiteralProperty',
                        'typeProperty',
                        'objectLiteralMethod',
                    ],
                    format: null,
                    modifiers: ['requiresQuotes'],
                },
            ],
        },
    },
)
