import { installer } from '@/installer'
import { exec } from '@actions/exec'
import { info } from '@actions/core'
import { cwd } from 'process'
import { type LinterKey } from '@/map'

// NOTE: This linter's tag on Docker Hub doesn't have the `v` prefix.
// https://github.com/rhysd/actionlint/blob/main/docs/usage.md#docker-image
export async function runner(
    paths: string[],
    toolName: LinterKey,
    version: string,
    args: string[],
): Promise<void> {
    const dockerArgs = [
        'run',
        '--rm',
        '-v',
        `${cwd()}:/mnt`,
        '-w',
        '/mnt',
        `rhysd/${toolName}:${version}`,
    ]

    await installer(toolName, version)

    info(`[RUNNER] Running ${toolName} on ${paths.length.toString()} files`)

    await exec('docker', [...dockerArgs, ...args, '--', ...paths])
}
