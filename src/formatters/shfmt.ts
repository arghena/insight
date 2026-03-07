import { info } from '@actions/core'
import { installer } from '@/installer'
import { exec } from '@/exec'
import { buildDockerRunArgs } from '@/utils'
import type { Runner } from '@/types'

const toolName = 'shfmt'

// NOTE: The `v3` tag of this formatter on Docker Hub is the latest stable version.
// https://github.com/mvdan/sh/blob/master/README.md#docker
export const runner: Runner = async (version, args, paths) => {
    const tag = version === 'latest' ? 'v3' : `v${version}`

    await installer(toolName, tag)

    info(`[RUNNER] Running ${toolName} on ${paths.length.toString()} files`)

    await exec(
        'docker',
        [...buildDockerRunArgs(`mvdan/${toolName}:${tag}`), '--diff', ...args, '--', ...paths],
        { toolName },
    )
}
