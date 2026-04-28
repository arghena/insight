import { exec } from '@/exec'
import { installer } from '@/installer'
import { defineTool } from '@/utils'
import { buildDockerRunArgs } from '@/builders'

const toolName = 'vale'

export default defineTool({
    setup: async ({ version }) => {
        const tag = version === 'latest' ? 'latest' : `v${version}`

        await installer(toolName, tag)
    },
    runner: async ({ version, args, paths }) => {
        const tag = version === 'latest' ? 'latest' : `v${version}`
        const dockerRunArgs = buildDockerRunArgs(`jdkato/${toolName}:${tag}`)

        await exec('docker', [...dockerRunArgs, 'sync'], { toolName })

        return await exec('docker', [...dockerRunArgs, ...args, '--', ...paths], { toolName })
    },
})
