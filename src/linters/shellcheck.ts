import { info } from '@actions/core'
import { installer } from '@/installer'
import { exec } from '@/exec'
import { buildDockerRunArgs } from '@/utils'
import type { Runner } from '@/types'

const toolName = 'shellcheck'

export const runner: Runner = async (version, args, paths) => {
    const tag = version === 'latest' ? 'stable' : `v${version}`

    await installer(toolName, tag)

    info(`[RUNNER] Running ${toolName} on ${paths.length.toString()} files`)

    await exec(
        'docker',
        [...buildDockerRunArgs(`koalaman/${toolName}:${tag}`), ...args, '--', ...paths],
        { toolName },
    )
}
