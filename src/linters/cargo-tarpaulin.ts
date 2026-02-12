import { installer } from '@/installer'
import { exec } from '@actions/exec'
import { info } from '@actions/core'
import { type LinterKey } from '@/map'

// TODO: Waiting for nextest integration.
// https://github.com/xd009642/tarpaulin/issues/992
export async function runner(
    paths: string[],
    toolName: LinterKey,
    version: string,
    args: string[],
): Promise<void> {
    await installer(toolName, version)

    info(`[RUNNER] Running ${toolName} on ${paths.length.toString()} files`)

    await exec(toolName, ['--skip-clean', ...args], {
        env: {
            ...process.env,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            CARGO_INCREMENTAL: '0',
        },
    })
}
