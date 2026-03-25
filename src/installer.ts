import { exec } from '@/exec'
import { toolStepBuilderRegistry } from '@/registries'
import {
    addSetupPromise,
    hasSetupPromise,
    getSetupPromise,
    addExecPromise,
    hasExecPromise,
    getExecPromise,
} from '@/store'
import { fetchText, isValidHttpsUrl } from '@/fetch'
import type { ToolName, InstallerOptions, ExecKey } from '@/types'

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
                const content = isValidHttpsUrl(step.script)
                    ? await fetchText(step.script)
                    : step.script

                await exec('sh', [], { input: content })
            } else {
                const { packageManager, args } = step

                await installer(packageManager, version, options)

                const execKey: ExecKey = `${packageManager}:${args.join(' ')}`

                if (hasExecPromise(execKey)) {
                    await getExecPromise(execKey)
                } else {
                    const execTask = exec(packageManager, args)

                    addExecPromise(execKey, execTask)

                    await execTask
                }
            }
        }
    })()

    addSetupPromise(toolName, installTask)

    await installTask
}
