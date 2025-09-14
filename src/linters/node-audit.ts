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

    await exec('na', ['audit', ...options], {
        env: { NI_AUTO_INSTALL: 'true' },
    })
}
