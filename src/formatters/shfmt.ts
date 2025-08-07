import { installer } from '../installer'
import { exec } from '@actions/exec'
import { info } from '@actions/core'
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

    await installer(name, tag)

    info(`[runner] Checking ${paths.length} files with ${name}`)

    await exec('docker', [
        'run',
        '--rm',
        '-v',
        '"$PWD:/mnt"',
        '-w',
        '/mnt',
        `mvdan/${name}:${tag}`,
        '--diff',
        ...options,
        '--',
        ...paths,
    ])
}
