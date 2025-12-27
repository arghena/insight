import { installer } from '../installer'
import { exec } from '@actions/exec'
import { info } from '@actions/core'
import { cwd } from 'process'
import { type LinterKey } from '../map'

export async function runner(
    paths: string[],
    name: LinterKey,
    version: string,
    args: string[],
): Promise<void> {
    const tag = version === 'latest' ? 'latest' : `v${version}`
    const docker_args = [
        'run',
        '--rm',
        '-v',
        `${cwd()}:/mnt`,
        '-w',
        '/mnt',
        `jdkato/${name}:${tag}`,
    ]

    await installer(name, tag)

    info(`[RUNNER] Running ${name} on ${paths.length} files`)

    await exec('docker', [...docker_args, 'sync'])
    await exec('docker', [...docker_args, ...args, '--', ...paths])
}
