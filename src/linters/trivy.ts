import { installer } from '@/installer'
import { exec } from '@/exec'
import { fileExists } from '@/utils'
import { buildDockerRunArgs } from '@/builders'
import type { Setup, Runner, RunPhase } from '@/types'

// NOTE: Trivy's filesystem walker is strictly intolerant of concurrent modifications.
// https://github.com/aquasecurity/trivy/discussions/7071
export const runPhase: RunPhase = 'post'

const toolName = 'trivy'

export const setup: Setup = async ({ version }) => {
    const hasPackageJson = await fileExists('package.json')

    await installer(toolName, version, { hasPackageJson })
}

export const runner: Runner = async ({ version, args }) => {
    const dockerRunArgs = buildDockerRunArgs(`ghcr.io/aquasecurity/${toolName}:${version}`)

    return await exec('docker', [...dockerRunArgs, 'filesystem', ...args, '.'], { toolName })
}
