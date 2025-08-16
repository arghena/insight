import { installer } from '../installer'
import { exec } from '@actions/exec'
import { info } from '@actions/core'
import { type LinterKey } from '../map'

export async function runner(
    paths: string[],
    name: LinterKey,
    version: string,
    options: string[],
): Promise<void> {
    let diff_result = ''

    await installer(name, version)

    info(`[runner] ${paths.length} files matched – running ${name}`)

    await exec('nci')
    await exec('nr', options.length === 0 ? ['build'] : options)
    await exec('git', ['diff', 'dist/'], {
        listeners: {
            stdout: (data: Buffer) => (diff_result += data.toString()),
        },
    })

    // prettier-ignore
    if (diff_result.trim().length !== 0) throw new Error('[runner] Detected uncommitted changes after build.')
}
