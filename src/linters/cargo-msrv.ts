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
    await installer(name, version)

    info(`[runner] ${paths.length} files matched – running ${name}`)

    await exec(name.replace('_', '-'), ['verify', ...args])
}
