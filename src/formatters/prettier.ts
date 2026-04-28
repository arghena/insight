import { exec } from '@/exec'
import { installer } from '@/installer'
import { defineTool, fileExists } from '@/utils'

const toolName = 'prettier'

export default defineTool({
    setup: async ({ version }) => {
        const hasPackageJson = await fileExists('package.json')

        await installer(toolName, version, { hasPackageJson })
    },
    runner: async ({ args, paths }) => {
        return await exec(toolName, ['--check', ...args, '--', ...paths])
    },
})
