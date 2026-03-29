import { installer } from '@/installer'
import { exec } from '@/exec'
import type { Setup, Runner } from '@/types'

const toolName = 'markdownlint-cli2'

export const setup: Setup = async ({ version }) => {
    await installer(toolName, version)
}

export const runner: Runner = async ({ args, paths }) => {
    return await exec(toolName, [...args, '--', ...paths])
}
