import lint from '@commitlint/lint'
import config from '@commitlint/config-conventional'
import format from '@commitlint/format'
import { addExecError } from '@/store'

export async function commitlint(message: string): Promise<void> {
    const { valid: isValid, errors, warnings, input } = await lint(message, config.rules)

    if (!isValid) {
        addExecError({
            toolName: 'commitlint',
            toolType: 'linter',
            stderr: format({ results: [{ warnings, errors, input }] }),
        })
    }
}
