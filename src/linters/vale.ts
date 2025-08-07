import { installer } from '../installer'
import { exec } from '@actions/exec'
import { info } from '@actions/core'
import { cwd } from 'process'
import { type LinterKey } from '../map'

export async function runner(
    paths: string[],
    name: LinterKey,
    version: string,
    options: string[],
): Promise<void> {
    const tag = version === 'latest' ? 'latest' : `v${version}`
    const docker_options = [
        'run',
        '--rm',
        '-v',
        `${cwd()}:/mnt`,
        '-w',
        '/mnt',
        `jdkato/${name}:${tag}`,
    ]

    await installer(name, tag)

    info(`[runner] Checking ${paths.length} files with ${name}`)

    await exec('docker', [...docker_options, 'sync'])
    await exec('docker', [...docker_options, ...options, '--', ...paths])
}
