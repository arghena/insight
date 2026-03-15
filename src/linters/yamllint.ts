import { installer } from '@/installer'
import { exec } from '@/exec'
import type { Runner } from '@/types'

const toolName = 'yamllint'

export const runner: Runner = async ({ version, args, paths }) => {
    await installer(toolName, version)

    return await exec(toolName, [...args, '--', ...paths])
}
