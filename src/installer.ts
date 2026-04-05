import pLimit, { type LimitFunction } from 'p-limit'
import { exec } from '@/exec'
import { fetchText } from '@/fetch'
import { concurrency } from '@/constants'
import { toolStepBuilderRegistry } from '@/registries'
import {
    addSetupPromise,
    hasSetupPromise,
    getSetupPromise,
    addExecPromise,
    hasExecPromise,
    getExecPromise,
} from '@/store'
import type { PackageManager, ToolName, InstallerOptions, ExecKey } from '@/types'

const pmLimitMap = {
    'cargo-binstall': pLimit(concurrency),
    docker: pLimit(concurrency),
    // NOTE: Prevent concurrent package manager installs.
    nci: pLimit(1),
    npm: pLimit(concurrency),
    // NOTE: Prevent unsafe concurrent installations.
    // https://github.com/rust-lang/rustup/issues/988
    rustup: pLimit(1),
    uv: pLimit(concurrency),
} as const satisfies Record<PackageManager, LimitFunction>

export async function installer(
    toolName: ToolName,
    version: string,
    options?: InstallerOptions,
): Promise<void> {
    if (hasSetupPromise(toolName)) {
        await getSetupPromise(toolName)

        return
    }

    const installTask = (async (): Promise<void> => {
        const steps = toolStepBuilderRegistry[toolName]({ toolName, version, options })

        for (const step of steps) {
            if ('script' in step) {
                const content = await fetchText(step.script)

                await exec('sh', [], { input: content })
            } else {
                const { packageManager, args } = step

                if (packageManager !== toolName) {
                    await installer(packageManager, version, options)
                }

                const execKey: ExecKey = `${packageManager}:${args.join(' ')}`

                if (hasExecPromise(execKey)) {
                    await getExecPromise(execKey)
                } else {
                    const execTask = pmLimitMap[packageManager](() => exec(packageManager, args))

                    addExecPromise(execKey, execTask)

                    await execTask
                }
            }
        }
    })()

    addSetupPromise(toolName, installTask)

    await installTask
}
