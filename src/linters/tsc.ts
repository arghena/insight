import { installer } from '@/installer'
import { exec } from '@/exec'
import type { Runner } from '@/types'

const toolName = 'tsc'

export const runner: Runner = async ({ version, args }) => {
    await installer(toolName, version)

    return await exec(toolName, ['--incremental', 'false', '--noEmit', ...args])
}
