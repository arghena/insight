import { installer } from '@/installer'
import { exec } from '@/exec'
import type { Setup, Runner } from '@/types'

const toolName = 'cargo-fmt'

export const setup: Setup = async ({ version }) => {
    await installer(toolName, version === 'latest' ? 'stable' : version)
}

export const runner: Runner = async ({ args }) => {
    return await exec(toolName, ['--check', ...args])
}
