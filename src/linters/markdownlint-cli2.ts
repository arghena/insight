import { info } from '@actions/core'
import { installer } from '@/installer'
import { exec } from '@/exec'
import type { Runner } from '@/types'

const toolName = 'markdownlint-cli2'

export const runner: Runner = async (version, args, paths) => {
    await installer(toolName, version)

    info(`[RUNNER] Running ${toolName} on ${paths.length.toString()} files`)

    await exec(toolName, [...args, '--', ...paths])
}
