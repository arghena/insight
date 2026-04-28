import { exec } from '@/exec'
import { installer } from '@/installer'
import { defineTool } from '@/utils'
import { buildDockerRunArgs } from '@/builders'

const toolName = 'shellcheck'

export default defineTool({
    setup: async ({ version }) => {
        const tag = version === 'latest' ? 'stable' : `v${version}`

        await installer(toolName, tag)
    },
    runner: async ({ version, args, paths }) => {
        const tag = version === 'latest' ? 'stable' : `v${version}`
        const dockerRunArgs = buildDockerRunArgs(`koalaman/${toolName}:${tag}`)

        return await exec('docker', [...dockerRunArgs, ...args, '--', ...paths], { toolName })
    },
})
