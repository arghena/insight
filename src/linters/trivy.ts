import { installer } from '@/installer'
import { exec } from '@/exec'
import { fileExists } from '@/utils'
import { buildDockerRunArgs } from '@/builders'
import type { Setup, Runner } from '@/types'

const toolName = 'trivy'

export const setup: Setup = async ({ version }) => {
    const hasPackageJson = await fileExists('package.json')

    await installer(toolName, version, { hasPackageJson })
}

export const runner: Runner = async ({ version, args }) => {
    const dockerRunArgs = buildDockerRunArgs(`ghcr.io/aquasecurity/${toolName}:${version}`)

    return await exec('docker', [...dockerRunArgs, 'filesystem', ...args, '.'], { toolName })
}
