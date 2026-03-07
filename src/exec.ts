import { Buffer } from 'node:buffer'
import { getExecOutput } from '@actions/exec'
import { addExecError } from '@/store'
import { isIncluded } from '@/utils'
import { formatterKeys, linterKeys } from '@/map'
import type { ExecOptions, ToolType } from '@/types'

export async function exec(command: string, args?: string[], options?: ExecOptions): Promise<void> {
    const toolName = options?.toolName ?? command
    const { stderr, exitCode } = await getExecOutput(command, args, {
        input: serializeInput(options?.input),
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
            stderr: getStderr(toolName, stderr),
        })
    }
}

function serializeInput(input?: string): Buffer | undefined {
    if (input === undefined) return undefined

    return Buffer.from(`${input}\n`)
}

function getToolType(toolName: string): ToolType {
    if (isIncluded(toolName, formatterKeys)) return 'formatter'
    if (isIncluded(toolName, linterKeys)) return 'linter'

    return 'other'
}

function getStderr(toolName: string, stderr: string): string {
    switch (toolName) {
        case 'check-dist':
            return '[DIFF] Detected uncommitted changes after build'
        default:
            return stderr
    }
}
