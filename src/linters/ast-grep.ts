import { installer } from '@/installer'
import { exec } from '@/exec'
import type { Runner } from '@/types'

const toolName = 'ast-grep'

export const runner: Runner = async ({ version, args, paths }) => {
    await installer(toolName, version)

    return await exec(toolName, ['scan', ...args, '--', ...paths])
}
