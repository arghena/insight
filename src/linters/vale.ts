import { installer } from '@/installer'
import { exec } from '@/exec'
import { buildDockerRunArgs } from '@/builders'
import type { Setup, Runner } from '@/types'

const toolName = 'vale'

export const setup: Setup = async ({ version }) => {
    const tag = version === 'latest' ? 'latest' : `v${version}`

    await installer(toolName, tag)
}

export const runner: Runner = async ({ version, args, paths }) => {
    const tag = version === 'latest' ? 'latest' : `v${version}`
    const dockerRunArgs = buildDockerRunArgs(`jdkato/${toolName}:${tag}`)

    await exec('docker', [...dockerRunArgs, 'sync'], { toolName })

    return await exec('docker', [...dockerRunArgs, ...args, '--', ...paths], { toolName })
}
