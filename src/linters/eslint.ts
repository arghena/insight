import { installer } from '@/installer'
import { exec } from '@actions/exec'
import { info } from '@actions/core'
import { type LinterKey } from '@/map'

export async function runner(
    paths: string[],
    toolName: LinterKey,
    version: string,
    args: string[],
): Promise<void> {
    await installer(toolName, version)

    info(`[RUNNER] Running ${toolName} on ${paths.length.toString()} files`)

    // NOTE: `nci --dev` isn't always correct
    // because `tseslint.configs.*TypeChecked` requires a complete environment.
    // https://typescript-eslint.io/getting-started/typed-linting
    await exec('nci')
    await exec(toolName, [...args, '--', ...paths])
}
