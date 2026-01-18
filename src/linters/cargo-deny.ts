import { installer } from '../installer'
import { exec } from '@actions/exec'
import { info } from '@actions/core'
import { type LinterKey } from '../map'

export async function runner(
    paths: string[],
    toolName: LinterKey,
    version: string,
    args: string[],
): Promise<void> {
    const count = paths.length

    await installer(toolName, version)

    info(
        count === 0
            ? `[RUNNER] Running ${toolName} cron job`
            : `[RUNNER] Running ${toolName} on ${count.toString()} files`,
    )

    await exec(toolName, ['check', ...args])
}
