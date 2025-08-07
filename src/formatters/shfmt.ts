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
    const cli = `"$(go env GOPATH)/bin/${name}"`

    await installer(name, version)

    info(`[runner] Checking ${paths.length} files with ${name}`)

    await exec('sh', [
        '-c',
        `'${cli} --diff ${options.join(' ')} -- ${paths.join(' ')}'`,
    ])
}
