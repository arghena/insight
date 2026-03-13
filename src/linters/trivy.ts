import { info } from '@actions/core'
import { installer } from '@/installer'
import { exec } from '@/exec'
import { fileExists, buildDockerRunArgs } from '@/utils'
import type { Runner } from '@/types'

const toolName = 'trivy'

export const runner: Runner = async (version, args, paths) => {
    const hasPackageJson = await fileExists('package.json')

    await installer(toolName, version, { hasPackageJson })

    info(`[RUNNER] Running ${toolName} on ${paths.length.toString()} files`)

    if (hasPackageJson) {
        await exec('nci')
    }

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
