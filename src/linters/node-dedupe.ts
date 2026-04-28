import { exec } from '@/exec'
import { installer } from '@/installer'
import { defineTool } from '@/utils'

const toolName = 'node-dedupe'

export default defineTool({
    setup: async ({ version }) => {
        await installer(toolName, version)
    },
    runner: async ({ args }) => {
        return await exec('na', ['dedupe', '--check', ...args], { toolName })
    },
})
