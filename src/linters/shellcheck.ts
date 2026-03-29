import { installer } from '@/installer'
import { exec } from '@/exec'
import { buildDockerRunArgs } from '@/builders'
import type { Runner } from '@/types'

const toolName = 'shellcheck'

export const runner: Runner = async ({ version, args, paths }) => {
    const tag = version === 'latest' ? 'stable' : `v${version}`
    const dockerRunArgs = buildDockerRunArgs(`koalaman/${toolName}:${tag}`)

    await installer(toolName, tag)

    return await exec('docker', [...dockerRunArgs, ...args, '--', ...paths], { toolName })
}
