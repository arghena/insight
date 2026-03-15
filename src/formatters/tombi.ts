import { installer } from '@/installer'
import { exec } from '@/exec'
import type { Runner } from '@/types'

const toolName = 'tombi'

export const runner: Runner = async (version, args, paths) => {
    await installer(toolName, version)

    await exec(toolName, ['format', '--check', ...args, '--', ...paths], { toolType: 'formatter' })
}
