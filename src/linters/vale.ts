import { info } from '@actions/core'
import { installer } from '@/installer'
import { exec } from '@/exec'
import { buildDockerRunArgs } from '@/utils'
import type { Runner } from '@/types'

const toolName = 'vale'

export const runner: Runner = async (version, args, paths) => {
    const tag = version === 'latest' ? 'latest' : `v${version}`
    const dockerRunArgs = buildDockerRunArgs(`jdkato/${toolName}:${tag}`)

    await installer(toolName, tag)

    info(`[RUNNER] Running ${toolName} on ${paths.length.toString()} files`)

    await exec('docker', [...dockerRunArgs, 'sync'], { toolName })
    await exec('docker', [...dockerRunArgs, ...args, '--', ...paths], { toolName })
}
