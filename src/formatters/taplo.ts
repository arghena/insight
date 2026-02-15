import { exec } from '@actions/exec'
import { info } from '@actions/core'
import { installer } from '@/installer'
import { type FormatterKey } from '@/map'

export async function runner(
    paths: string[],
    toolName: FormatterKey,
    version: string,
    args: string[],
): Promise<void> {
    await installer(toolName, version)

    info(`[RUNNER] Running ${toolName} on ${paths.length.toString()} files`)

    await exec(toolName, ['fmt', '--check', ...args, '--', ...paths])
}
