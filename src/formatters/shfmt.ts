import { installer } from '../installer'
import { exec } from '@actions/exec'
import { info } from '@actions/core'
import { type FormatterKey } from '../map'

export async function runner(
    paths: string[],
    name: FormatterKey,
    version: string,
    options: string[],
): Promise<void> {
    await installer(name, version)

    info(`[runner] Checking ${paths.length} files with ${name}`)

    await exec('sh', [
        '-c',
        `"$(go env GOPATH)/bin/${name}"`,
        '--diff',
        ...options,
        ...paths,
    ])
}
