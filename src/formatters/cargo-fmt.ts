import { installer } from '@/installer'
import { exec } from '@/exec'
import type { Runner } from '@/types'

const toolName = 'cargo-fmt'

// NOTE: This formatter doesn't support file path input.
export const runner: Runner = async ({ version, args }) => {
    await installer(toolName, version === 'latest' ? 'stable' : version)

    return await exec(toolName, ['--check', ...args])
}
