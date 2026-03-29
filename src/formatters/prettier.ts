import { installer } from '@/installer'
import { exec } from '@/exec'
import { fileExists } from '@/utils'
import type { Setup, Runner } from '@/types'

const toolName = 'prettier'

export const setup: Setup = async ({ version }) => {
    const hasPackageJson = await fileExists('package.json')

    await installer(toolName, version, { hasPackageJson })
}

export const runner: Runner = async ({ args, paths }) => {
    return await exec(toolName, ['--check', ...args, '--', ...paths])
}
