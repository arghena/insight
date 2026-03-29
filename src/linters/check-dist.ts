import { installer } from '@/installer'
import { exec } from '@/exec'
import type { Setup, Runner } from '@/types'

const toolName = 'check-dist'

export const setup: Setup = async ({ version }) => {
    await installer(toolName, version)
}

export const runner: Runner = async ({ args }) => {
    const script = args.length === 0 ? ['build'] : args

    await exec('nr', script)

    return await exec('git', ['diff', '--quiet', 'dist/'], { toolName })
}
