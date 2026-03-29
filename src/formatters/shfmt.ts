import { installer } from '@/installer'
import { exec } from '@/exec'
import { buildDockerRunArgs } from '@/builders'
import type { Runner } from '@/types'

const toolName = 'shfmt'

export const runner: Runner = async ({ version, args, paths }) => {
    const tag = version === 'latest' ? 'v3' : `v${version}`
    const dockerRunArgs = buildDockerRunArgs(`mvdan/${toolName}:${tag}`)

    await installer(toolName, tag)

    return await exec('docker', [...dockerRunArgs, '--diff', ...args, '--', ...paths], { toolName })
}
