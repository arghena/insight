import { installer } from '../installer'
import { exec } from '@actions/exec'
import { info } from '@actions/core'
import { type LinterKey } from '../map'

export async function runner(
    paths: string[],
    name: LinterKey,
    version: string,
    options: string[],
): Promise<void> {
    const tag = version === 'latest' ? 'stable' : `v${version}`

    await installer(name, tag)

    info(`[runner] Checking ${paths.length} files with ${name}`)

    await exec('docker', [
        'run',
        '--rm',
        '-v',
        '"$PWD:/mnt"',
        '-w',
        '/mnt',
        `koalaman/${name}:${tag}`,
        ...options,
        '--',
        ...paths,
    ])
}
