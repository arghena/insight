import { info } from '@actions/core'
import { installer } from '@/installer'
import { exec } from '@/exec'
import type { Runner } from '@/types'

const toolName = 'cargo-deny'

export const runner: Runner = async (version, args, paths) => {
    const count = paths.length

    await installer(toolName, version)

    info(
        count === 0
            ? `[RUNNER] Running ${toolName} cron job`
            : `[RUNNER] Running ${toolName} on ${count.toString()} files`,
    )

    await exec(toolName, ['check', ...args])
}
