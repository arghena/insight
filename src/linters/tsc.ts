import { exec } from '@actions/exec'
import { info } from '@actions/core'
import { installer } from '@/installer'

export async function runner(version: string, args: string[], paths: string[]): Promise<void> {
    const toolName = 'tsc'

    await installer(toolName, version)

    info(`[RUNNER] Running ${toolName} on ${paths.length.toString()} files`)

    await exec('nci')
    // NOTE: Passing explicit file paths can lead to unexpected behavior.
    // https://github.com/microsoft/TypeScript/issues/27379
    await exec(toolName, ['--incremental', 'false', '--noEmit', ...args])
}
