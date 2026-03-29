import { installer } from '@/installer'
import { exec } from '@/exec'
import type { Setup, Runner } from '@/types'

const toolName = 'node-audit'

export const setup: Setup = async ({ version }) => {
    await installer(toolName, version)
}

export const runner: Runner = async ({ args }) => {
    return await exec('na', ['audit', ...args], { toolName })
}
