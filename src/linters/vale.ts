import { cwd } from 'node:process'
import { exec } from '@actions/exec'
import { info } from '@actions/core'
import { installer } from '@/installer'
import { type LinterKey } from '@/map'

export async function runner(
    paths: string[],
    toolName: LinterKey,
    version: string,
    args: string[],
): Promise<void> {
    const tag = version === 'latest' ? 'latest' : `v${version}`
    const dockerArgs = [
        'run',
        '--rm',
        '-v',
        `${cwd()}:/mnt`,
        '-w',
        '/mnt',
        `jdkato/${toolName}:${tag}`,
    ]

    await installer(toolName, tag)

    info(`[RUNNER] Running ${toolName} on ${paths.length.toString()} files`)

    await exec('docker', [...dockerArgs, 'sync'])
    await exec('docker', [...dockerArgs, ...args, '--', ...paths])
}
