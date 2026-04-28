import { exec } from '@/exec'
import { installer } from '@/installer'
import { defineTool } from '@/utils'
import { buildDockerRunArgs } from '@/builders'

const toolName = 'actionlint'

export default defineTool({
    setup: async ({ version }) => {
        await installer(toolName, version)
    },
    runner: async ({ version, args, paths }) => {
        const dockerRunArgs = buildDockerRunArgs(`rhysd/${toolName}:${version}`)

        return await exec('docker', [...dockerRunArgs, ...args, '--', ...paths], { toolName })
    },
})
