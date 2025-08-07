import { installer } from '../installer'
import { exec } from '@actions/exec'
import { info } from '@actions/core'
import { cwd } from 'process'
import { type FormatterKey } from '../map'

// NOTE:
// The `v3` tag of this formatter on Docker Hub is the latest stable version.
// https://github.com/mvdan/sh?tab=readme-ov-file#docker
export async function runner(
    paths: string[],
    name: FormatterKey,
    version: string,
    options: string[],
): Promise<void> {
    const tag = version === 'latest' ? 'v3' : `v${version}`
    const docker_options = [
        'run',
        '--rm',
        '-v',
        `"${cwd()}:/mnt"`,
        '-w',
        '/mnt',
        `mvdan/${name}:${tag}`,
        '--diff',
    ]

    await installer(name, tag)

    info(`[runner] Checking ${paths.length} files with ${name}`)

    await exec('docker', [...docker_options, ...options, '--', ...paths])
}
