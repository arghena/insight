import { installer } from '@/installer'
import { exec } from '@/exec'
import type { Setup, Runner } from '@/types'

const toolName = 'cargo-fmt'

export const setup: Setup = async ({ version }) => {
    const toolchain = version === 'latest' ? 'stable' : version

    await installer(toolName, toolchain)
}

export const runner: Runner = async ({ args }) => {
    return await exec(toolName, ['--check', ...args])
}
