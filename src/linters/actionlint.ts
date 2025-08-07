import { installer } from '../installer'
import { exec } from '@actions/exec'
import { info } from '@actions/core'
import { getGoCliPath } from '../utils'
import { type LinterKey } from '../map'

export async function runner(
    paths: string[],
    name: LinterKey,
    version: string,
    options: string[],
): Promise<void> {
    const cli = await getGoCliPath(name)

    await installer(name, version)

    info(`[runner] Checking ${paths.length} files with ${name}`)

    await exec(cli, [...options, '--', ...paths])
}
