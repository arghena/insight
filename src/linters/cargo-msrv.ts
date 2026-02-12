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

    await exec(toolName, ['verify', ...args], {
        env: {
            ...process.env,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            CARGO_INCREMENTAL: '0',
        },
    })
}
