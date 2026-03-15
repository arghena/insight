import { installer } from '@/installer'
import { exec } from '@/exec'
import { fileExists, buildDockerRunArgs } from '@/utils'
import type { Runner } from '@/types'

const toolName = 'trivy'

export const runner: Runner = async (version, args) => {
    const hasPackageJson = await fileExists('package.json')

    await installer(toolName, version, { hasPackageJson })

    await exec(
        'docker',
        [
            ...buildDockerRunArgs(`ghcr.io/aquasecurity/${toolName}:${version}`),
            'filesystem',
            ...args,
            '.',
        ],
        { toolName },
    )
}
