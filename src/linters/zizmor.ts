import { exec } from '@/exec'
import { installer } from '@/installer'
import { defineTool } from '@/utils'

const toolName = 'zizmor'

export default defineTool({
    setup: async ({ version }) => {
        await installer(toolName, version)
    },
    runner: async ({ args, paths }) => {
        return await exec(
            toolName,
            [...args, '--', ...paths],
            // NOTE: `zizmor` is running in offline mode by default.
            // https://docs.zizmor.sh/usage/#operating-modes
            { needsToken: true },
        )
    },
})
