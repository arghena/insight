import lint from '@commitlint/lint'
import config from '@commitlint/config-conventional'
import format from '@commitlint/format'
import { addExecError } from '@/store'

export async function commitlint(message: string): Promise<void> {
    const {
        valid: isValid,
        errors,
        warnings,
        input,
    } = await lint(message, config.rules, {
        // https://github.com/conventional-changelog/conventional-changelog/blob/master/packages/conventional-changelog-conventionalcommits/src/parser.js
        // Copyright © [conventional-changelog team](https://github.com/conventional-changelog)
        // Distributed under the [ISC License](https://github.com/conventional-changelog/conventional-changelog/blob/master/packages/conventional-changelog-conventionalcommits/LICENSE.md)
        parserOpts: {
            headerPattern: /^(\w*)(?:\((.*)\))?!?: (.*)$/,
            breakingHeaderPattern: /^(\w*)(?:\((.*)\))?!: (.*)$/,
            headerCorrespondence: ['type', 'scope', 'subject'],
        },
    })

    if (!isValid) {
        addExecError({
            toolName: 'commitlint',
            toolType: 'linter',
            stderr: format({ results: [{ warnings, errors, input }] }),
        })
    }
}
