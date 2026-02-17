import { exec } from '@actions/exec'
import { info } from '@actions/core'
import { installer } from '@/installer'

// NOTE: This formatter doesn't support file path input.
export async function runner(version: string, args: string[], paths: string[]): Promise<void> {
    const toolName = 'cargo-fmt'

    await installer(toolName, version)

    info(`[RUNNER] Running ${toolName} on ${paths.length.toString()} files`)

    await exec(toolName, ['--check', ...args])
}
