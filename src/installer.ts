import pLimit, { type LimitFunction } from 'p-limit'
import { exec } from '@/exec'
import { concurrency } from '@/constants'
import { toolStepBuilderRegistry } from '@/registries'
import { addInstalledTool, hasInstalledTool, addPromise, hasPromise, getPromise } from '@/store'
import { fetchText, isValidHttpsUrl } from '@/fetch'
import type { PackageManager, ToolName, InstallerOptions } from '@/types'

const pmLimitMap = {
    npm: pLimit(concurrency),
    rustup: pLimit(1),
    'cargo-binstall': pLimit(concurrency),
    uv: pLimit(concurrency),
    docker: pLimit(concurrency),
    nci: pLimit(1),
} as const satisfies Record<PackageManager, LimitFunction>

export async function installer(
    toolName: ToolName,
    version: string,
    options?: InstallerOptions,
): Promise<void> {
    if (hasInstalledTool(toolName)) {
        return
    }
    if (hasPromise(toolName)) {
        await getPromise(toolName)

        return
    }

    const installTask = (async (): Promise<void> => {
        const steps = toolStepBuilderRegistry[toolName]({ toolName, version, options })

        for (const step of steps) {
            if ('script' in step) {
                const content = isValidHttpsUrl(step.script)
                    ? await fetchText(step.script)
                    : step.script

                await exec('sh', [], { input: content })
            } else {
                const { packageManager, args } = step

                await installer(packageManager, version, options)

                // eslint-disable-next-line @typescript-eslint/promise-function-async
                await pmLimitMap[packageManager](() => exec(packageManager, args))
            }
        }

        addInstalledTool(toolName)
    })()

    addPromise(toolName, installTask)

    await installTask
}
