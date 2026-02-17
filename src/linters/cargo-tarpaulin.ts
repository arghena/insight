import { env } from 'node:process'
import { exec } from '@actions/exec'
import { info } from '@actions/core'
import { installer } from '@/installer'

// TODO: Waiting for nextest integration.
// https://github.com/xd009642/tarpaulin/issues/992
export async function runner(version: string, args: string[], paths: string[]): Promise<void> {
    const toolName = 'cargo-tarpaulin'

    await installer(toolName, version)

    info(`[RUNNER] Running ${toolName} on ${paths.length.toString()} files`)

    await exec(toolName, ['--skip-clean', ...args], {
        env: {
            ...env,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            CARGO_INCREMENTAL: '0',
        },
    })
}
