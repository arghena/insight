import { installer } from '@/installer'
import { exec } from '@/exec'
import type { Runner } from '@/types'

const toolName = 'node-dedupe'

export const runner: Runner = async ({ version, args }) => {
    await installer(toolName, version)

    return await exec('na', ['dedupe', '--check', ...args], { toolName })
}
