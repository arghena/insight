import { exec } from '@/exec'
import { installer } from '@/installer'
import { defineTool } from '@/utils'

const toolName = 'tombi'

export default defineTool({
    setup: async ({ version }) => {
        await installer(toolName, version)
    },
    runner: async ({ args, paths }) => {
        return await exec(toolName, ['lint', ...args, '--', ...paths], { toolType: 'linter' })
    },
})
