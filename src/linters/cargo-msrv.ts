import { installer } from '@/installer'
import { exec } from '@/exec'
import type { Runner } from '@/types'

const toolName = 'cargo-msrv'

export const runner: Runner = async (version, args) => {
    await installer(toolName, version)

    return await exec(toolName, ['verify', ...args])
}
