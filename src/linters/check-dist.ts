import { exec } from '@actions/exec'
import { info } from '@actions/core'
import { installer } from '@/installer'

export async function runner(version: string, args: string[], paths: string[]): Promise<void> {
    const toolName = 'check-dist'

    await installer(toolName, version)

    info(`[RUNNER] Running ${toolName} on ${paths.length.toString()} files`)

    await exec('nci')
    await exec('nr', args.length === 0 ? ['build'] : args)

    const exitCode = await exec('git', ['diff', '--quiet', 'dist/'], {
        ignoreReturnCode: true,
    })

    if (exitCode !== 0) throw new Error('[DIFF] Detected uncommitted changes after build')
}
