import { cwd } from 'node:process'
import { exec } from '@actions/exec'
import { info } from '@actions/core'
import { installer } from '@/installer'

// NOTE: The `v3` tag of this formatter on Docker Hub is the latest stable version.
// https://github.com/mvdan/sh/blob/master/README.md#docker
export async function runner(version: string, args: string[], paths: string[]): Promise<void> {
    const toolName = 'shfmt'
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
