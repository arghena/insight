import { installer } from '@/installer'
import { exec } from '@/exec'
import { fileExists } from '@/utils'
import { buildDockerRunArgs } from '@/builders'
import type { Runner } from '@/types'

const toolName = 'trivy'

export const runner: Runner = async ({ version, args }) => {
    const hasPackageJson = await fileExists('package.json')
    const dockerRunArgs = buildDockerRunArgs(`ghcr.io/aquasecurity/${toolName}:${version}`)

    await installer(toolName, version, { hasPackageJson })

    return await exec('docker', [...dockerRunArgs, 'filesystem', ...args, '.'], { toolName })
}
