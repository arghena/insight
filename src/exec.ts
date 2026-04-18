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
            // PERF: Disable incremental compilation in CI.
            // https://doc.rust-lang.org/cargo/reference/environment-variables.html#environment-variables-cargo-reads
            CARGO_INCREMENTAL: '0',
            // PERF: Install `rustc`, `rust-std`, and `cargo` concurrently.
            // https://rust-lang.github.io/rustup/concepts/profiles.html
            // https://rust-lang.github.io/rustup/environment-variables.html
            RUSTUP_CONCURRENT_DOWNLOADS: '3',
            // PERF: Force `stable` so `rustup` ignores `rust-toolchain.toml`.
            // https://github.com/actions/runner-images/blob/a8a3c8258504963ec70a688d16079d5c43622410/images/ubuntu/scripts/build/install-rust.sh#L14
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
