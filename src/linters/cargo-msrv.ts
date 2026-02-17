import { env } from 'node:process'
import { exec } from '@actions/exec'
import { info } from '@actions/core'
import { installer } from '@/installer'

export async function runner(version: string, args: string[], paths: string[]): Promise<void> {
    const toolName = 'cargo-msrv'

    await installer(toolName, version)

    info(`[RUNNER] Running ${toolName} on ${paths.length.toString()} files`)

    await exec(toolName, ['verify', ...args], {
        env: {
            ...env,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            CARGO_INCREMENTAL: '0',
        },
    })
}
