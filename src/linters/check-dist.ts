import { info } from '@actions/core'
import { installer } from '@/installer'
import { exec } from '@/exec'
import type { Runner } from '@/types'

const toolName = 'check-dist'

export const runner: Runner = async (version, args, paths) => {
    await installer(toolName, version)

    info(`[RUNNER] Running ${toolName} on ${paths.length.toString()} files`)

    await exec('nci')
    await exec('nr', args.length === 0 ? ['build'] : args)

    await exec('git', ['diff', '--quiet', 'dist/'], { toolName })
}
