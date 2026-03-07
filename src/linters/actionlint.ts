import { info } from '@actions/core'
import { installer } from '@/installer'
import { exec } from '@/exec'
import { buildDockerRunArgs } from '@/utils'
import type { Runner } from '@/types'

const toolName = 'actionlint'

// NOTE: This linter's tag on Docker Hub doesn't have the `v` prefix.
// https://github.com/rhysd/actionlint/blob/main/docs/usage.md#docker-image
export const runner: Runner = async (version, args, paths) => {
    await installer(toolName, version)

    info(`[RUNNER] Running ${toolName} on ${paths.length.toString()} files`)

    await exec(
        'docker',
        [...buildDockerRunArgs(`rhysd/${toolName}:${version}`), ...args, '--', ...paths],
        { toolName },
    )
}
