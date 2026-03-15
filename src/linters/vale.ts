import { installer } from '@/installer'
import { exec } from '@/exec'
import { buildDockerRunArgs } from '@/utils'
import type { Runner } from '@/types'

const toolName = 'vale'

export const runner: Runner = async (version, args, paths) => {
    const tag = version === 'latest' ? 'latest' : `v${version}`
    const dockerRunArgs = buildDockerRunArgs(`jdkato/${toolName}:${tag}`)

    await installer(toolName, tag)
    await exec('docker', [...dockerRunArgs, 'sync'], { toolName })

    return await exec('docker', [...dockerRunArgs, ...args, '--', ...paths], { toolName })
}
