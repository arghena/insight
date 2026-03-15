import { installer } from '@/installer'
import { exec } from '@/exec'
import type { Runner } from '@/types'

const toolName = 'cargo-clippy'

// NOTE: This linter doesn't support file path input.
export const runner: Runner = async (version, args) => {
    await installer(toolName, version === 'latest' ? 'stable' : version)

    return await exec(toolName, args)
}
