import { Buffer } from 'node:buffer'
import { getExecOutput } from '@actions/exec'
import { addExecError } from '@/store'
import { isIncluded } from '@/utils'
import { formatterKeys, linterKeys } from '@/registries'
import type { ExecOptions, ToolType } from '@/types'

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
            // PERF: Force `stable` so `rustup` ignores `rust-toolchain.toml`.
            ...(toolName === 'cargo-binstall' ? { RUSTUP_TOOLCHAIN: 'stable' } : {}),
            /* eslint-enable @typescript-eslint/naming-convention */
        },
    })

    if (exitCode !== 0) {
        addExecError({
            toolName,
            toolType: options?.toolType ?? getToolType(toolName),
            stderr: getStderr(toolName, [stdout, stderr].filter(Boolean).join('\n')),
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
