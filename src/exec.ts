import { Buffer } from 'node:buffer'
import { getExecOutput } from '@actions/exec'
import { addExecError, addPromise, hasPromise, getPromise } from '@/store'
import { isIncluded } from '@/utils'
import { formatterKeys, linterKeys } from '@/registries'
import type { ExecOptions, ToolName, ToolType } from '@/types'

export async function execOnce(toolName: ToolName, args?: string[]): Promise<void> {
    if (hasPromise(toolName, 'exec')) {
        await getPromise(toolName, 'exec')

        return
    }

    const execTask = exec(toolName, args)

    addPromise(toolName, { promiseType: 'exec', task: execTask })

    await execTask
}

export async function exec(
    command: string,
    args?: string[],
    options?: ExecOptions,
): Promise<number> {
    const toolName = options?.toolName ?? command
    const { stdout, stderr, exitCode } = await getExecOutput(command, args, {
        input: serializeInput(options?.input),
        silent: true,
        ignoreReturnCode: true,
        env: {
            ...process.env,
            /* eslint-disable @typescript-eslint/naming-convention */
            CARGO_INCREMENTAL: '0',
            // https://github.com/antfu-collective/ni/blob/82611c44aeada5185d5fb5fc2c72c2ce6b921159/src/detect.ts#L39-L53
            NI_AUTO_INSTALL: 'true',
            /* eslint-enable @typescript-eslint/naming-convention */
        },
    })

    if (exitCode !== 0) {
        addExecError({
            toolName,
            toolType: options?.toolType ?? getToolType(toolName),
            stderr: getStderr(
                toolName,
                options?.stderr === true ? [stdout, stderr].filter(Boolean).join('\n') : stderr,
            ),
        })
    }

    return exitCode
}

function serializeInput(input?: string): Buffer | undefined {
    if (input === undefined) {
        return undefined
    }

    return Buffer.from(`${input}\n`)
}

function getToolType(toolName: string): ToolType {
    if (isIncluded(toolName, formatterKeys)) {
        return 'formatter'
    } else if (isIncluded(toolName, linterKeys)) {
        return 'linter'
    } else {
        return 'other'
    }
}

function getStderr(toolName: string, stderr: string): string {
    if (toolName === 'check-dist') {
        return '[DIFF] Detected uncommitted changes after build'
    }

    return stderr
}
