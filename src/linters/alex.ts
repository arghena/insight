import { exec } from '@/exec'
import { installer } from '@/installer'
import { defineTool } from '@/utils'

const toolName = 'alex'

export default defineTool({
    setup: async ({ version }) => {
        await installer(toolName, version)
    },
    runner: async ({ args, paths }) => {
        return await exec(toolName, [...args, '--', ...paths])
    },
})
