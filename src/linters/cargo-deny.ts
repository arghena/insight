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
    const count = paths.length

    await installer(name, version)

    if (count === 0) {
        info(`[runner] Running ${name} cron job`)
    } else {
        info(`[runner] ${count} files matched – running ${name}`)
    }

    await exec(name.replace('_', '-'), ['check', ...options])
}
