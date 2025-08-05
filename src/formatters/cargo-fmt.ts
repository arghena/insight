import { installer } from '../installer'
import { exec } from '@actions/exec'
import { info } from '@actions/core'
import { type FormatterKey } from '../map'

// NOTE: This formatter doesn't support file path input.
export async function runner(
    paths: string[],
    name: FormatterKey,
    version: string,
    options: string[],
): Promise<void> {
    await installer(name, version)

    info(`[runner] ${paths.length} files matched – running ${name}`)

    await exec(name.replace('_', '-'), ['--check', ...options])
}
