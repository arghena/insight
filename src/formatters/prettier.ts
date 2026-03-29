import { installer } from '@/installer'
import { exec } from '@/exec'
import { fileExists } from '@/utils'
import type { Runner } from '@/types'

const toolName = 'prettier'

export const runner: Runner = async ({ version, args, paths }) => {
    const hasPackageJson = await fileExists('package.json')

    await installer(toolName, version, { hasPackageJson })

    return await exec(toolName, ['--check', ...args, '--', ...paths])
}
