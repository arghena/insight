import { exec } from '@actions/exec'
import { info } from '@actions/core'
import { installer } from '@/installer'
import { type LinterKey } from '@/map'

export async function runner(
    paths: string[],
    toolName: LinterKey,
    version: string,
    args: string[],
): Promise<void> {
    await installer(toolName, version)

    info(`[RUNNER] Running ${toolName} on ${paths.length.toString()} files`)

    await exec('nci')
    // NOTE: Passing explicit file paths can lead to unexpected behavior.
    // https://github.com/microsoft/TypeScript/issues/27379
    await exec(toolName, ['--incremental', 'false', '--noEmit', ...args])
}
