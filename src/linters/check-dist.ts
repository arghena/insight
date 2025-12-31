import { installer } from '../installer'
import { exec } from '@actions/exec'
import { info } from '@actions/core'
import { type LinterKey } from '../map'

export async function runner(
    paths: string[],
    name: LinterKey,
    version: string,
    args: string[],
): Promise<void> {
    let diffResult = ''

    await installer(name, version)

    info(`[RUNNER] Running ${name} on ${paths.length.toString()} files`)

    await exec('nci')
    await exec('nr', args.length === 0 ? ['build'] : args)
    await exec('git', ['diff', 'dist/'], {
        listeners: {
            stdout: (data: Buffer) => (diffResult += data.toString()),
        },
    })

    // prettier-ignore
    if (diffResult.trim().length !== 0) throw new Error('[RUNNER] Detected uncommitted changes after build')
}
