import { installer } from '@/installer'
import { exec } from '@/exec'
import type { Runner } from '@/types'

const toolName = 'tsc'

export const runner: Runner = async ({ version, args }) => {
    await installer(toolName, version)

    // NOTE: Passing explicit file paths can lead to unexpected behavior.
    // https://github.com/microsoft/TypeScript/issues/27379
    return await exec(toolName, ['--incremental', 'false', '--noEmit', ...args], {
        // Type-check errors are printed to standard output.
        stderr: true,
    })
}
