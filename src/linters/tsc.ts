import { info } from '@actions/core'
import { installer } from '@/installer'
import { exec } from '@/exec'
import type { Runner } from '@/types'

const toolName = 'tsc'

export const runner: Runner = async (version, args, paths) => {
    await installer(toolName, version)

    info(`[RUNNER] Running ${toolName} on ${paths.length.toString()} files`)

    await exec('nci')
    // NOTE: Passing explicit file paths can lead to unexpected behavior.
    // https://github.com/microsoft/TypeScript/issues/27379
    await exec(toolName, ['--incremental', 'false', '--noEmit', ...args])
}
