import { exec } from '@/exec'
import { installer } from '@/installer'
import { defineTool } from '@/utils'

const toolName = 'check-dist'

export default defineTool({
    setup: async ({ version }) => {
        await installer(toolName, version)
    },
    runner: async ({ args }) => {
        const script = args.length === 0 ? ['build'] : args

        await exec('nr', script)

        return await exec('git', ['diff', '--quiet', 'dist/'], { toolName })
    },
})
