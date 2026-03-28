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

const rustLimit = pLimit(1)
const pmLimitMap = {
    'cargo-binstall': rustLimit,
    docker: pLimit(concurrency),
    nci: pLimit(1),
    npm: pLimit(concurrency),
    rustup: rustLimit,
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
                    // eslint-disable-next-line @typescript-eslint/promise-function-async
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
