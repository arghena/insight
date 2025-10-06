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
    const count = paths.length

    await installer(name, version)

    info(
        count === 0
            ? `[runner] Running ${name} cron job`
            : `[runner] ${count} files matched – running ${name}`,
    )

    await exec(name.replace('_', '-'), ['check', ...args])
}
