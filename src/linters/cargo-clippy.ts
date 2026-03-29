import { installer } from '@/installer'
import { exec } from '@/exec'
import type { Runner } from '@/types'

const toolName = 'cargo-clippy'

export const runner: Runner = async ({ version, args }) => {
    const toolchain = version === 'latest' ? 'stable' : version

    await installer(toolName, toolchain)

    return await exec(toolName, args)
}
