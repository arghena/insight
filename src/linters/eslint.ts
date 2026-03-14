import { info } from '@actions/core'
import { installer } from '@/installer'
import { exec } from '@/exec'
import { fileExists, ensureNci } from '@/utils'
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

    info(`[RUNNER] Running ${toolName} on ${paths.length.toString()} files`)

    await ensureNci()
    await exec(toolName, [...args, '--', ...paths])
}
