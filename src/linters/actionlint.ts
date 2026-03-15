import { installer } from '@/installer'
import { exec } from '@/exec'
import { buildDockerRunArgs } from '@/utils'
import type { Runner } from '@/types'

const toolName = 'actionlint'

export const runner: Runner = async (version, args, paths) => {
    await installer(toolName, version)

    await exec(
        'docker',
        [...buildDockerRunArgs(`rhysd/${toolName}:${version}`), ...args, '--', ...paths],
        { toolName },
    )
}
