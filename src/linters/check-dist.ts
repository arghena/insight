import { installer } from '@/installer'
import { exec } from '@actions/exec'
import { info } from '@actions/core'
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
    await exec('nr', args.length === 0 ? ['build'] : args)

    const exitCode = await exec('git', ['diff', '--quiet', 'dist/'], {
        ignoreReturnCode: true,
    })

    if (exitCode !== 0) throw new Error('[DIFF] Detected uncommitted changes after build')
}
