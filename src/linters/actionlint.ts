import { installer } from '@/installer'
import { exec } from '@/exec'
import { buildDockerRunArgs } from '@/builders'
import type { Setup, Runner } from '@/types'

const toolName = 'actionlint'

export const setup: Setup = async ({ version }) => {
    await installer(toolName, version)
}

export const runner: Runner = async ({ version, args, paths }) => {
    return await exec(
        'docker',
        [...buildDockerRunArgs(`rhysd/${toolName}:${version}`), ...args, '--', ...paths],
        { toolName },
    )
}
