import { exec, execOnce } from '@/exec'
import { toolStepBuilderRegistry } from '@/registries'
import { addInstalledTool, hasInstalledTool, addPromise, hasPromise, getPromise } from '@/store'
import { fetchText, isValidHttpsUrl } from '@/fetch'
import type { ToolName, InstallerOptions } from '@/types'

export async function installer(
    toolName: ToolName,
    version: string,
    options?: InstallerOptions,
): Promise<void> {
    if (hasInstalledTool(toolName)) {
        return
    }
    if (hasPromise(toolName, 'setup')) {
        await getPromise(toolName, 'setup')

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

                if (packageManager === 'nci') {
                    await execOnce(packageManager, args)
                } else {
                    await exec(packageManager, args)
                }
            }
        }

        addInstalledTool(toolName)
    })()

    addPromise(toolName, { promiseType: 'setup', task: installTask })

    await installTask
}
