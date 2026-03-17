import { installer } from '@/installer'
import { exec } from '@/exec'
import { buildDockerRunArgs } from '@/builders'
import type { Setup, Runner } from '@/types'

const toolName = 'shfmt'

export const setup: Setup = async ({ version }) => {
    const tag = version === 'latest' ? 'v3' : `v${version}`

    await installer(toolName, tag)
}

export const runner: Runner = async ({ version, args, paths }) => {
    const tag = version === 'latest' ? 'v3' : `v${version}`

    return await exec(
        'docker',
        [...buildDockerRunArgs(`mvdan/${toolName}:${tag}`), '--diff', ...args, '--', ...paths],
        { toolName },
    )
}
