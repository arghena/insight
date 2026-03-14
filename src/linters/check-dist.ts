import { installer } from '@/installer'
import { exec } from '@/exec'
import { ensureNci } from '@/utils'
import type { Runner } from '@/types'

const toolName = 'check-dist'

export const runner: Runner = async (version, args) => {
    await installer(toolName, version)

    await ensureNci()
    await exec('nr', args.length === 0 ? ['build'] : args)

    await exec('git', ['diff', '--quiet', 'dist/'], { toolName })
}
