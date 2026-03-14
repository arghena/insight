import { installer } from '@/installer'
import { exec } from '@/exec'
import { buildDockerRunArgs } from '@/utils'
import type { Runner } from '@/types'

const toolName = 'shfmt'

export const runner: Runner = async (version, args, paths) => {
    const tag = version === 'latest' ? 'v3' : `v${version}`

    await installer(toolName, tag)

    await exec(
        'docker',
        [...buildDockerRunArgs(`mvdan/${toolName}:${tag}`), '--diff', ...args, '--', ...paths],
        { toolName },
    )
}
