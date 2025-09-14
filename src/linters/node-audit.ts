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
        // https://github.com/antfu-collective/ni/blob/82611c44aeada5185d5fb5fc2c72c2ce6b921159/src/detect.ts#L39-L53
        env: { ...process.env, NI_AUTO_INSTALL: 'true' },
    })
}
