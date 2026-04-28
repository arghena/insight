import { exec } from '@/exec'
import { installer } from '@/installer'
import { defineTool } from '@/utils'

const toolName = 'node-audit'

export default defineTool({
    setup: async ({ version }) => {
        await installer(toolName, version)
    },
    runner: async ({ args }) => {
        return await exec('na', ['audit', ...args], { toolName })
    },
})
