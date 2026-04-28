import { exec } from '@/exec'
import { installer } from '@/installer'
import { defineTool } from '@/utils'

const toolName = 'cargo-clippy'

export default defineTool({
    setup: async ({ version }) => {
        const toolchain = version === 'latest' ? 'stable' : version

        await installer(toolName, toolchain)
    },
    runner: async ({ args }) => {
        return await exec(toolName, args)
    },
})
