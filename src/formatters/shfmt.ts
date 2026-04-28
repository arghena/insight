import { exec } from '@/exec'
import { installer } from '@/installer'
import { defineTool } from '@/utils'
import { buildDockerRunArgs } from '@/builders'

const toolName = 'shfmt'

export default defineTool({
    setup: async ({ version }) => {
        const tag = version === 'latest' ? 'v3' : `v${version}`

        await installer(toolName, tag)
    },
    runner: async ({ version, args, paths }) => {
        const tag = version === 'latest' ? 'v3' : `v${version}`
        const dockerRunArgs = buildDockerRunArgs(`mvdan/${toolName}:${tag}`)

        return await exec('docker', [...dockerRunArgs, '--diff', ...args, '--', ...paths], {
            toolName,
        })
    },
})
