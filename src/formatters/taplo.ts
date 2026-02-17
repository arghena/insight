import { exec } from '@actions/exec'
import { info } from '@actions/core'
import { installer } from '@/installer'

export async function runner(version: string, args: string[], paths: string[]): Promise<void> {
    const toolName = 'taplo'

    await installer(toolName, version)

    info(`[RUNNER] Running ${toolName} on ${paths.length.toString()} files`)

    await exec(toolName, ['fmt', '--check', ...args, '--', ...paths])
}
