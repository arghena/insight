import { exec } from '@/exec'
import { installer } from '@/installer'
import { buildDockerRunArgs } from '@/builders'
import { defineTool, fileExists } from '@/utils'

const toolName = 'trivy'

export default defineTool({
    setup: async ({ version }) => {
        const hasPackageJson = await fileExists('package.json')

        await installer(toolName, version, { hasPackageJson })
    },
    runner: async ({ version, args }) => {
        const dockerRunArgs = buildDockerRunArgs(`ghcr.io/aquasecurity/${toolName}:${version}`)

        return await exec('docker', [...dockerRunArgs, 'filesystem', ...args, '.'], { toolName })
    },
    // NOTE: Trivy's filesystem walker is strictly intolerant of concurrent modifications.
    // https://github.com/aquasecurity/trivy/discussions/7071
    phase: 'post',
})
