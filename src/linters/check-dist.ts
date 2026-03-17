import { installer } from '@/installer'
import { exec } from '@/exec'
import type { Setup, Runner } from '@/types'

const toolName = 'check-dist'

export const setup: Setup = async ({ version }) => {
    await installer(toolName, version)
}

export const runner: Runner = async ({ args }) => {
    await exec('nr', args.length === 0 ? ['build'] : args)

    return await exec('git', ['diff', '--quiet', 'dist/'], { toolName })
}
