import { installer } from '@/installer'
import { exec } from '@/exec'
import { fileExists } from '@/utils'
import type { Setup, Runner } from '@/types'

const toolName = 'eslint'

export const setup: Setup = async ({ version }) => {
    // https://eslint.org/docs/latest/use/configure/configuration-files#configuration-file
    const hasTsEslintConfig = await fileExists(
        `${toolName}.config.ts`,
        `${toolName}.config.mts`,
        `${toolName}.config.cts`,
    )

    await installer(toolName, version, { hasTsEslintConfig })
}

export const runner: Runner = async ({ args, paths }) => {
    return await exec(toolName, [...args, '--', ...paths])
}
