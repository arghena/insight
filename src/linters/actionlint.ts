import { info } from '@actions/core'
import { installer } from '@/installer'
import { exec } from '@/exec'
import { buildDockerRunArgs } from '@/utils'
import type { Runner } from '@/types'

const toolName = 'actionlint'

export const runner: Runner = async (version, args, paths) => {
    await installer(toolName, version)

    info(`[RUNNER] Running ${toolName} on ${paths.length.toString()} files`)

    await exec(
        'docker',
        [...buildDockerRunArgs(`rhysd/${toolName}:${version}`), ...args, '--', ...paths],
        { toolName },
    )
}
