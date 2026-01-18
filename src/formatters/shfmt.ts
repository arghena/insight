import { installer } from '../installer'
import { exec } from '@actions/exec'
import { info } from '@actions/core'
import { cwd } from 'process'
import { type FormatterKey } from '../map'

// NOTE: The `v3` tag of this formatter on Docker Hub is the latest stable version.
// https://github.com/mvdan/sh?tab=readme-ov-file#docker
export async function runner(
    paths: string[],
    toolName: FormatterKey,
    version: string,
    args: string[],
): Promise<void> {
    const tag = version === 'latest' ? 'v3' : `v${version}`
    const dockerArgs = [
        'run',
        '--rm',
        '-v',
        `${cwd()}:/mnt`,
        '-w',
        '/mnt',
        `mvdan/${toolName}:${tag}`,
        '--diff',
    ]

    await installer(toolName, tag)

    info(`[RUNNER] Running ${toolName} on ${paths.length.toString()} files`)

    await exec('docker', [...dockerArgs, ...args, '--', ...paths])
}
