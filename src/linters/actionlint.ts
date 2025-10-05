import { installer } from '../installer'
import { exec } from '@actions/exec'
import { info } from '@actions/core'
import { cwd } from 'process'
import { type LinterKey } from '../map'

// NOTE:
// This linter's tag on Docker Hub doesn't have the `v` prefix.
// https://github.com/rhysd/actionlint/blob/main/docs/usage.md#docker-image
export async function runner(
    paths: string[],
    name: LinterKey,
    version: string,
    args: string[],
): Promise<void> {
    const docker_args = [
        'run',
        '--rm',
        '-v',
        `${cwd()}:/mnt`,
        '-w',
        '/mnt',
        `rhysd/${name}:${version}`,
    ]

    await installer(name, version)

    info(`[runner] Checking ${paths.length} files with ${name}`)

    await exec('docker', [...docker_args, ...args, '--', ...paths])
}
