import { exec } from '@/exec'
import { installer } from '@/installer'
import { defineTool, fileExists } from '@/utils'

const toolName = 'eslint'

export default defineTool({
    setup: async ({ version }) => {
        // https://eslint.org/docs/latest/use/configure/configuration-files#configuration-file
        const hasTsEslintConfig = await fileExists(
            `${toolName}.config.ts`,
            `${toolName}.config.mts`,
            `${toolName}.config.cts`,
        )

        await installer(toolName, version, { hasTsEslintConfig })
    },
    runner: async ({ args, paths }) => {
        return await exec(toolName, [...args, '--', ...paths])
    },
})
