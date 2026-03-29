import { installer } from '@/installer'
import { exec } from '@/exec'
import type { Runner } from '@/types'

const toolName = 'check-dist'

export const runner: Runner = async ({ version, args }) => {
    const script = args.length === 0 ? ['build'] : args

    await installer(toolName, version)

    await exec('nr', script)

    return await exec('git', ['diff', '--quiet', 'dist/'], { toolName })
}
