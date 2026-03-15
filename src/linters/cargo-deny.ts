import { installer } from '@/installer'
import { exec } from '@/exec'
import type { Runner } from '@/types'

const toolName = 'cargo-deny'

export const runner: Runner = async (version, args) => {
    await installer(toolName, version)

    await exec(toolName, ['check', ...args])
}
