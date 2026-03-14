import { installer } from '@/installer'
import { exec } from '@/exec'
import { fileExists } from '@/utils'
import type { Runner } from '@/types'

const toolName = 'eslint'

export const runner: Runner = async (version, args, paths) => {
    // https://eslint.org/docs/latest/use/configure/configuration-files#configuration-file
    const hasTsEslintConfig = await fileExists(
        `${toolName}.config.ts`,
        `${toolName}.config.mts`,
        `${toolName}.config.cts`,
    )

    await installer(toolName, version, { hasTsEslintConfig })

    await exec('nci')
    await exec(toolName, [...args, '--', ...paths])
}
