import { installer } from '@/installer'
import { exec } from '@/exec'
import { ensureNci } from '@/utils'
import type { Runner } from '@/types'

const toolName = 'tsc'

export const runner: Runner = async (version, args) => {
    await installer(toolName, version)

    await ensureNci()

    // NOTE: Passing explicit file paths can lead to unexpected behavior.
    // https://github.com/microsoft/TypeScript/issues/27379
    await exec(toolName, ['--incremental', 'false', '--noEmit', ...args], {
        // Type-check errors are printed to standard output.
        stderr: true,
    })
}
