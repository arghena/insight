import { exec } from '@actions/exec'
import { info } from '@actions/core'
import { installer } from '@/installer'

export async function runner(version: string, args: string[], paths: string[]): Promise<void> {
    const toolName = 'cargo-deny'
    const count = paths.length

    await installer(toolName, version)

    info(
        count === 0
            ? `[RUNNER] Running ${toolName} cron job`
            : `[RUNNER] Running ${toolName} on ${count.toString()} files`,
    )

    await exec(toolName, ['check', ...args])
}
