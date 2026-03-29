import { installer } from '@/installer'
import { exec } from '@/exec'
import { buildDockerRunArgs } from '@/builders'
import type { Runner } from '@/types'

const toolName = 'actionlint'

export const runner: Runner = async ({ version, args, paths }) => {
    const dockerRunArgs = buildDockerRunArgs(`rhysd/${toolName}:${version}`)

    await installer(toolName, version)

    return await exec('docker', [...dockerRunArgs, ...args, '--', ...paths], { toolName })
}
