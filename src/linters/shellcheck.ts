import { installer } from '@/installer'
import { exec } from '@/exec'
import { buildDockerRunArgs } from '@/builders'
import type { Setup, Runner } from '@/types'

const toolName = 'shellcheck'

export const setup: Setup = async ({ version }) => {
    const tag = version === 'latest' ? 'stable' : `v${version}`

    await installer(toolName, tag)
}

export const runner: Runner = async ({ version, args, paths }) => {
    const tag = version === 'latest' ? 'stable' : `v${version}`
    const dockerRunArgs = buildDockerRunArgs(`koalaman/${toolName}:${tag}`)

    return await exec('docker', [...dockerRunArgs, ...args, '--', ...paths], { toolName })
}
