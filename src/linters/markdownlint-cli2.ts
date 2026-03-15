import { installer } from '@/installer'
import { exec } from '@/exec'
import type { Runner } from '@/types'

const toolName = 'markdownlint-cli2'

export const runner: Runner = async (version, args, paths) => {
    await installer(toolName, version)

    await exec(toolName, [...args, '--', ...paths])
}
