import { cwd } from 'node:process'
import { exec } from '@actions/exec'
import { info } from '@actions/core'
import { installer } from '@/installer'

export async function runner(version: string, args: string[], paths: string[]): Promise<void> {
    const toolName = 'shellcheck'
    const tag = version === 'latest' ? 'stable' : `v${version}`
    const dockerArgs = [
        'run',
        '--rm',
        '-v',
        `${cwd()}:/mnt`,
        '-w',
        '/mnt',
        `koalaman/${toolName}:${tag}`,
    ]

    await installer(toolName, tag)

    info(`[RUNNER] Running ${toolName} on ${paths.length.toString()} files`)

    await exec('docker', [...dockerArgs, ...args, '--', ...paths])
}
